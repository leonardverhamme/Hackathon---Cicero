# Cicero: Your AI-Powered Legal Management Platform

## 🚀 Project Overview

Cicero is an innovative AI-powered Legal Management Platform designed for the modern legal professional, especially within the HR Tech compliance domain. This hackathon project demonstrates a frictionless workflow where legal tasks, initiated by a "Beyond Presence Call Agent," are automatically processed by a FastAPI backend. The system provides real-time, streaming AI-generated legal summaries, detailed EU AI Act assessments, and actionable next steps, all presented within a sleek, intuitive "Legal Mailbox" UI.

**The Problem:** Navigating complex legal frameworks like the EU AI Act for HR Tech companies is time-consuming and resource-intensive. Legal professionals need quick, accurate insights to assess compliance risks and guide clients effectively.

**Our Solution (Cicero):** We streamline the initial legal intake and assessment process. Instead of traditional calls, lawyers receive "tasks" in their digital inbox. Upon "playing" a task, an AI agent processes a client conversation transcript, delivering a live, structured legal analysis. This allows for rapid triage, identifying cases needing immediate human lawyer intervention versus those that can proceed with standard automated procedures.

## ✨ Key Features

### Backend (FastAPI)
- **Frictionless Intake:** Receives client conversation transcripts via webhook (simulating a "Beyond Presence" call completion).
- **Three Streaming AI Agents:**
    1.  **Summary Agent:** Provides a concise, executive-level summary of the client's AI feature.
    2.  **Legal Assessment Agent:** Generates a structured analysis against specific EU AI Act articles relevant to HR Tech (e.g., Data Governance, Human Oversight, Transparency, High-Risk Classification).
    3.  **Legal Summary & Next Steps Agent:** Offers a high-level legal summary, determines if human legal advice is needed, and assesses the case complexity for internal office assignment (Standard HR Tech Compliance vs. Complex AI Ethics & Governance).
- **Real-time Streaming:** All AI responses are streamed token-by-token, providing a "live-typing" experience in the UI.
- **Modular Prompts:** Agent prompts are externalized in `prompts.py` for easy modification and clarity.
- **Hackathon Optimized:** In-memory transcript storage for speed and simplicity; easily extendable for production.

### Frontend (Planned - "Legal Mailbox" UI)
- **Intuitive Dashboard/Inbox:** A central hub displaying pending legal tasks (Beyond Presence calls) and a history of completed assessments.
- **"Play" Button:** Initiates the AI assessment process for a pending task.
- **Live Report View:** Dedicated page for real-time display of streaming outputs from all three AI agents.
- **Actionable Buttons:**
    - **Download Full Report:** Exports the complete AI assessment.
    - **Schedule Meeting with Lawyer:** Facilitates booking a follow-up.
    - **Save to Account:** Simulates saving the report to the platform's history.
- **Modern Design:** Frictionless, visually appealing interface with rounded corners, smooth animations, and a professional aesthetic.

## 🏗️ Architecture

### Backend
- **Framework:** FastAPI (Python) for high performance and ease of use.
- **AI Integration:** OpenAI Chat Completions API (`gpt-5-2025-08-07`) with `stream=True` for real-time output.
- **HTTP Client:** `httpx` for asynchronous API calls.
- **Environment Management:** `python-dotenv` for secure API key handling.
- **Data Storage (Hackathon):** In-memory dictionary for temporary transcript storage.
- **CORS:** Permissive for hackathon demo; to be tightened in production.

### Frontend (Planned)
- **Framework:** React (e.g., with Vite for fast development).
- **Styling:** Tailwind CSS for rapid UI development and a modern look.
- **Communication:** `fetch` API or `axios` for interacting with the FastAPI backend, specifically handling Server-Sent Events (SSE) for streaming.

## 🚀 Demo Flow (End-to-End)

1.  **Lawyer Logs In:** User accesses the Cicero platform (already logged in state).
2.  **View Inbox:** The Dashboard/Inbox displays a list of pending legal tasks, each representing a completed Beyond Presence client call.
3.  **Initiate Assessment:** The lawyer clicks the "Play" button on a pending task.
4.  **Backend Intake:** The UI sends a simulated webhook payload (client transcript) to the FastAPI `/intake` endpoint. The backend stores the transcript and returns a `session_id`.
5.  **Live Report View:** The UI automatically navigates to the `/report/:session_id` page.
6.  **Parallel Streaming:** The frontend simultaneously initiates streaming requests to:
    - `/stream_summary/:session_id`
    - `/stream_legal_assessment/:session_id`
7.  **Sequential Streaming:** Once the Legal Assessment stream completes, its full text is captured by the UI and sent to:
    - `/stream_risk_assessment/:session_id` (now the "Legal Summary & Next Steps" agent).
8.  **Real-time Display:** All three agent outputs are displayed live, character-by-character, in their respective sections on the UI.
9.  **Actionable Insights:** The lawyer can then:
    - Download the full report.
    - Schedule a meeting with a human lawyer (if recommended).
    - Save the report to their account history.

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.9+
- An OpenAI API Key

### Backend Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/leonardverhamme/Hackathon---Cicero.git
    cd Hackathon---Cicero
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # On Windows
    source venv/bin/activate # On macOS/Linux
    ```
4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Configure Environment Variables:**
    - Create a `.env` file in the `backend/` directory.
    - Add your OpenAI API key:
      ```
      OPENAI_API_KEY=sk-your-openai-key-here
      ```
      *(Note: The `WEAVIATE_URL` and `WEAVIATE_API_KEY` are no longer used in the current backend implementation but are kept in `.env` for historical context or future RAG enhancements.)*

### Frontend Setup (Placeholder - UI will be delivered separately)
*(Instructions for setting up the React/Next.js/Vite frontend will go here once the UI project is available.)*

## ▶️ How to Run

### 1. Start the Backend Server
From the `backend/` directory:
```bash
python main.py
```
The server will start on `http://0.0.0.0:8001`.

### 2. Run Integration Tests (Optional)
While the backend server is running (in a separate terminal), you can test the full agent flow:
From the `backend/` directory:
```bash
python test_intake.py
```
This script will simulate an intake call and print the streamed outputs from all three agents.

## 🌐 API Endpoints (Backend)

All endpoints are designed for streaming `text/plain` responses.

-   **`POST /intake`**
    -   **Description:** Receives a simulated webhook payload containing a client conversation transcript.
    -   **Request Body (JSON):**
        ```json
        {
          "event": "conversation.completed",
          "data": {
            "id": "conversation_12345",
            "agent_id": "agent_67890",
            "transcript": [
              {"role": "user", "content": "I need help with AI compliance..."},
              {"role": "agent", "content": "What features...?"}
            ]
          }
        }
        ```
    -   **Response (JSON):**
        ```json
        { "session_id": "uuid", "redirect_url": "/report/uuid" }
        ```

-   **`POST /stream_summary/{session_id}`**
    -   **Description:** Streams a concise summary of the client's AI feature.
    -   **Response:** `text/plain` (streaming)

-   **`POST /stream_legal_assessment/{session_id}`**
    -   **Description:** Streams a structured legal analysis against key EU AI Act articles.
    -   **Response:** `text/plain` (streaming)
    -   *Note: In a production environment, this agent would query a vector database (e.g., Weaviate) to retrieve relevant legal articles as context before generating the assessment. For this hackathon, it uses a fixed, detailed prompt.*

-   **`POST /stream_risk_assessment/{session_id}`** (now "Legal Summary & Next Steps")
    -   **Description:** Streams a high-level legal summary and recommended next steps, including human lawyer triage and internal office assignment.
    -   **Request Body (JSON):**
        ```json
        { "legal_assessment": "<full text captured from /stream_legal_assessment>" }
        ```
    -   **Response:** `text/plain` (streaming)

## 🧠 Agent Prompts

The detailed prompts for each agent are stored in `backend/prompts.py` for clarity and easy modification. They are designed to guide the `gpt-5-2025-08-07` model to produce structured, relevant, and actionable outputs.

## 💡 Future Enhancements & Production Hardening

-   **Persistent Storage:** Replace in-memory transcript storage with a database (e.g., PostgreSQL, SQLite, Redis) for durability.
-   **Authentication & Authorization:** Implement user authentication and restrict API access.
-   **Rate Limiting:** Protect against abuse and manage API costs.
-   **Robust Error Handling:** More sophisticated error handling, logging, and retry mechanisms.
-   **Vector Database Integration:** Fully integrate a vector database (like Weaviate) for dynamic RAG (Retrieval Augmented Generation) in the legal assessment agent, grounding responses in real-time legal documents.
-   **Advanced UI Features:** Implement full user management, task assignment, and detailed report analytics within the frontend.
-   **Dockerization:** Containerize the backend for easier deployment and scalability.

## 🤝 Technologies Used

-   **Backend:** Python, FastAPI, Uvicorn, httpx, python-dotenv
-   **AI Model:** OpenAI GPT-5 (2025-08-07)
-   **Frontend (Planned):** React, Tailwind CSS (recommended)

## 👥 Team & Acknowledgements

*(Placeholder for team members and any special acknowledgements for the hackathon.)*
