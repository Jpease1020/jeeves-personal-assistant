# AI Personal Assistant

A proactive, AI-powered personal assistant designed specifically for managing ADHD, building healthy habits, and achieving life goals.

## Features

- **Visual Dashboard** - See everything at a glance (habits, calendar, goals, progress)
- **Conversational AI** - Chat with your assistant powered by Claude
- **Morning Routine Guide** - Step-by-step guided morning routine
- **Habit Tracking** - Track daily habits with streak counters
- **Learning Tools** - Quiz systems for Spanish, Swift, AI, and green card prep
- **Proactive Assistance** - Morning briefings, evening check-ins, stuck detection
- **Calendar & Task Integration** - Syncs with Google Calendar and Notion
- **Body Transformation Tracker** - Track weight, measurements, and food
- **Screen Time Awareness** - Monitor and get gentle nudges about distracting apps
- **Accountability** - Daily check-ins for personal accountability goals

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Styled-components
- React Router
- PWA (Progressive Web App)

### Backend
- Node.js + Express
- Claude 3.5 Sonnet (Anthropic API)
- MCP (Model Context Protocol) architecture
- Supabase (PostgreSQL + Auth + Real-time)

### Integrations
- Google Calendar API
- Notion API
- Screen Time tracking (macOS + iOS)

## Project Structure

```
personal-assistant/
├── frontend/          # React app
├── backend/           # Express server + AI agent
├── mcp-servers/       # MCP server implementations
│   ├── habit-tracker/
│   ├── calendar/
│   ├── notion/
│   ├── quiz/
│   ├── morning-routine/
│   └── activity-tracker/
├── docs/              # Documentation
│   ├── adhd-considerations.md
│   ├── goals.md
│   └── architecture.md
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key (Claude)
- Google Cloud project (for Calendar API)
- Notion integration

### Installation

1. **Clone and install dependencies:**
```bash
cd personal-assistant
npm run install:all  # Installs all packages
```

2. **Set up environment variables:**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Supabase URL
```

3. **Set up Supabase:**
- Create a new Supabase project
- Run the database migrations in `backend/supabase/migrations/`
- Copy your project URL and anon key to `.env`

4. **Set up Google Calendar OAuth:**
- Create OAuth 2.0 credentials in Google Cloud Console
- Add redirect URI: `http://localhost:5173/auth/google/callback`
- Copy client ID and secret to `.env`

5. **Set up Notion:**
- Create a Notion integration
- Share your three to-do list databases with the integration
- Copy integration token and database IDs to `.env`

### Running Locally

```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:4001
npm run dev:mcp        # Starts all MCP servers
```

### Building for Production

```bash
npm run build
npm run deploy
```

## Key Workflows

### Morning Routine
1. AI sends morning briefing at 6:00 AM
2. User opens app and starts morning routine
3. Step-by-step guidance with timers
4. Completion logged automatically

### Habit Tracking
1. Dashboard shows today's habits
2. Check off as completed throughout day
3. Streaks update in real-time
4. Evening check-in reviews completion

### Proactive Assistance
1. AI monitors current activity
2. Detects if stuck for >2 hours
3. Checks screen time for distractions
4. Sends gentle nudges via notification
5. Offers help or suggests break

### Learning
1. User requests quiz: "Quiz me on Spanish"
2. AI generates appropriate difficulty questions
3. Tracks progress and weak areas
4. Suggests what to review next (spaced repetition)

## ADHD-Specific Features

- **Time Awareness:** Prominent clock, countdown timers, visual time blocks
- **Visual Progress:** Streaks, progress bars, color coding
- **Gentle Escalation:** Reminders that get more direct over time
- **Context Recovery:** "What was I doing?" button
- **Reduce Overwhelm:** AI picks single priority task
- **Gamification:** Badges, milestones, celebrations

## Documentation

- [ADHD Considerations](docs/adhd-considerations.md) - Design principles for ADHD
- [Goals & Values](docs/goals.md) - User's goals, routines, and priorities
- [Architecture](docs/architecture.md) - Technical architecture and data flow

## Contributing

This is a personal project, but feel free to fork and adapt for your own needs!

## License

MIT

