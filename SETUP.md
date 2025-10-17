# Personal Assistant - Setup Guide

This guide will help you get your AI Personal Assistant up and running.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- Anthropic API key (for Claude)
- Google Calendar API credentials (optional, for calendar integration)
- Notion integration token (optional, for task management)

## Quick Start

### 1. Install Dependencies

```bash
# From the project root
npm run install:all
```

This will install dependencies for:
- Root project
- Frontend (React app)
- Backend (Express server)
- All 6 MCP servers

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Project Settings → API
3. Copy your Project URL and anon/public key
4. Go to SQL Editor and run the migration:
   ```
   backend/supabase/migrations/001_initial_schema.sql
   ```

### 3. Set Up Anthropic (Claude API)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and get your API key
3. You'll get $5 free credits to start

### 4. Configure Environment Variables

#### Backend

Create `backend/.env`:

```bash
PORT=4001
NODE_ENV=development

# Anthropic (Claude API)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google Calendar (optional - can skip for now)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Notion (optional - can skip for now)
NOTION_API_KEY=your_notion_integration_token
NOTION_JUSTIN_DB_ID=your_justin_database_id
NOTION_MONICA_DB_ID=your_monica_database_id
NOTION_SHARED_DB_ID=your_shared_database_id

# MCP Server Ports (defaults are fine)
MCP_HABIT_TRACKER_PORT=4010
MCP_CALENDAR_PORT=4011
MCP_NOTION_PORT=4012
MCP_QUIZ_PORT=4013
MCP_MORNING_ROUTINE_PORT=4014
MCP_ACTIVITY_TRACKER_PORT=4015
```

#### Frontend

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:4001
VITE_WS_URL=ws://localhost:4001/api/ws
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Run the Application

#### Option 1: Run Everything at Once

```bash
npm run dev
```

This starts:
- Frontend (http://localhost:5173)
- Backend (http://localhost:4001)
- All 6 MCP servers

#### Option 2: Run Individually

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: MCP Servers (all at once)
npm run dev:mcp
```

### 6. Access the Application

Open your browser to: **http://localhost:5173**

You should see:
- Dashboard with your habits, tasks, and goals
- Chat interface to talk with your AI assistant
- Navigation to other features

## Optional Integrations

### Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:5173/auth/google/callback`
6. Copy Client ID and Client Secret to `backend/.env`

### Notion Setup

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the integration token
4. Share your three to-do list databases with the integration
5. Copy database IDs and token to `backend/.env`

## Features Overview

### Core Features (Working Now)

- ✅ Dashboard - Visual overview of habits, tasks, and goals
- ✅ Chat - Conversational AI assistant powered by Claude
- ✅ WebSocket - Real-time proactive notifications
- ✅ Habit Tracking - Log daily habits and track streaks
- ✅ MCP Servers - 6 specialized servers for different functions

### In Development

- 🚧 Morning Routine - Step-by-step guided routine
- 🚧 Quiz System - Learn Spanish, Swift, AI, Green Card prep
- 🚧 Body Tracker - Weight, measurements, food logging
- 🚧 Settings - Configure integrations and preferences

### Proactive Features

The assistant will proactively:
- Send morning briefing at 6:00 AM
- Send evening check-in at 9:00 PM
- Detect if you're stuck on a task (>2 hours)
- Monitor screen time on distraction apps
- Remind you of upcoming calendar events

## Troubleshooting

### Frontend won't start

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend won't start

Check that:
1. `.env` file exists in `backend/` directory
2. All required environment variables are set
3. Port 4001 is not already in use

### MCP Servers failing

Each MCP server runs on its own port. Check:
- Ports 4010-4015 are available
- Supabase credentials are correct
- All MCP servers have their dependencies installed

### Database errors

1. Make sure you ran the migration in Supabase
2. Check that SUPABASE_SERVICE_KEY is set (not just ANON_KEY)
3. Verify RLS policies allow access

### Claude API errors

1. Verify ANTHROPIC_API_KEY is correct
2. Check you have remaining API credits
3. Ensure API key has proper permissions

## Next Steps

1. **Customize Your Goals** - Edit `docs/goals.md` with your specific goals
2. **Adjust ADHD Settings** - Modify `docs/adhd-considerations.md` as needed
3. **Connect Integrations** - Set up Google Calendar and Notion
4. **Start Using Daily** - Begin with morning briefings and habit tracking
5. **Provide Feedback** - The AI learns from your interactions

## Development

### Adding a New Feature

1. Update documentation in `docs/`
2. Add MCP tools if needed
3. Create frontend components in `frontend/src/components/`
4. Add routes in `frontend/src/App.tsx`
5. Update backend routes in `backend/src/routes/`

### Testing

Currently manual testing. Test coverage coming soon.

### Deployment

Deploy to:
- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Render, Fly.io
- **Database:** Supabase (already cloud-hosted)

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review the architecture in `docs/architecture.md`
3. Check the plan in `/plan.md`

## License

MIT - Built for personal use

