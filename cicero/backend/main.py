from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import asyncio
import httpx
import weaviate
from dotenv import load_dotenv
import os
import uuid
from typing import Dict, List, Optional

load_dotenv()

app = FastAPI(title="Cicero - AI Act Compliance Copilot")

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

class Report(BaseModel):
    status: str
    summary: Optional[str] = None
    risk_assessment: Optional[Dict] = None
    annex_reports: Optional[Dict[str, str]] = None

# In-memory storage
REPORTS: Dict[str, Report] = {}

# OpenAI Agents
async def openai_summary_agent(transcript: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json={
                "model": "gpt-4-turbo",
                "messages": [
                    {"role": "system", "content": "You are a compliance expert. Summarize the key points from this conversation about an AI feature for HR hiring and its potential impact."},
                    {"role": "user", "content": transcript}
                ]
            }
        )
        return response.json()["choices"][0]["message"]["content"]

async def openai_risk_agent(transcript: str) -> Dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json={
                "model": "gpt-4-turbo",
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": "Analyze the risk level of this AI feature under the EU AI Act. Return JSON with 'risk_level' (high/medium/low) and 'justification'."},
                    {"role": "user", "content": transcript}
                ]
            }
        )
        return response.json()["choices"][0]["message"]["content"]

# Weaviate Agents
def weaviate_agent(topic: str, transcript: str) -> str:
    client = weaviate.Client(
        url=os.getenv("WEAVIATE_URL"),
        auth_client_secret=weaviate.AuthApiKey(os.getenv("WEAVIATE_API_KEY"))
    )
    result = client.query.get("AI_Act_Article", ["content"]).with_generate(
        single_prompt=f"Based on the EU AI Act, provide specific guidance on {topic} requirements for this HR AI feature. Feature: {transcript}"
    ).with_near_text({"concepts": [topic]}).do()
    return result["data"]["Get"]["AI_Act_Article"][0]["_additional"]["generate"]["singleResult"]

# Process Analysis
async def process_analysis(session_id: str, transcript: List[TranscriptMessage]):
    transcript_text = "\n".join([f"{msg.role}: {msg.content}" for msg in transcript])

    tasks = []
    tasks.append(openai_summary_agent(transcript_text))
    tasks.append(openai_risk_agent(transcript_text))

    annex_topics = [
        "risk management",
        "data governance",
        "technical documentation",
        "logging and record-keeping",
        "transparency to users",
        "human oversight",
        "accuracy and robustness",
        "quality management system",
        "conformity assessment",
        "EU database registration",
        "post-market monitoring",
        "CE marking"
    ]

    for topic in annex_topics:
        tasks.append(asyncio.to_thread(weaviate_agent, topic, transcript_text))

    results = await asyncio.gather(*tasks)

    summary = results[0]
    risk = results[1]
    annex_reports = {topic: results[i+2] for i, topic in enumerate(annex_topics)}

    REPORTS[session_id] = Report(
        status="complete",
        summary=summary,
        risk_assessment=risk,
        annex_reports=annex_reports
    )

# Endpoints
@app.post("/intake")
async def intake(payload: WebhookPayload, background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4())
    REPORTS[session_id] = Report(status="processing")
    background_tasks.add_task(process_analysis, session_id, payload.data.transcript)
    return {"session_id": session_id}

@app.get("/report/{session_id}")
async def get_report(session_id: str):
    if session_id not in REPORTS:
        raise HTTPException(status_code=404, detail="Session not found")
    report = REPORTS[session_id]
    if report.status == "processing":
        return {"status": "processing"}
    return report.dict()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
