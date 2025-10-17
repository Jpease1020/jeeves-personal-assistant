# Quick Start Guide - Get Running in 10 Minutes

This guide will get your Personal Assistant running as quickly as possible.

## Step 1: Get Your API Keys (5 minutes)

### Anthropic (Required)
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Click "Get API Keys"
4. Copy your API key
5. You get $5 free credits to start

### Supabase (Required)
1. Go to https://supabase.com
2. Create a new project (choose any name, password, region)
3. Wait 2 minutes for project to initialize
4. Go to Project Settings → API
5. Copy: Project URL and anon public key

## Step 2: Set Up Database (2 minutes)

1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Copy/paste the entire contents of:
   ```
   backend/supabase/migrations/001_initial_schema.sql
   ```
4. Click "Run"
5. You should see "Success. No rows returned"

## Step 3: Configure Environment (1 minute)

Create `backend/.env`:

```bash
PORT=4001
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Your Anthropic key
SUPABASE_URL=https://xxxxx.supabase.co  # Your Supabase URL
SUPABASE_ANON_KEY=xxxxx  # Your Supabase anon key  
SUPABASE_SERVICE_KEY=xxxxx  # Your Supabase service_role key (from same page)
```

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:4001
VITE_WS_URL=ws://localhost:4001/api/ws
```

## Step 4: Install & Run (2 minutes)

```bash
# Install all dependencies
npm run install:all

# Start everything
npm run dev
```

This starts:
- Frontend at http://localhost:5173
- Backend at http://localhost:4001
- All 6 MCP servers

## Step 5: Test It! (1 minute)

1. Open http://localhost:5173
2. You should see the Dashboard
3. Click "Chat" in the navigation
4. Type: "Hi! Give me a quick tour of what you can do"
5. Hit Send

If you get a response from Claude, **YOU'RE DONE!** 🎉

## Troubleshooting

### "Module not found" errors
```bash
npm run install:all
```

### Backend won't start
- Check `backend/.env` exists with all keys
- Make sure ports 4001-4015 are available

### Frontend can't connect
- Check backend is running (should see logs in terminal)
- Check frontend `.env` has correct API_URL

### Claude errors
- Verify ANTHROPIC_API_KEY in backend/.env
- Check you have API credits remaining

## What to Try Next

1. **Morning Briefing:**
   - In chat: "Give me my morning briefing"

2. **Start Tracking:**
   - "Log that I completed my Bible study today"
   - "I'm starting to work on studying AI"

3. **Get a Quiz:**
   - "Quiz me on 3 Spanish questions"

4. **Check Your Progress:**
   - Go to Dashboard to see overview

## Optional: Add Calendar & Notion Later

You can use the app without these integrations. When ready:
- See SETUP.md for Google Calendar setup
- See SETUP.md for Notion integration

## Need Help?

1. Check SETUP.md for detailed instructions
2. Check IMPLEMENTATION_SUMMARY.md to understand what's built
3. Check docs/architecture.md to understand the system

---

**You're ready to start building better habits and achieving your goals!**

