# Setup To-Do List - What You Need to Get

This is your checklist of everything you need to obtain and configure to get your Personal Assistant running.

## ✅ Critical (Required to Run)

### 1. Anthropic API Key (Claude)
- [ ] Go to https://console.anthropic.com
- [ ] Sign up / Create account
- [ ] Navigate to "API Keys"
- [ ] Click "Create Key"
- [ ] Copy the key (starts with `sk-ant-`)
- [ ] Paste into `backend/.env` as `ANTHROPIC_API_KEY=sk-ant-xxxxx`
- **Cost:** $5 free credits, then pay-as-you-go (~$10-20/month estimated)

### 2. Supabase Account & Database
- [ ] Go to https://supabase.com
- [ ] Sign up / Create account (free tier is fine)
- [ ] Click "New Project"
- [ ] Choose: Name, Password, Region (pick closest to you)
- [ ] Wait 2-3 minutes for project to initialize
- [ ] Go to Project Settings → API
- [ ] Copy **Project URL** → paste into both `backend/.env` and `frontend/.env`
- [ ] Copy **anon public** key → paste into both `.env` files as `SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → paste into `backend/.env` as `SUPABASE_SERVICE_KEY`
- [ ] Go to SQL Editor → Click "New Query"
- [ ] Copy entire contents of `backend/supabase/migrations/001_initial_schema.sql`
- [ ] Paste into SQL editor and click "Run"
- [ ] Verify success message
- **Cost:** Free (up to 500MB database, 2GB bandwidth)

---

## 🎯 High Priority (Biometric Data)

### 3. Oura Ring API Access
- [ ] Go to https://cloud.ouraring.com/personal-access-tokens
- [ ] Log in with your Oura account
- [ ] Click "Create A New Personal Access Token"
- [ ] Give it a name: "Personal Assistant"
- [ ] Copy the token
- [ ] Paste into `backend/.env` as `OURA_API_TOKEN=xxxxx`
- **Cost:** Free (you already have the ring)
- **Benefit:** Sleep, readiness, recovery data for smart recommendations

### 4. Google Sheets API (Workout Tracking)
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project (or select existing)
- [ ] Click "Enable APIs and Services"
- [ ] Search for "Google Sheets API"
- [ ] Click "Enable"
- [ ] Go to "Credentials" → "Create Credentials" → "OAuth client ID"
- [ ] Application type: "Web application"
- [ ] Authorized redirect URIs: `http://localhost:4001/auth/google/callback`
- [ ] Copy **Client ID** → `backend/.env` as `GOOGLE_SHEETS_CLIENT_ID`
- [ ] Copy **Client Secret** → `backend/.env` as `GOOGLE_SHEETS_CLIENT_SECRET`
- [ ] Share your workout Google Sheet with the service account email
- [ ] Copy the Sheet ID from the URL → `backend/.env` as `WORKOUT_SHEET_ID`
- **Cost:** Free
- **Benefit:** Auto-pull workout data you're already tracking

---

## 📅 Medium Priority (Calendar & Tasks)

### 5. Google Calendar OAuth
- [ ] In same Google Cloud Console project (from #4)
- [ ] Enable "Google Calendar API"
- [ ] Use same OAuth credentials as Google Sheets
- [ ] Or create separate OAuth client if preferred
- [ ] Add redirect URI: `http://localhost:5173/auth/google/callback`
- [ ] Copy credentials to `backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Cost:** Free
- **Benefit:** Auto-sync calendar events, create appointments via AI

### 6. Notion Integration (To-Do Lists)
- [ ] Go to https://www.notion.so/my-integrations
- [ ] Click "New integration"
- [ ] Name: "Personal Assistant"
- [ ] Select your workspace
- [ ] Copy the "Internal Integration Token"
- [ ] Paste into `backend/.env` as `NOTION_API_KEY`
- [ ] Open your three Notion to-do lists:
  - [ ] Justin's To Do List
  - [ ] Monica's To Do List  
  - [ ] Shared To Do List
- [ ] For each list: Click "..." → "Add connections" → Select "Personal Assistant"
- [ ] Copy each database ID from the URL (the long string before the `?`)
  - URL format: `notion.so/workspace/DATABASE_ID?v=...`
- [ ] Paste into `backend/.env` as:
  - `NOTION_JUSTIN_DB_ID`
  - `NOTION_MONICA_DB_ID`
  - `NOTION_SHARED_DB_ID`
- **Cost:** Free
- **Benefit:** AI can read/create/update tasks across your three lists

---

## 🔧 Configuration Files to Create

### 7. Backend Environment Variables
- [ ] Create file: `backend/.env`
- [ ] Copy template from `backend/.env.example` (if it exists)
- [ ] Or use this template:

```bash
# Server
PORT=4001
NODE_ENV=development

# Anthropic (Claude) - FROM STEP 1
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Supabase - FROM STEP 2
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

# Oura Ring - FROM STEP 3
OURA_API_TOKEN=xxxxx

# Google Sheets - FROM STEP 4
GOOGLE_SHEETS_CLIENT_ID=xxxxx
GOOGLE_SHEETS_CLIENT_SECRET=xxxxx
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:4001/auth/google/callback
WORKOUT_SHEET_ID=xxxxx

# Google Calendar - FROM STEP 5 (Optional)
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Notion - FROM STEP 6 (Optional)
NOTION_API_KEY=secret_xxxxx
NOTION_JUSTIN_DB_ID=xxxxx
NOTION_MONICA_DB_ID=xxxxx
NOTION_SHARED_DB_ID=xxxxx

# MCP Server Ports (keep defaults)
MCP_HABIT_TRACKER_PORT=4010
MCP_CALENDAR_PORT=4011
MCP_NOTION_PORT=4012
MCP_QUIZ_PORT=4013
MCP_MORNING_ROUTINE_PORT=4014
MCP_ACTIVITY_TRACKER_PORT=4015
MCP_OURA_RING_PORT=4016
MCP_GOOGLE_SHEETS_PORT=4017
```

### 8. Frontend Environment Variables
- [ ] Create file: `frontend/.env`
- [ ] Use this template:

```bash
VITE_API_URL=http://localhost:4001
VITE_WS_URL=ws://localhost:4001/api/ws
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

## 📝 Optional (Nice to Have)

### 9. Apple Health Data
- [ ] Requires native iOS app (not implemented yet)
- [ ] Will add in Phase 2 when we build mobile app
- [ ] For now: Manual logging or chat-based entry
- **Benefit:** Auto-log cardio workouts, heart rate, activity

### 10. Screen Time API
- [ ] Requires macOS/iOS native integration
- [ ] Will add later for distraction detection
- [ ] For now: Manual reporting if needed

---

## ✅ Installation Checklist

After getting all the above:

- [ ] Clone/navigate to project directory
- [ ] Run: `npm run install:all`
- [ ] Verify both `.env` files are created and filled out
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:5173
- [ ] Test chat interface: "Hi! Give me a tour"
- [ ] Check dashboard loads
- [ ] Verify WebSocket connection (look for console log)

---

## 📊 Summary

**Must Have (2 items):**
- Anthropic API Key
- Supabase Account

**Should Have (2 items):**
- Oura Ring API Token
- Google Sheets API Setup

**Nice to Have (2 items):**
- Google Calendar OAuth
- Notion Integration

**Total Setup Time:**
- Must Have: ~10 minutes
- Should Have: +15 minutes  
- Nice to Have: +20 minutes
- **Full Setup: 45-60 minutes**

---

## 💰 Costs Summary

- **Anthropic (Claude):** $5 free credits, then ~$10-20/month
- **Supabase:** Free tier (plenty for personal use)
- **Oura Ring API:** Free
- **Google APIs:** Free
- **Notion:** Free

**Total Monthly Cost: ~$10-20** (just Claude API usage)

---

## 🆘 Help & Troubleshooting

If you get stuck:
1. Check `QUICK_START.md` for quick setup
2. Check `SETUP.md` for detailed instructions
3. Check `.env.example` files for templates
4. Each API provider has good documentation

---

## ✨ What You'll Get

Once all this is set up:
- 🤖 AI assistant that knows your goals, habits, and schedule
- 📊 Dashboard showing everything at a glance
- 😴 Sleep/readiness data for smart daily planning
- 🏋️ Automatic workout tracking from Google Sheets
- 📅 Calendar integration for time management
- ✅ Task management from Notion
- ⏰ Proactive reminders and check-ins
- 📈 Progress tracking on all your goals

**Ready to start? Begin with Steps 1 & 2 (Anthropic + Supabase) and you'll have a working assistant in 10 minutes!**

