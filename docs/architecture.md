# System Architecture

## Overview

This personal assistant is built using an **MCP (Model Context Protocol) architecture** where specialized MCP servers provide tools that an AI agent can use to help the user manage their life.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (PWA)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │   Chat   │  │ Routine  │  │  Quiz    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                           │                                  │
│                    WebSocket + REST API                      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                   Node.js Backend                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │         AI Agent (Claude 3.5 Sonnet)               │    │
│  │  - Conversational interface                        │    │
│  │  - Proactive monitoring & interventions            │    │
│  │  - Tool selection & orchestration                  │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│  ┌─────────────────────┴──────────────────────────────┐    │
│  │            MCP Client Orchestrator                  │    │
│  │  - Routes requests to appropriate MCP servers       │    │
│  │  - Manages multi-tool workflows                     │    │
│  └─────────────────────┬──────────────────────────────┘    │
└────────────────────────┼─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬───────────────┐
        │                │                 │               │
┌───────▼──────┐  ┌──────▼─────┐  ┌──────▼─────┐  ┌─────▼──────┐
│   Habit      │  │  Calendar  │  │   Notion   │  │    Quiz    │
│   Tracker    │  │    MCP     │  │    MCP     │  │    MCP     │
│     MCP      │  │   Server   │  │   Server   │  │   Server   │
└──────┬───────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘
       │                 │                 │               │
┌──────▼──────┐  ┌──────▼─────┐  ┌────────▼──────┐ ┌─────▼──────┐
│  Supabase   │  │   Google   │  │    Notion     │ │ Supabase   │
│  Database   │  │  Calendar  │  │      API      │ │ Database   │
│             │  │    API     │  │               │ │            │
└─────────────┘  └────────────┘  └───────────────┘ └────────────┘

┌──────────────────────────────────────────────────────────────┐
│       Morning Routine MCP + Activity Tracker MCP             │
└──────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (React + TypeScript)

**Technology:**
- React 18+ with TypeScript
- Vite for build tooling
- Styled-components (from existing design library)
- React Router for navigation
- PWA (Progressive Web App) for offline support and notifications

**Views:**
1. **Dashboard** - Visual overview of everything
2. **Chat** - Conversational interface with AI
3. **Morning Routine** - Step-by-step guided routine
4. **Quiz** - Learning tools (Spanish, Swift, AI, Green Card)
5. **Body Tracker** - Weight, measurements, food logging
6. **Settings** - Integrations, preferences, notification settings

**State Management:**
- React Context for global state
- Real-time updates via WebSocket connection to backend

### Backend (Node.js + Express)

**API Endpoints:**
- `POST /api/chat` - Send message to AI, stream response
- `GET /api/briefing` - Get morning briefing
- `POST /api/check-in` - Evening accountability check-in
- `GET /api/dashboard` - Get all dashboard data
- `POST /api/activity/start` - Log start of activity
- `POST /api/activity/end` - Log end of activity
- `GET /api/activity/current` - Get current focus
- `WebSocket /api/ws` - Real-time bi-directional communication

**Scheduled Jobs (node-cron):**
- **6:00 AM** - Generate and send morning briefing
- **9:00 PM** - Trigger evening check-in
- **Every 30 mins** - Check for stuck detection / screen time issues
- **Hourly** - Check for upcoming calendar events needing prep

### MCP Servers

#### 1. Habit Tracker MCP Server

**Purpose:** Track daily habits and accountability data

**Tools:**
- `log_habit(habit_name, date, completed, notes)`
- `get_habit_status(date)` - All habits for a day
- `get_streaks(habit_name)` - Current and longest streak
- `get_all_streaks()` - Overview of all habit streaks
- `get_sensitive_data()` - Local accountability data (porn/alcohol)
- `log_sensitive_data(type, date, status, notes)` - Store accountability locally

**Data Storage:**
- **Supabase** - General habits (Bible, workout, Spanish, etc.)
- **localStorage** - Sensitive accountability (porn, alcohol)

**Tables (Supabase):**
```sql
habits (
  id uuid PRIMARY KEY,
  user_id uuid,
  habit_name text,
  date date,
  completed boolean,
  notes text,
  created_at timestamp
)
```

#### 2. Google Calendar MCP Server

**Purpose:** Read and modify Google Calendar events

**Tools:**
- `list_events(start_date, end_date)` - Get calendar events
- `create_event(title, start, end, description, location)`
- `update_event(event_id, updates)`
- `delete_event(event_id)`
- `get_daily_summary(date)` - Formatted summary for briefings
- `get_upcoming(hours)` - Events in next N hours

**Integration:**
- Google Calendar API with OAuth 2.0
- Refresh token stored securely in Supabase
- Read/write access to user's calendar

#### 3. Notion MCP Server

**Purpose:** Manage tasks across three to-do lists

**Tools:**
- `list_tasks(list_name)` - Get tasks from Justin's, Monica's, or Shared list
- `create_task(list_name, title, description, priority, due_date)`
- `update_task(task_id, updates)`
- `complete_task(task_id)`
- `delete_task(task_id)`
- `get_priorities()` - High-priority tasks across all lists
- `get_overdue()` - Overdue tasks

**Integration:**
- Notion API with integration token
- Three database IDs (one for each list)

#### 4. Quiz System MCP Server

**Purpose:** Generate quizzes and track learning progress

**Tools:**
- `generate_quiz(subject, difficulty, count)` - Create quiz (Spanish, Swift, AI, Green Card)
- `submit_answer(quiz_id, question_id, answer)` - Check answer, store result
- `get_progress(subject)` - Mastery level, weak areas
- `add_study_material(subject, content)` - Add notes/content
- `get_next_review(subject)` - Spaced repetition - what to review
- `get_weak_areas(subject)` - Topics needing more practice

**Data Storage (Supabase):**
```sql
study_materials (
  id uuid PRIMARY KEY,
  subject text, -- 'spanish', 'swift', 'ai', 'green_card'
  content text,
  created_at timestamp
)

quiz_sessions (
  id uuid PRIMARY KEY,
  subject text,
  difficulty text,
  created_at timestamp
)

quiz_questions (
  id uuid PRIMARY KEY,
  session_id uuid,
  question text,
  correct_answer text,
  user_answer text,
  is_correct boolean,
  topic text, -- for tracking weak areas
  created_at timestamp
)

learning_progress (
  id uuid PRIMARY KEY,
  subject text,
  topic text,
  mastery_level float, -- 0-1
  last_reviewed timestamp,
  next_review timestamp, -- spaced repetition
  correct_count int,
  total_count int
)
```

#### 5. Morning Routine MCP Server

**Purpose:** Guide user through morning routine

**Tools:**
- `get_routine_steps()` - Get all steps with times
- `start_routine()` - Begin routine, set timer
- `complete_step(step_id)` - Mark step done, move to next
- `skip_step(step_id, reason)` - Skip with note
- `get_routine_status()` - Current step, time elapsed, completion %
- `get_routine_history(days)` - Past completion data

**Data Storage (Supabase):**
```sql
routine_completions (
  id uuid PRIMARY KEY,
  date date,
  completed boolean,
  steps_completed int,
  steps_skipped int,
  total_time_mins int,
  created_at timestamp
)

routine_step_logs (
  id uuid PRIMARY KEY,
  completion_id uuid,
  step_name text,
  completed boolean,
  skipped boolean,
  skip_reason text,
  time_spent_mins int
)
```

#### 6. Activity Tracker MCP Server (NEW - For Proactivity)

**Purpose:** Track user's current activity and detect stuck/distraction patterns

**Tools:**
- `start_activity(activity_name, task_id, estimated_duration)` - Log start of work session
- `end_activity(activity_id, notes)` - Log end and progress made
- `get_current_activity()` - What user is currently working on
- `check_for_stuck()` - Detect if user hasn't made progress in 2+ hours
- `log_screentime(app_name, duration_mins)` - Log screen time data
- `get_screentime_report(date)` - Daily screen time breakdown
- `detect_distraction()` - Check if excessive time on social media

**Data Storage (Supabase + Mac/iOS Integration):**
```sql
activities (
  id uuid PRIMARY KEY,
  activity_name text,
  task_id uuid, -- link to Notion task if applicable
  estimated_duration_mins int,
  start_time timestamp,
  end_time timestamp,
  progress_notes text,
  stuck boolean, -- flagged if no end after expected time
  created_at timestamp
)

screentime_logs (
  id uuid PRIMARY KEY,
  date date,
  app_name text,
  duration_mins int,
  is_distraction_app boolean, -- Instagram, Facebook, etc.
  created_at timestamp
)
```

**Screen Time Integration:**
- **macOS:** Background service monitors active app
- **iOS:** Screen Time API integration (requires user permission)
- Flag apps: Instagram, Facebook, YouTube, Twitter, Reddit, TikTok

### AI Agent (Claude 3.5 Sonnet)

**System Prompt Components:**
1. **Role & Identity**
   - Personal assistant and accountability partner
   - Understanding of ADHD challenges
   - Faith-based, supportive tone
   
2. **User Context**
   - Goals, values, daily commitments (from docs/goals.md)
   - ADHD considerations (from docs/adhd-considerations.md)
   - Current struggles (addiction recovery, job search, green card deadline)

3. **Available Tools**
   - All MCP server tools
   - When and how to use each tool

4. **Proactive Behavior Guidelines**
   - Check for stuck patterns
   - Monitor screen time
   - Gentle escalation strategy
   - Never nagging, always respectful
   - Empathetic about struggles

5. **Communication Style**
   - Non-judgmental but honest
   - Celebratory about wins
   - Supportive during failures
   - Direct when needed
   - Faith-aware language

**Conversation Memory:**
- Recent conversation history (last 50 messages)
- Current focus/activity context
- Today's completed habits
- Today's calendar events

### Data Storage

#### Supabase (Cloud - PostgreSQL)
- User authentication
- Habit tracking (non-sensitive)
- Quiz data and progress
- Learning materials
- Morning routine history
- Activity logs
- Screen time data
- Body transformation tracking (weight, measurements, food logs)
- Conversation history

#### localStorage (Browser - Sensitive Data)
- Porn accountability logs
- Alcohol accountability logs
- Encrypted with user-specific key

### Proactive Agent Loop

**Background Service (node-cron):**

```javascript
// Morning Briefing (6:00 AM)
- Get today's calendar events (Calendar MCP)
- Get high-priority tasks (Notion MCP)
- Get yesterday's habit completion (Habit MCP)
- Generate briefing with AI
- Send notification + prepare chat message

// Evening Check-in (9:00 PM)
- Get today's habit status (Habit MCP)
- Get sensitive accountability data (Habit MCP - local)
- Ask about porn/alcohol (empathetic, non-judgmental)
- Celebrate wins
- Prepare for tomorrow

// Stuck Detection (Every 30 mins during work hours)
- Get current activity (Activity MCP)
- Check if activity started >2 hours ago with no end
- If stuck: Send gentle "How's it going?" message
- If screen time excessive: "Been scrolling for a while, ready to refocus?"

// Upcoming Event Prep (Every hour)
- Get events in next 2 hours (Calendar MCP)
- Check if user prepared
- Send reminder if needed

// Task Deadline Monitoring (Every hour)
- Get overdue tasks (Notion MCP)
- Get tasks due today not started
- Escalating reminders based on importance
```

### Real-Time Communication

**WebSocket Connection:**
- Frontend maintains persistent WebSocket connection
- Backend pushes proactive messages
- Frontend shows notification badge
- Click notification → navigate to relevant view

## Security & Privacy

### Sensitive Data
- **Porn/alcohol logs:** localStorage only, never leaves device
- **Everything else:** Supabase with proper authentication

### API Keys
- Stored in environment variables
- Never exposed to frontend
- Anthropic Claude API key
- Google OAuth credentials
- Notion integration token

### Authentication
- Supabase Auth (email/password)
- Google OAuth for calendar access
- JWT tokens for API requests

## Deployment

### Frontend
- **Host:** Vercel or Netlify
- **Build:** Vite production build
- **PWA:** Service worker for offline support

### Backend
- **Host:** Railway, Render, or Vercel serverless functions
- **Environment:** Node.js 18+
- **Process Manager:** PM2 for scheduled jobs

### Database
- **Supabase:** Cloud-hosted PostgreSQL
- **Backups:** Automatic daily backups

## Development Workflow

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev  # Starts Express server on port 4001

# Frontend
cd frontend
npm install
npm run dev  # Starts Vite dev server on port 5173

# MCP Servers
cd mcp-servers/habit-tracker
npm install
npm run dev  # Each server runs independently
```

### Environment Variables
```
# Backend .env
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NOTION_API_KEY=...
NOTION_JUSTIN_DB_ID=...
NOTION_MONICA_DB_ID=...
NOTION_SHARED_DB_ID=...
```

## Future Enhancements

### Phase 2 (Post-MVP)
- Native iOS app for better Apple Watch integration
- Siri Shortcuts integration
- More sophisticated pattern analysis
- Energy level tracking and recommendations
- Alexa skill for home interactions
- Social accountability (share progress with accountability partner)

### Phase 3
- Multi-user support (couples/accountability partners)
- Advanced analytics dashboard
- Custom habit builder
- Integration with fitness trackers (Apple Health)
- Advanced quiz features (code execution for Swift practice)
- Voice interface throughout app

