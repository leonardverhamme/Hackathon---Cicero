# Cicero: Your AI-Powered Legal Management Platform - Paris AI Hackathon

## 🚀 Project Overview & Vision

Cicero is an innovative, AI-powered Legal Management Platform designed to revolutionize the legal industry from both the client and lawyer perspectives. Our core vision is to create a complete, frictionless platform for legal management, replacing traditional, bulky email communications with intelligent AI agents. This system streamlines the entire legal workflow, from initial client intake to real-time legal assessments and automated communication, providing unprecedented clarity and efficiency.

**The Problem:** The legal landscape is often characterized by inefficient communication, time-consuming compliance processes (especially with complex frameworks like the EU AI Act for HR Tech), and a lack of transparency in billing. Legal professionals spend valuable time on administrative tasks, while clients often struggle to understand legal jargon and track their cases.

**Our Solution (Cicero):** Cicero addresses these challenges by introducing AI agents that act as a bridge between clients and lawyers. Instead of scheduling inefficient calls or sending long emails, lawyers can dispatch AI agents (in the form of Beyond Presence calling agents) to conduct initial intake calls. These calls are transcribed, summarized, and used to query a legal knowledge base (mocked in the demo, with future Weaviate integration). The system then provides real-time, streaming AI-generated legal summaries, detailed EU AI Act assessments, and actionable next steps, all presented within a sleek, intuitive "Legal Mailbox" UI. This allows for rapid triage, identifying cases needing immediate human lawyer intervention versus those that can proceed with standard automated procedures.

Cicero aims to be the first truly convenient legal management system, offering a complete platform where clients have all their legal cases and advice in one place, and lawyers are better prepared with less administrative burden.

## ✨ Core Features

### AI Agents & Automated Communication Flow
*   **Frictionless Intake via Beyond Presence Call Agents:** Lawyers can send an AI agent (powered by Beyond Presence) to conduct initial intake calls with clients. This replaces the need for manual email exchanges or scheduling calls for basic information gathering.
*   **Intelligent Inbox:** The platform's inbox is not just for emails; it can be populated with audio and video agents from Beyond Presence, offering a dynamic and interactive communication experience.
*   **Automated Call Processing:**
    1.  **Online Call:** The Beyond Presence agent conducts an online call with the client.
    2.  **Transcription:** The call is automatically transcribed.
    3.  **Summarization:** The transcript is summarized by an OpenAI agent.
    4.  **Knowledge Base Query:** The transcribed content is used to query a vector database (mocked in the demo, future integration with Weaviate) containing legal laws and precedents, connecting the client's case with relevant legal bases.
*   **Benefits:** This process significantly reduces preparation work for lawyers and provides clients with clear, non-legal language summaries, fostering better understanding and communication.

### Legal Assessment & Summaries (Powered by OpenAI Agents)
Cicero employs three streaming AI agents to provide comprehensive legal analysis:
1.  **Summary Agent:** Provides a concise, executive-level summary of the client's AI feature or legal query.
2.  **Legal Assessment Agent:** Generates a structured analysis against specific EU AI Act articles relevant to HR Tech (e.g., Data Governance, Human Oversight, Transparency, High-Risk Classification). This assessment is presented in full legal language for the lawyer.
3.  **Legal Summary & Next Steps Agent:** Offers a high-level legal summary in non-legal language for the client, determines if human legal advice is needed, and assesses the case complexity for internal office assignment (e.g., "Standard HR Tech Compliance" vs. "Complex AI Ethics & Governance"). It also outlines clear next tasks for the client, which are then communicated to the lawyer to maintain an automated workflow.

### Case Management (`My Cases`)
*   **Case Overview:** Provides an easy-to-understand overview of all legal assessments and ongoing cases.
*   **Centralized Legal Hub:** Clients have a single platform to manage all their legal cases and receive advice.
*   **Future Multi-Party Platform:** The vision includes connecting multiple lawyers and clients, creating a comprehensive two-way platform for legal services.

### Billing System (`Bills`)
*   **Transparent Billing:** Addresses the current vagueness in legal office billing by providing clear, itemized bills.
*   **Digital Invoices:** Clients receive bills with outstanding items, with options to download detailed invoices.
*   **Integrated Payments:** A "Pay Now" feature with Stripe implementation allows for immediate and convenient payment processing.

### User Interface (Designed with Lovable)
*   **Intuitive "Legal Mailbox" UI:** A central hub displaying pending legal tasks (Beyond Presence calls) and a history of completed assessments.
*   **"Play" Button:** Initiates the AI assessment process for a pending task, leading to a live report view.
*   **Live Report View:** A dedicated page for real-time display of streaming outputs from all three AI agents, providing a "live-typing" experience.
*   **Actionable Buttons:** Includes options to "Download Full Report," "Schedule Meeting with Lawyer" (if recommended), and "Save to Account" (simulating saving the report to the platform's history).
*   **Modern Design:** A frictionless, visually appealing interface with rounded corners, smooth animations, and a professional aesthetic, designed using Lovable.

## 🏗️ Architecture & Technologies

### Backend
*   **Framework:** FastAPI (Python) for building high-performance APIs.
*   **AI Integration:** OpenAI Chat Completions API (`gpt-4-turbo`) with `stream=True` for real-time output from AI agents.
*   **Video Agents:** Beyond Presence (`bey-client`) for initiating and managing AI-driven video calls and fetching transcripts.
*   **HTTP Client:** `httpx` for asynchronous API calls.
*   **Environment Management:** `python-dotenv` for secure handling of API keys.
*   **Data Storage (Hackathon):** In-memory dictionary for temporary transcript storage, optimized for speed and simplicity during the hackathon.
*   **CORS:** Permissive for hackathon demo, to be tightened in production.

### Frontend
*   **Framework:** React (with Vite for fast development).
*   **Language:** TypeScript for type safety and improved developer experience.
*   **Styling:** Tailwind CSS for rapid UI development and a modern, utility-first approach.
*   **UI Components:** shadcn-ui for pre-built, accessible, and customizable UI components.
*   **Routing:** `react-router-dom` for client-side navigation.
*   **State Management/Data Fetching:** `@tanstack/react-query` for efficient data fetching, caching, and synchronization.
*   **Communication:** `fetch` API for interacting with the FastAPI backend, specifically handling Server-Sent Events (SSE) for streaming AI responses.
*   **UI Design Tool:** Lovable was used for the UI design and rapid prototyping.

### Technologies Used (Summary)
*   **Backend:** Python, FastAPI, Uvicorn, httpx, python-dotenv, Beyond Presence (`bey-client`), OpenAI GPT-4 Turbo.
*   **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui, react-router-dom, @tanstack/react-query, Lovable.
*   **Future Integrations:** Weaviate (Vector Database), Stripe.

## 🚀 Demo Flow (End-to-End)

1.  **Lawyer Logs In:** A lawyer accesses the Cicero platform (already in a logged-in state for the demo).
2.  **View Inbox:** The "Inbox" dashboard displays a list of pending legal tasks, each representing a completed Beyond Presence client call or a new request from a lawyer.
3.  **Initiate AI Meeting:** The lawyer clicks the "Start AI Meeting" button on a pending task. This launches a Beyond Presence video agent.
4.  **Call Completion & Transcript Fetch:** After the Beyond Presence call is "finished" (simulated by clicking "Call Finished" in the UI), the frontend triggers an API call to `/get_latest_call_transcript` on the FastAPI backend. The backend uses the `bey-client` to fetch the actual transcript from Beyond Presence.
5.  **Backend Intake & Session ID:** The backend stores the fetched transcript in memory and generates a unique `session_id`, returning it to the frontend along with a `redirect_url`.
6.  **Live Report View:** The UI automatically navigates to the `/report/:session_id` page, displaying the `FocusWindow`.
7.  **Parallel Streaming of AI Agents:** The frontend simultaneously initiates streaming requests to the backend for:
    *   `/stream_summary/:session_id` (Summary Agent)
    *   `/stream_legal_assessment/:session_id` (Legal Assessment Agent)
8.  **Sequential Streaming of Risk Assessment:** Once the Legal Assessment stream completes, its full text is captured by the UI and then sent as a `postBody` to `/stream_risk_assessment/:session_id` (Legal Summary & Next Steps Agent).
9.  **Real-time Display:** All three agent outputs are displayed live, character-by-character, in their respective sections on the UI, providing an engaging "live-typing" experience.
10. **Actionable Insights:** The lawyer can then:
    *   Download the full report.
    *   Schedule a meeting with a human lawyer (if the AI recommends it).
    *   Save the report to their account history.
11. **Task Completion:** The lawyer marks the task as complete, moving it to the "Recently Completed" section in the Inbox.

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js & npm (for frontend)
- An OpenAI API Key
- A Beyond Presence API Key

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
    - Add your OpenAI API key and Beyond Presence API key:
      ```
      OPENAI_API_KEY=sk-your-openai-key-here
      BEY_API_KEY=your-beyond-presence-api-key-here
      ```
      *(Note: `WEAVIATE_URL` and `WEAVIATE_API_KEY` are present for future RAG enhancements but not actively used in the current demo backend.)*

### Frontend Setup
1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm i
    ```

## ▶️ How to Run

### 1. Start the Backend Server
From the `backend/` directory (with your virtual environment activated):
```bash
python main.py
```
The server will start on `http://0.0.0.0:8001`.

### 2. Start the Frontend Development Server
From the `frontend/` directory:
```bash
npm run dev
```
The frontend application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

### 3. Run Integration Tests (Optional)
While the backend server is running (in a separate terminal), you can test the full agent flow:
From the `backend/` directory:
```bash
python test_intake.py
```
This script will simulate an intake call and print the streamed outputs from all three agents to your terminal.

## 🌐 API Endpoints (Backend)

All endpoints are designed for streaming `text/plain` or `text/event-stream` responses.

-   **`POST /intake`**
    -   **Description:** Receives a simulated webhook payload containing a client conversation transcript (used for initial demo setup).
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

-   **`GET /get_latest_call_transcript`**
    -   **Description:** Fetches the latest call transcript from the Beyond Presence API using the configured `BEY_API_KEY`. This is used by the frontend after a simulated call completion.
    -   **Response (JSON):**
        ```json
        { "session_id": "uuid", "transcript": "Full conversation transcript..." }
        ```

-   **`POST /stream_summary/{session_id}`**
    -   **Description:** Streams a concise summary of the client's AI feature based on the stored transcript.
    -   **Response:** `text/plain` (streaming)

-   **`POST /stream_legal_assessment/{session_id}`**
    -   **Description:** Streams a structured legal analysis against key EU AI Act articles, based on the stored transcript. Includes a 3-second delay to simulate complex processing.
    -   **Response:** `text/event-stream` (streaming)
    -   *Note: In a production environment, this agent would query a vector database (e.g., Weaviate) to retrieve relevant legal articles as context before generating the assessment. For this hackathon, it uses a fixed, detailed prompt.*

-   **`POST /stream_risk_assessment/{session_id}`** (now "Legal Summary & Next Steps")
    -   **Description:** Streams a high-level legal summary and recommended next steps, including human lawyer triage and internal office assignment, based on the full legal assessment provided in the request body.
    -   **Request Body (JSON):**
        ```json
        { "legal_assessment": "<full text captured from /stream_legal_assessment>" }
        ```
    -   **Response:** `text/event-stream` (streaming)

## 🧠 Agent Prompts

The detailed prompts for each AI agent are externalized in `backend/prompts.py` for clarity, modularity, and easy modification. They are meticulously designed to guide the OpenAI `gpt-4-turbo` model to produce structured, relevant, and actionable outputs tailored for legal analysis.

## 💡 Future Enhancements & Production Hardening

Cicero is built with scalability and future development in mind. Here are key areas for enhancement:

*   **Persistent Storage:** Replace the current in-memory transcript storage with a robust database solution (e.g., PostgreSQL, SQLite, Redis) for data durability and retrieval.
*   **Authentication & Authorization:** Implement comprehensive user authentication and role-based authorization to secure API access and manage user permissions.
*   **Rate Limiting:** Introduce rate limiting to protect against API abuse and manage operational costs effectively.
*   **Robust Error Handling:** Develop more sophisticated error handling, logging, and retry mechanisms for increased system resilience.
*   **Vector Database Integration (Weaviate):** Fully integrate a vector database like Weaviate for dynamic RAG (Retrieval Augmented Generation) in the legal assessment agent. This will allow grounding AI responses in real-time legal documents and case law.
*   **Advanced UI Features:** Implement full user management, task assignment workflows, detailed report analytics, and customizable dashboards within the frontend.
*   **Dockerization:** Containerize both the backend and frontend applications using Docker for easier deployment, scalability, and environment consistency.
*   **Speech-to-Speech Technology:** Integrate advanced speech-to-speech technology to enable direct voice interaction with AI lawyers, allowing the AI to access specific case details in real-time.
*   **Multi-Lawyer/Client Platform:** Expand the platform to connect multiple lawyers and clients, creating a comprehensive two-way marketplace for legal services.
*   **Stripe Integration for Payments:** Fully integrate Stripe for seamless and secure processing of bill payments.

## # Hackathon Manual - Paris

### Important Links:

Discord Server - https://discord.gg/brSqTjJVdh

Project Submission - soon

Location: https://www.lamaison.ai/

Viral Content Challenge: https://tally.so/r/mDQPlR

### Agenda

#### Saturday

09:30 - Door’s Open & Networking

10:00 - Opening & Matchmaking

12:30 - Lunch

18:30 - Dinner

#### Sunday

12:30 - Lunch

14:00 - Project Submission Deadline

15:00 - Announcement of Finalists

15:15 - Finalist Pitches

16:30 - Award Ceremony

### Hackathon Theme & Prizes

#### Open Innovation

The main goal of the Hackathon is to build an AI solution that shows innovation, creativity, and technical skill. Use at least three of the provided technologies (see Resources) and any others you choose to create something that solves a real problem or opens new opportunities.

This is your playground - aim for projects that are novel, impactful, and scalable.

#### 1st Place

- 250€ Amazon voucher per person
- 1500$ OpenAI Credits
- 1500€ Weaviate Credits
- 3 month free access to Lovable

#### 2nd Place

- 1000$ OpenAI Credits
- 1000€ Weaviate Credits
- 3 month free access to Lovable

#### 3rd Place

- 500$ OpenAI Credits
- 500€ Weaviate Credits
- 3 month free access to Lovable

#### Viral Content Challenge

Win 100€ Amazon voucher by creating the most viral content piece around the Paris AI Hackathon.

It can be on the platform of your choice and can cover everything from the hackathon experience, your project, or just fund content.

But it has to mention the Hackathon & {Tech: Europe}

Submit your content piece: https://tally.so/r/mDQPlR

### Jury

Benedict Kerres - OpenAI

Benjamin Chino - MakiPeople

Jamie Ogundiran - ACI.dev

Nicola de Angeli - Beyond Presence

Katie Hallet - Lightpanda

Jules Belveze - Dust

### **Competition Rules & Submission Guidelines**

To compete in the hackathon and have your project considered by the jury, all participants must adhere to the following rules and submission requirements. Failure to meet these guidelines may result in disqualification.

---

### **Submission Requirements**

To qualify for the final judging, you must [**submit your project by Sunday at 14:00**](https://tally.so/r/wkq1D1) as a team of 1-5 people and use a **minimum of 3 of the provided partner technologies:**

#### What needs to be submitted

**Project Presentation**

- Record a **2-minute video demo** of your project (using Loom or equivalent platform)
- Your presentation must include:
    - Detailed explanation of your solution
    - Demonstration of key features with a live walkthrough

**Open Source Repository**

- Provide a **public GitHub repository** containing your project's source code
- Your repository must include:
    - Comprehensive **README** with setup and installation instructions
    - Clear documentation of all APIs, frameworks, and tools utilized
    - Sufficient technical documentation to enable thorough jury evaluation

---

### **Competition Mode**

Our hackathon features a **dynamic two-stage competition format**, culminating in a **live final presentation** event.

#### Stage 1: Pre-Selection

- Build anything aligned with your creative vision - complete freedom of topic choice
- **6 teams** will advance to the Finalist Stage
- Judging criteria: creativity, technical complexity, with bonus points for effective use of partner technologies

#### Stage 2: Finalist Stage

- All finalists will showcase their projects **live before the jury and audience**
- Each team delivers a **5-minute presentation**
- After all presentations, the jury will select the **top 3 winners**
- These top 3 teams will be awarded the Finalist Stage Prizes

## Resources (Partner Tech & more)

### Infrastructure Partners

OpenAI → Fill out the form: https://forms.gle/hHoPQ47exShoeiMq7 

[Weaviate](https://weaviate.io/) - Vector Database → Generous Free Tier

[ACI.dev](https://aci.dev/) - United MVP Server → Generous Free Tier

[Beyond Presence](https://www.beyondpresence.ai/) - Conversational Video Agents → Join the [developer community](https://bey.dev/community) to get a coupon and get started for free!

[Lightpanda](https://lightpanda.io/) - Sign up via the link and you’ll be sent an API token with unlimited access

[Lovable](https://lovable.dev/?via=bela) → Code: TechEuropeParis

[Dust](https://dust.tt/) → Free Trial

### Mastering Lovable

[Mastering Lovable.pdf](attachment:e033e9e0-c4fb-4151-9409-ddf29f8c88e0:Mastering_Lovable.pdf)

## FAQ

**Will there be any food available in the venue for free or to buy?**

Food (lunch and dinner) is provided for all participants free of charge. Snacks and drinks will also be available throughout the hackathon.

**How about staying over in the venue the whole night, what are the guidelines for that?**

Yes, you can stay overnight at the venue. Bring your own essentials (sleeping bag, pillow, toiletries). Please be respectful of quiet zones and keep the space tidy.

**Do I need to be in a team, or can I participate solo?**

You can join as a solo hacker or form a team of up to **5 people.** Team matchmaking will happen on Saturday after the opening session. If you join as a pre-made team, all of you have to be registered and approved individually.

**What exactly needs to be submitted?**

- A **2-minute video demo** (e.g., Loom)
- A **GitHub repository** with source code, README, documentation, and setup instructions.

Deadline: **Sunday, 14:00**.

**Do we need to use the partner technologies?**

You must use at least **three provided technologies** (e.g., OpenAI, Weaviate, Dust, Beyond Presence, Lightpanda, [ACI.dev](http://ACI.dev) & Lovable).

**Where do I find help and announcements during the hackathon?**

Join the **Discord server**: https://discord.gg/brSqTjJVdh – it’s the main place for updates, team finding, and support.

**What if I miss the submission deadline?**

Unfortunately, projects submitted after **Sunday 15:00** will not be eligible for jury evaluation.
