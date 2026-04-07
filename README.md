# LifeOS

A minimal, mobile-first productivity app combining Time Tracking, Notes, Journal, and Reminders. Built with Next.js and deployed on Vercel.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Zustand
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless driver)
- **AI**: Groq LLM (optional)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

1. Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd lifeos
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

3. Initialize the database tables (one-time):

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "x-setup-secret: YOUR_JWT_SECRET"
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — a secure random string
   - `GROQ_API_KEY` — (optional) for AI features
4. Deploy
5. Initialize DB tables by calling the setup endpoint once:

```bash
curl -X POST https://your-app.vercel.app/api/setup \
  -H "x-setup-secret: YOUR_JWT_SECRET"
```

## Features

- **Time Arena** — Track what you do every hour of the day
- **Notes** — Apple Notes-style editor (coming soon)
- **Journal** — Daily reflections with prompts (coming soon)
- **Reminders** — Smart reminders with due dates (coming soon)
- **PWA** — Install on your phone's home screen
- **Dark Mode** — Light, dark, and system themes
- **AI Assistant** — Productivity insights powered by Groq (optional)
