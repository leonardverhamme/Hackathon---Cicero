from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import httpx
import json
import uuid
from dotenv import load_dotenv
import os
from typing import Dict, List

load_dotenv()

app = FastAPI(title="Aura - AI Act Compliance Copilot")

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
async def generate_streaming_response(prompt: str, response_format=None):
    request_data = {
        "model": "gpt-4o-2024-08-06",
        "messages": [{"role": "user", "content": prompt}],
        "stream": True
    }
    if response_format:
        request_data["response_format"] = response_format

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json=request_data
        )

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
                            yield content
                except:
                    pass

# Endpoints
@app.post("/intake")
async def intake(payload: WebhookPayload):
    session_id = str(uuid.uuid4())
    transcript_text = "\n".join([f"{msg.role}: {msg.content}" for msg in payload.data.transcript])
    TRANSCRIPTS[session_id] = transcript_text
    return {"session_id": session_id, "redirect_url": f"/report/{session_id}"}

@app.post("/stream_summary/{session_id}")
async def stream_summary(session_id: str):
    if session_id not in TRANSCRIPTS:
        raise HTTPException(status_code=404, detail="Session not found")
    transcript = TRANSCRIPTS[session_id]
    prompt = f"Summarize this user's description of their AI feature into a concise, easy-to-read paragraph: '{transcript}'"
    return StreamingResponse(generate_streaming_response(prompt), media_type="text/plain")

@app.post("/stream_legal_assessment/{session_id}")
async def stream_legal_assessment(session_id: str):
    if session_id not in TRANSCRIPTS:
        raise HTTPException(status_code=404, detail="Session not found")
    transcript = TRANSCRIPTS[session_id]
    # PRODUCTION: In a real build, the 'legal_context' below would be dynamically retrieved from our Weaviate vector database based on the transcript.
    prompt = f"""You are a legal analyst specializing in the EU AI Act, focusing on HR Tech. Your task is to analyze the user's AI feature, as described in the conversation transcript, against the provided EU AI Act articles. For each relevant article, provide a brief, structured analysis of how it applies to the user's AI feature, explicitly referencing details from the transcript where applicable.

**Beyond Presence Conversation Transcript:**
'{transcript}'

**Provided EU AI Act Articles (relevant to HR Tech):**
- **Article 10 (Data and data governance):** 'Training, validation and testing data sets shall be subject to appropriate data governance and management practices... free of errors and complete... relevant, representative...'
    - *Consider how the AI's data processing (Question 2) and affected individuals (Question 4) relate to data quality, representativeness, and bias mitigation.*
- **Article 14 (Human oversight):** 'High-risk AI systems shall be designed and developed in such a way that they can be effectively overseen by natural persons... to prevent or minimise the risks...'
    - *Evaluate the AI's impact on HR decisions (Question 3) and the need for human intervention or control.*
- **Article 13 (Transparency and provision of information to users):** 'High-risk AI systems shall be designed and developed in such a way to ensure that their operation is sufficiently transparent to enable users to interpret the system’s output and use it appropriately.'
    - *Assess the clarity of the AI's output (Question 5) and how it enables human users to understand and interpret its results.*
- **Annex III, Point 4 (Employment, workers’ management and access to self-employment):** This section classifies AI systems used for recruitment, selection, performance management, task allocation, and monitoring of employees as high-risk.
    - *Directly connect the AI's purpose in the employment lifecycle (Question 1) to its classification as high-risk under this Annex.*

Generate a structured JSON analysis now, with a clear analysis for each article, linking back to the transcript details and the specific Beyond Presence questions where relevant.
"""

    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "legal_assessment",
            "schema": {
                "type": "object",
                "properties": {
                    "article_10_analysis": {
                        "type": "string",
                        "description": "Analysis of how Article 10 (Data and data governance) applies to the AI feature, referencing transcript details."
                    },
                    "article_14_analysis": {
                        "type": "string",
                        "description": "Analysis of how Article 14 (Human oversight) applies to the AI feature, referencing transcript details."
                    },
                    "article_13_analysis": {
                        "type": "string",
                        "description": "Analysis of how Article 13 (Transparency and provision of information to users) applies to the AI feature, referencing transcript details."
                    },
                    "annex_iii_point_4_classification": {
                        "type": "string",
                        "description": "Classification of the AI system as high-risk under Annex III, Point 4, referencing transcript details."
                    }
                },
                "required": ["article_10_analysis", "article_14_analysis", "article_13_analysis", "annex_iii_point_4_classification"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
    return StreamingResponse(generate_streaming_response(prompt, response_format), media_type="application/json")

@app.post("/stream_risk_assessment/{session_id}")
async def stream_risk_assessment(session_id: str, request: RiskRequest):
    prompt = f"""You are a senior legal partner specializing in EU AI Act compliance for HR Tech. Your task is to provide a final, conclusive risk assessment based on the detailed legal analysis provided.

**Legal Assessment:**
{request.legal_assessment}

Based on this legal assessment, determine the appropriate recommendation. Stream a brief, decisive explanation for your choice, directly linking your justification to the findings in the legal assessment. Conclude with either 'Recommendation: Human Lawyer Advised' or 'Recommendation: Standard Compliance Procedure'.
"""

    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "risk_assessment",
            "schema": {
                "type": "object",
                "properties": {
                    "recommendation": {
                        "type": "string",
                        "enum": ["Human Lawyer Advised", "Standard Compliance Procedure"],
                        "description": "The recommended course of action based on the legal analysis"
                    },
                    "justification": {
                        "type": "string",
                        "description": "Brief explanation for the recommendation, directly referencing the legal assessment findings."
                    }
                },
                "required": ["recommendation", "justification"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
    return StreamingResponse(generate_streaming_response(prompt, response_format), media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
