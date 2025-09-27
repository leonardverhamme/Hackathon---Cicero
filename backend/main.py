from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import uuid
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import os
from typing import Dict, List
from prompts import SUMMARY_PROMPT_TEMPLATE, LEGAL_ASSESSMENT_PROMPT_TEMPLATE, RISK_ASSESSMENT_PROMPT_TEMPLATE
from bey._client import AsyncClient # Import AsyncClient

load_dotenv()

app = FastAPI(title="Aura - AI Act Compliance Copilot")

BEY_API_KEY = os.getenv("BEY_API_KEY")

bey_client = AsyncClient(api_key=BEY_API_KEY) # Initialize AsyncClient

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class TranscriptMessage(BaseModel):
    role: str
    content: str

class ConversationData(BaseModel):
    id: str
    agent_id: str
    transcript: List[TranscriptMessage]

class WebhookPayload(BaseModel):
    event: str
    data: ConversationData

class RiskRequest(BaseModel):
    legal_assessment: str

# In-memory storage for transcripts
TRANSCRIPTS: Dict[str, str] = {}

# Streaming Generators
async def generate_streaming_response(prompt: str):
    """
    Generic generator to stream responses from an OpenAI-compatible API.
    """
    request_data = {
        "model": "gpt-4-turbo", # Using a more common and available model name
        "messages": [{"role": "user", "content": prompt}],
        "stream": True
    }

    # Ensure OPENAI_API_KEY is available
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        yield "[Error: OPENAI_API_KEY is not set in the environment.]"
        return

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            async with client.stream(
                "POST",
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json=request_data
            ) as response:
                if response.status_code != 200:
                    error_body = await response.aread()
                    yield f"[OpenAI API error {response.status_code}: {error_body.decode()}]"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and chunk["choices"]:
                                content = chunk["choices"][0].get("delta", {}).get("content", "")
                                if content:
                                    # CORRECT SSE FORMAT: "data: " prefix and "\n\n" suffix
                                    yield f"data: {json.dumps(content)}\n\n"
                        except json.JSONDecodeError:
                            pass # Ignore empty or malformed lines
        except httpx.RequestError as e:
            yield f"[Error contacting OpenAI: {str(e)}]"
        except Exception as e:
            yield f"[An unexpected error occurred during streaming: {str(e)}]"

# Endpoints
@app.post("/intake")
async def intake(payload: WebhookPayload):
    session_id = str(uuid.uuid4())
    transcript_text = "\n".join([f"{msg.role}: {msg.content}" for msg in payload.data.transcript])
    TRANSCRIPTS[session_id] = transcript_text
    return {"session_id": session_id, "redirect_url": f"/report/{session_id}"}

@app.get("/get_latest_call_transcript")
async def get_latest_call_transcript():
    if not BEY_API_KEY:
        raise HTTPException(status_code=500, detail="BeyondPresence API key not configured.")

    try:
        # Step 1: Fetch a list of recent calls using the BeyClient
        print("Attempting to fetch calls from BeyondPresence API using BeyClient.")
        calls_data = await bey_client.calls.list()
        print(f"Received calls data: {calls_data}")

        if not calls_data.get("data"):
            print("No 'data' key or empty 'data' list in BeyondPresence API response.")
            raise HTTPException(status_code=404, detail="No calls found from BeyondPresence API.")

        # Step 2: Find the latest call from the list by sorting
        latest_call_object = max(calls_data["data"], key=lambda call: datetime.fromisoformat(call['started_at']))
        latest_call_id = latest_call_object['id']

        # Step 3: Retrieve the Call's Messages (The Script) using the BeyClient
        messages = await bey_client.calls.list_messages(latest_call_id)

        if not messages:
            raise HTTPException(status_code=404, detail="No messages found for the latest call.")

        # Assemble the transcript
        transcript_lines = []
        # Sort messages by sent_at to ensure chronological order
        messages.sort(key=lambda msg: msg.sent_at)
        for msg in messages:
            sender = msg.sender.upper()
            text = msg.message
            transcript_lines.append(f"{sender}: {text}")
        
        full_transcript = "\n".join(transcript_lines)
        
        # Store the transcript in memory for agent processing
        session_id = str(uuid.uuid4())
        TRANSCRIPTS[session_id] = full_transcript

        return {"session_id": session_id, "transcript": full_transcript}

    except Exception as e:
        print(f"An unexpected error occurred in get_latest_call_transcript: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/stream_summary/{session_id}")
async def stream_summary(session_id: str):
    if session_id not in TRANSCRIPTS:
        raise HTTPException(status_code=404, detail="Session not found")
    transcript = TRANSCRIPTS[session_id]
    prompt = SUMMARY_PROMPT_TEMPLATE.format(transcript=transcript)
    return StreamingResponse(generate_streaming_response(prompt), media_type="text/plain")

@app.post("/stream_legal_assessment/{session_id}")
async def stream_legal_assessment(session_id: str):
    if session_id not in TRANSCRIPTS:
        raise HTTPException(status_code=404, detail="Session not found")

    # *** IMPLEMENTED 3-SECOND DELAY AS REQUESTED ***
    await asyncio.sleep(3)

    transcript = TRANSCRIPTS[session_id]
    prompt = LEGAL_ASSESSMENT_PROMPT_TEMPLATE.format(transcript=transcript)
    return StreamingResponse(generate_streaming_response(prompt), media_type="text/event-stream")

@app.post("/stream_risk_assessment/{session_id}")
async def stream_risk_assessment(session_id: str, request: RiskRequest):
    # This endpoint now correctly uses the legal assessment from the request body
    if not request.legal_assessment:
        raise HTTPException(status_code=400, detail="Legal assessment text cannot be empty.")

    prompt = RISK_ASSESSMENT_PROMPT_TEMPLATE.format(legal_assessment_text=request.legal_assessment)
    return StreamingResponse(generate_streaming_response(prompt), media_type="text/event-stream")

# The generic /chat/completions endpoint has been removed to avoid confusion.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
