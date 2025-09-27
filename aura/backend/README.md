# Aura Backend - AI Act Compliance Copilot

This is the FastAPI backend for Aura, an AI-powered compliance co-pilot for HR Tech companies like Maki, optimized for hackathon demos.

## Setup

1. **Python Version**: Ensure Python 3.9+ is installed.

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**: Fill in your OpenAI API key in `.env`:
   - `OPENAI_API_KEY`: Your OpenAI API key

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`.

## API Endpoints

- `POST /intake`: Receives webhook from Beyond Presence, stores transcript, returns session_id and redirect URL
- `POST /stream_summary/{session_id}`: Streams a live summary for the session
- `POST /stream_legal_assessment/{session_id}`: Streams legal analysis based on hardcoded EU AI Act articles
- `POST /stream_risk_assessment/{session_id}`: Streams final risk triage (requires legal_assessment in request body)

## Webhook Integration

Beyond Presence sends POST to `/intake` with:
```json
{
  "event": "conversation.completed",
  "data": {
    "id": "conversation_12345",
    "agent_id": "agent_67890",
    "transcript": [
      {"role": "user", "content": "..."},
      {"role": "agent", "content": "..."}
    ]
  }
}
```

Response: `{"session_id": "uuid", "redirect_url": "/report/uuid"}`

## Streaming Flow

Frontend redirects to report page with session_id, then:
1. Parallel POST to `/stream_summary/{session_id}` and `/stream_legal_assessment/{session_id}`
2. Capture full legal assessment text
3. POST to `/stream_risk_assessment/{session_id}` with `{"legal_assessment": "captured text"}`

## Architecture

- **Real-Time Streaming**: Uses OpenAI's streaming API for live-typing effect
- **Parallel Frontend Fetching**: Summary and legal assessment can run simultaneously
- **Simulated RAG**: Legal analysis uses pre-selected EU AI Act articles in the prompt
- **Hackathon Optimized**: Simplified for fast, reliable demo execution

## Demo Flow

1. User completes conversation with "Julian" on Beyond Presence
2. Frontend captures transcript and initiates parallel streams to `/stream_summary` and `/stream_legal_assessment`
3. Once legal assessment completes, frontend streams to `/stream_risk_assessment` with the captured analysis
4. All results display in real-time for an impressive demo experience
