# Cicero Backend - AI Act Compliance Copilot

This is the FastAPI backend for Cicero, an AI-powered compliance co-pilot for HR Tech companies like Maki.

## Setup

1. **Python Version**: Ensure Python 3.9+ is installed.

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**: Copy `.env` and fill in your API keys:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `WEAVIATE_URL`: Your Weaviate Cloud instance URL
   - `WEAVIATE_API_KEY`: Your Weaviate API key

4. **Weaviate Setup**:
   - Run the ingestion script: `python ../scripts/ingest_weaviate.py`
   - Ensure the AI_Act.pdf is in `../docs/`

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`.

## API Endpoints

- `POST /intake`: Receives webhook from Beyond Presence, starts analysis
- `GET /report/{session_id}`: Polls for report status and data

## Architecture

- **Parallel Processing**: All 14 agents (2 OpenAI + 12 Weaviate) run concurrently using `asyncio.gather()`
- **In-Memory Storage**: Reports stored in memory (for demo; use database for production)
- **Async/Await**: Fully asynchronous for high performance

## Deployment

For production, deploy to a cloud service with persistent storage and proper error handling.
