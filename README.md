# ResearchGPT: Multi-Agent Deep Research SaaS

ResearchGPT is a production-grade web application built to autonomously research complex search queries by deploying a pipeline of 5 specialized AI agents (Search, Verification, Fact Checker, Summarizer, and Report Generator).

## Technology Stack

*   **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
*   **Backend**: Node.js, Express, TypeScript
*   **Database**: PostgreSQL & Prisma ORM
*   **External APIs**: Context.dev (Scraping, crawling, image extraction, and AI queries) and OpenAI (for cognitive processing)

## Project Structure

```
research-gpt/
├── backend/
│   ├── prisma/             # Database schemas
│   ├── src/
│   │   ├── agents/         # Search, Verification, FactChecker, Summarizer, Report Generator
│   │   ├── controllers/    # API Request handlers
│   │   ├── services/       # Context.dev & OpenAI connectors
│   │   ├── utils/          # PDF export generators & DB clients
│   │   └── index.ts        # Express entry point
│   └── .env                # Port, DB links, API keys
├── frontend/
│   ├── src/
│   │   ├── app/            # App Router (pages: landing, auth, workspace)
│   │   ├── context/        # Auth react contexts
│   │   └── lib/            # api-client request layers
│   ├── tailwind.config.ts
│   └── postcss.config.js
└── package.json            # Monorepo concurrently script executor
```

## Setup & Running Locally

1.  **Configure API Keys**:
    Open the backend environment file at `backend/.env` and add your credentials:
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/researchgpt?schema=public"
    CONTEXT_DEV_API_KEY="ctxt_secret_6cc38734232248a4823a9de03c39f09a"
    OPENAI_API_KEY="your-openai-api-key"
    ```
    *(Note: If no database or keys are supplied on boot, the app will run in an automatic client-side / database mock fallback mode, allowing instant standalone demonstration).*

2.  **Install Dependencies**:
    From the root directory, install all required packages:
    ```bash
    npm run install:all
    ```

3.  **Launch Dev Servers**:
    Run both frontend and backend concurrently in development mode:
    ```bash
    npm run dev
    ```
    *   **Frontend**: accessible at `http://localhost:3000`
    *   **Backend Health Check**: accessible at `http://localhost:5000/health`
