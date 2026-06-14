# ResearchGPT: Multi-Agent Deep Research SaaS

ResearchGPT is a production-grade web application built to autonomously research complex queries by deploying a pipeline of 5 specialized AI agents (Search, Verification, Fact Checker, Summarizer, and Report Generator).

---

## 🛠️ Components & Architecture

This project is structured as a monorepo consisting of two primary parts: the **Frontend** and the **Backend**. Below is a simple explanation of how each component works:

### 1. Frontend (`/frontend`)
* **Framework**: Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.
* **Role**: The user interface. It provides a landing page, user registration/login pages, a history dashboard, and an interactive workspace.
* **Key Feature**: Streams real-time agent activities using **Server-Sent Events (SSE)**. You can watch each agent complete its work step-by-step.

### 2. Backend (`/backend`)
* **Framework**: Node.js, Express, and TypeScript.
* **Role**: The core engine. It handles authentication, communicates with Prisma to store session data, and orchestrates the AI agents.
* **Database Client**: Prisma ORM, which connects to PostgreSQL.

### 3. The 5 AI Research Agents (`/backend/src/agents`)
When you submit a query, the backend spawns 5 specialized agents in sequence:
* 🕵️ **Search Agent**: Decomposes your query into 3 distinct search strategies and runs web searches.
* 🛡️ **Verification Agent**: Scrapes the top web links, extracts text contents, and pulls out numbers and facts.
* ⚖️ **Fact Checker**: Cross-references findings, flags contradictory evidence, and calculates a query confidence score.
* 📝 **Summarizer**: Synthesizes the verified text into a concise direct answer and executive summary.
* 📄 **Report Generator**: Generates a long-form structured Markdown report, complete with comparative tables and citation links.

### 4. Database Schema (`/backend/prisma/schema.prisma`)
* **User**: Manages credentials and subscription tiers (Free, Pro, Enterprise).
* **ResearchSession & ResearchStep**: Tracks session state, progress logs, confidence scores, and raw reports.
* **Finding, Source, & Image**: Stores scraped content, citations, and screenshot metadata.

---

## 🚀 Local Setup & Run

### 1. Configure Environment Variables
Open [backend/.env](file:///C:/Users/palak/.gemini/antigravity/scratch/research-gpt/backend/.env) and populate the values:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/researchgpt?schema=public"
JWT_SECRET="your-jwt-signing-secret"
CONTEXT_DEV_API_KEY="your-context-dev-api-key"
OPENAI_API_KEY="your-openai-api-key"
```
*(Note: If no database or keys are supplied on boot, the app will run in an automatic client-side / database mock fallback mode, allowing instant standalone demonstration).*

### 2. Install & Start
From the project root directory, run:
```bash
# Install all dependencies (uses --legacy-peer-deps for Next.js 15 / React 19 compatibility)
npm run install:all

# Run the frontend and backend servers concurrently
npm run dev
```
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend Health**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🌐 Deployment Guide

To take this application live, you need to deploy the PostgreSQL database, the Node.js backend, and the Next.js frontend. Here is the recommended path:

### 1. Deploy the Database (Neon or Supabase)
You need a cloud PostgreSQL instance.
1. Sign up on **[Neon.tech](https://neon.tech/)** or **[Supabase](https://supabase.com/)**.
2. Create a new PostgreSQL database.
3. Copy the connection string (`postgres://...`).
4. Keep this connection string for your backend deployment (`DATABASE_URL`).

### 2. Deploy the Backend (Railway or Render)
The backend is a Node.js Express server.
1. Log in to **[Railway.app](https://railway.app/)** or **[Render.com](https://render.com/)**.
2. Select **New Project** -> **Deploy from GitHub repository**.
3. Select your repository and specify `/backend` as the root directory.
4. Set the **Build Command** to: `npm run build`
5. Set the **Start Command** to: `npm run start`
6. Add the following environment variables in the dashboard settings:
   * `DATABASE_URL` (Your Neon/Supabase database link)
   * `JWT_SECRET` (A strong random string)
   * `OPENAI_API_KEY` (Your OpenAI key)
   * `CONTEXT_DEV_API_KEY` (Your Context.dev scraping API key)
7. Once deployed, Railway/Render will provide a backend URL (e.g., `https://research-gpt-backend.up.railway.app`).

### 3. Run Prisma Migrations on Production Database
Run this command from your local machine to create the required database tables on your live production database:
```bash
# Replace DATABASE_URL with your production database URL temporarily
npx prisma db push --schema=./backend/prisma/schema.prisma
```

### 4. Deploy the Frontend (Vercel)
Next.js projects are best deployed on Vercel.
1. Go to **[Vercel](https://vercel.com/)** and click **Add New Project**.
2. Import your GitHub repository.
3. In **Project Settings**:
   * Set the **Root Directory** to `frontend`.
   * Keep the **Framework Preset** as **Next.js**.
4. Add the following environment variable in the Vercel dashboard:
   * `NEXT_PUBLIC_API_URL` = `https://your-backend-railway-url.com` (This points your Next.js app to your live Express backend).
5. Click **Deploy**. Vercel will build your Next.js frontend and provide your live application URL!
