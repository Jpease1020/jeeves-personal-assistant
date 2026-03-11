# Important URLs & Endpoints

## Production Deployment

### Frontend
- **Production URL**: (Vercel deployment - check your Vercel dashboard)
- **Local Development**: http://localhost:5173

### Backend  
- **Production URL**: https://personal-assistant-backend-production.up.railway.app
- **Local Development**: http://localhost:4001
- **Health Check**: https://personal-assistant-backend-production.up.railway.app/health

### WebSocket
- **Production**: wss://personal-assistant-backend-production.up.railway.app/api/ws
- **Local Development**: ws://localhost:4001/api/ws

---

## Key API Endpoints

### Chat & AI
- **Chat**: `/api/chat` (POST)
- **Morning Briefing**: `/api/chat/briefing` (GET)
- **Evening Check-in**: `/api/chat/check-in` (POST)
- **Spanish Study Plan**: `/api/chat/spanish-study` (GET)

### Morning Routine
- **Get Routine**: `/api/morning-routine` (GET)
- **Complete Task**: `/api/morning-routine/complete-task` (POST)
- **Get Progress**: `/api/morning-routine/progress` (GET)

### Spanish Study
- **Sync from Notion**: `/api/spanish/sync` (POST)
- **Get Next Question**: `/api/spanish/next-question?userId={userId}` (GET)
- **Submit Answer**: `/api/spanish/answer` (POST)
- **Get Progress**: `/api/spanish/progress?userId={userId}` (GET)

### Calendar
- **List Events**: `/api/calendar/events` (GET)
- **Create Event**: `/api/calendar/events` (POST)

### Dashboard
- **Get Dashboard Data**: `/api/dashboard` (GET)

### Notion Integration
- **Get Tasks**: `/api/mcp/notion/tasks` (GET)
- **Get Spanish Study Plan**: Uses Notion service internally

---

## MCP Servers

All MCP servers run locally on ports 4010-4017:

1. **Habit Tracker** - Port 4010
2. **Google Calendar** - Port 4011
3. **Notion Tasks** - Port 4012
4. **Quiz System** - Port 4013
5. **Morning Routine** - Port 4014
6. **Activity Tracker** - Port 4015
7. **Screen Time** - Port 4016 (via Chrome Extension)
8. **Blocked Sites** - Port 4017 (via Chrome Extension)

---

## External Services

### Supabase
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions

### Notion
- **Workspace**: Your Notion workspace
- **Integration**: Personal Assistant integration
- **Spanish Study Plan**: https://www.notion.so/Spanish-Study-Plan-for-the-Next-2-Weeks-fb482487604c4558b8dbb2478f3a36c4

### Oura Ring
- **API**: Oura Ring API
- **Webhooks**: `/webhooks/oura/*`

### Google Services
- **Calendar API**: OAuth 2.0
- **Sheets API**: For workout tracking

---

## Chrome Extension

### Installation
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder

### Configuration
- **Backend URL**: https://personal-assistant-backend-production.up.railway.app
- **API Endpoint**: `/api/chrome-extension/*`

---

## Development Commands

### Start All Services
```bash
npm run dev
```

### Start Individual Services
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# MCP Servers
npm run dev:mcp
```

### Build for Production
```bash
npm run build
```

---

## Environment Variables

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=xxxxx
NOTION_API_KEY=secret_xxxxx
OURA_CLIENT_ID=xxxxx
OURA_CLIENT_SECRET=xxxxx
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
PORT=4001
```

### Frontend (.env)
```
VITE_API_URL=https://personal-assistant-backend-production.up.railway.app
VITE_WS_URL=wss://personal-assistant-backend-production.up.railway.app/api/ws
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

## Testing

### Run Tests
```bash
cd backend
npm test
```

### Test URLs
- Health Check: http://localhost:4001/health
- API Status: Check `/api` endpoints

---

## Important Notes

⚠️ **Production Backend**: The backend is deployed on Railway and is accessible at:
- https://personal-assistant-backend-production.up.railway.app

⚠️ **Frontend Deployment**: The frontend should be deployed on Vercel. Check your Vercel dashboard for the actual URL.

⚠️ **Notion Page ID**: The Spanish Study Plan page ID is hardcoded:
- Page ID: `fb482487604c4558b8dbb2478f3a36c4`
- Full URL: https://www.notion.so/Spanish-Study-Plan-for-the-Next-2-Weeks-fb482487604c4558b8dbb2478f3a36c4

⚠️ **Environment**: Always update the production URLs in:
- `frontend/src/providers/APIProvider.tsx`
- `frontend/src/providers/WebSocketProvider.tsx`
- `chrome-extension/background*.js` files

---

## Quick Access

- **Local Frontend**: http://localhost:5173
- **Local Backend**: http://localhost:4001
- **Production Backend**: https://personal-assistant-backend-production.up.railway.app
- **Notion Study Plan**: https://www.notion.so/Spanish-Study-Plan-for-the-Next-2-Weeks-fb482487604c4558b8dbb2478f3a36c4
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

