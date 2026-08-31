# LifeOS

A minimal, mobile-first productivity app with offline-first localStorage and background sync to MongoDB. Built with Next.js, deployed on Vercel.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Zustand
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB (native driver with connection pooling)
- **Offline**: localStorage cache + background sync (5s debounce)
- **Deployment**: Vercel

## How Offline-First Works

1. When you open the app, data loads **instantly from localStorage**
2. Server data is fetched **in the background** and merged
3. When you type in a time slot, it saves to **localStorage immediately** (zero lag)
4. After 5 seconds of no edits, all changes sync to **MongoDB in the background**
5. If you close the app mid-edit, it uses `keepalive` fetch to send data
6. On next open, any unsynced edits retry automatically

---

## Deploy to Vercel — Step by Step

### Step 1: Create a MongoDB Database

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up (free M0 cluster works)
2. Create a database cluster (e.g. `lifeos`)
3. Copy the **connection string** — it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/lifeos?retryWrites=true&w=majority
   ```

### Step 2: Create a GitHub Repo & Deploy on Vercel

1. In Vercel, import your repository.
2. In the **Environment Variables** section, add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `MONGODB_DB` | `lifeos` (or your database name) |
| `JWT_SECRET` | Any long random string |

3. Click **Deploy**

### Step 3: Initialize Database Indexes (Optional)

You can initialize database indexes at any time:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/setup \
  -H "x-setup-secret: YOUR_JWT_SECRET_VALUE"
```

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001).

## Features

- **Time Arena** — 24-hour hour-by-hour time tracking and focus log
- **Offline-first** — Instant local storage with background sync
- **PWA** — High-res mobile install on home screen
- **Dark Mode** — Light, dark, and system themes with custom accents
