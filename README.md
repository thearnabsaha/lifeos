# LifeOS

A minimal, mobile-first productivity app with offline-first localStorage and background sync to Neon PostgreSQL. Built with Next.js, deployed on Vercel.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Zustand
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless HTTP driver)
- **Offline**: localStorage cache + background sync (5s debounce)
- **AI**: Groq LLM (optional)
- **Deployment**: Vercel

## How Offline-First Works

1. When you open the app, data loads **instantly from localStorage**
2. Server data is fetched **in the background** and merged
3. When you type in a time slot, it saves to **localStorage immediately** (zero lag)
4. After 5 seconds of no edits, all changes sync to **Neon DB in the background**
5. If you close the app mid-edit, it uses `keepalive` fetch to send data
6. On next open, any unsynced edits retry automatically

---

## Deploy to Vercel — Step by Step

### Step 1: Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier works)
2. Create a new project (pick any name, e.g. "lifeos")
3. Copy the **connection string** — it looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Create a GitHub Repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `lifeos` (or anything you want)
3. Set it to **Private** (recommended) or Public
4. **Do NOT** check "Add a README" or ".gitignore" — we already have those
5. Click **Create repository**
6. Back in your terminal, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/lifeos.git
git push -u origin master
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `lifeos` repository
4. In the **Environment Variables** section, add these three:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `JWT_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) |
| `GROQ_API_KEY` | *(optional)* Your Groq API key for AI features |

5. Click **Deploy** — wait for it to build (~1-2 minutes)

### Step 4: Initialize the Database

After the first deploy, you need to create the database tables once. Open your terminal and run:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/setup \
  -H "x-setup-secret: YOUR_JWT_SECRET_VALUE"
```

Replace `YOUR-APP.vercel.app` with your actual Vercel URL, and `YOUR_JWT_SECRET_VALUE` with the JWT_SECRET you set in Step 3.

You should see: `{"status":"ok","message":"Tables created"}`

### Step 5: Use It on Your Phone

1. Open `https://YOUR-APP.vercel.app` on your phone's browser
2. Create an account (Sign up)
3. **Add to Home Screen**:
   - **iPhone**: Tap Share button → "Add to Home Screen"
   - **Android**: Tap the three dots menu → "Add to Home Screen" or "Install App"
4. Now it works like a native app — opens full screen, works offline

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Time Arena** — Track what you do every hour of the day
- **Offline-first** — Everything saves locally, syncs in background
- **PWA** — Install on your phone's home screen
- **Dark Mode** — Light, dark, and system themes
- **AI Assistant** — Productivity insights powered by Groq (optional)
- **Notes** — Coming soon
- **Journal** — Coming soon
- **Reminders** — Coming soon
