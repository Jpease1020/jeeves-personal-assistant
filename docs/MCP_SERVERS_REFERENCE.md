# MCP Servers Reference Guide

Quick reference for all 8 MCP servers in your Personal Assistant.

## Overview

| Server | Port | Purpose | Status |
|--------|------|---------|--------|
| Habit Tracker | 4010 | Track daily habits, streaks, accountability | ✅ Built |
| Calendar | 4011 | Google Calendar integration | ✅ Built |
| Notion | 4012 | Task management (3 to-do lists) | ✅ Built |
| Quiz | 4013 | Learning (Spanish, Swift, AI, Green Card) | ✅ Built |
| Morning Routine | 4014 | Guided 6-step morning routine | ✅ Built |
| Activity Tracker | 4015 | Stuck detection, screen time monitoring | ✅ Built |
| **Oura Ring** | **4016** | **Biometric data (sleep, readiness)** | **✅ NEW** |
| **Google Sheets** | **4017** | **Workout log tracking** | **✅ NEW** |

---

## 1. Habit Tracker MCP (Port 4010)

**What it does:** Tracks daily habits with streak counting

**Key Tools:**
- `log_habit` - Mark habit as complete/incomplete
- `get_habit_status` - See all habits for a day
- `get_streaks` - Current and longest streak
- `log_sensitive_data` - Store porn/alcohol accountability (local only)

**Data Storage:** Supabase (habits) + localStorage (sensitive)

**Example Use:**
```
User: "Log that I completed my Bible study"
AI calls: log_habit("Bible Study", today, true)
```

---

## 2. Calendar MCP (Port 4011)

**What it does:** Integrates with Google Calendar

**Key Tools:**
- `list_events` - Get events in date range
- `create_event` - Add calendar event
- `get_daily_summary` - Today's schedule formatted

**Data Storage:** Google Calendar API

**Example Use:**
```
User: "What's on my calendar today?"
AI calls: get_daily_summary(today)
```

---

## 3. Notion MCP (Port 4012)

**What it does:** Manages tasks across 3 to-do lists

**Key Tools:**
- `list_tasks` - Get tasks from Justin's/Monica's/Shared list
- `create_task` - Add new task
- `complete_task` - Mark task done
- `get_priorities` - High-priority tasks across all lists

**Data Storage:** Notion API (3 databases)

**Example Use:**
```
User: "What are my priority tasks?"
AI calls: get_priorities()
```

---

## 4. Quiz MCP (Port 4013)

**What it does:** Generates quizzes and tracks learning progress

**Key Tools:**
- `generate_quiz` - Create questions (Spanish, Swift, AI, Green Card)
- `submit_answer` - Check answer and track progress
- `get_progress` - Mastery level by subject
- `get_next_review` - Spaced repetition recommendations

**Data Storage:** Supabase (quiz_sessions, quiz_questions, learning_progress)

**Example Use:**
```
User: "Quiz me on 5 Spanish questions"
AI calls: generate_quiz("spanish", "medium", 5)
```

---

## 5. Morning Routine MCP (Port 4014)

**What it does:** Guides through 6-step morning routine

**Key Tools:**
- `get_routine_steps` - All 6 steps with times
- `start_routine` - Begin routine with first step
- `complete_step` - Mark step done, get next step
- `get_routine_status` - Current progress

**Data Storage:** Supabase (routine_completions, routine_step_logs)

**Routine Steps:**
1. Wake + Grounding (6:00-6:15)
2. Reset Your Space (6:15-6:30)
3. Identity + Direction (6:30-6:45)
4. Workout (6:45-7:15)
5. Cool Down (7:15-7:30)
6. Recenter (7:30-8:00)

**Example Use:**
```
User: "Start my morning routine"
AI calls: start_routine()
AI: "Step 1: Wake + Grounding (15 mins)..."
```

---

## 6. Activity Tracker MCP (Port 4015)

**What it does:** Tracks current activity, detects being stuck, monitors screen time

**Key Tools:**
- `start_activity` - Log what you're working on
- `end_activity` - Log completion
- `get_current_activity` - What you're focused on now
- `check_for_stuck` - Detect if working too long without progress
- `log_screentime` - Log time on apps
- `detect_distraction` - Check for excessive social media

**Data Storage:** Supabase (activities, screentime_logs)

**Example Use:**
```
User: "I'm starting to study AI"
AI calls: start_activity("Study AI", 60)
[2 hours later, no activity logged]
AI calls: check_for_stuck()
AI: "You've been working on Study AI for 2 hours. How's it going?"
```

---

## 7. Oura Ring MCP (Port 4016) ✨ NEW

**What it does:** Pulls sleep, readiness, and recovery data from Oura Ring

**Key Tools:**
- `get_daily_readiness` - Readiness score (0-100), HRV, body temp, contributors
- `get_sleep_data` - Sleep quality, duration, stages (deep/REM/light)
- `get_activity_summary` - Steps, calories, activity time
- `get_recovery_status` - Combined analysis: ready for intense workout?

**Data Storage:** Oura Cloud API (read-only)

**Readiness Interpretation:**
- **85-100:** Excellent - push hard!
- **70-84:** Good - normal workout
- **60-69:** Fair - moderate intensity
- **<60:** Low - rest or very light

**Example Use:**
```
Morning Briefing:
AI calls: get_recovery_status()
Response: {readiness: 87, sleep_hours: 8, ready_for_heavy_lifting: true}
AI: "Readiness 87% with 8 hours of sleep - perfect day for heavy lifting!"
```

---

## 8. Google Sheets MCP (Port 4017) ✨ NEW

**What it does:** Reads workout log from Google Sheets to track progress

**Key Tools:**
- `get_recent_workouts` - Last N workouts
- `get_last_workout` - Most recent workout + days since
- `get_workout_frequency` - Check if hitting 6 days/week goal
- `get_exercise_progress` - Track progress on specific lift
- `get_workout_summary` - Overall stats

**Data Storage:** Google Sheets API (read-only from your workout log)

**Example Use:**
```
User: "How's my workout consistency?"
AI calls: get_workout_frequency(7)
Response: {workout_count: 5, workouts_per_week: 5, on_track: false}
AI: "You've done 5 workouts this week. Need 1 more to hit your 6 days/week goal!"
```

---

## Environment Variables Required

**backend/.env**
```bash
# Basic MCP Server Ports
MCP_HABIT_TRACKER_PORT=4010
MCP_CALENDAR_PORT=4011
MCP_NOTION_PORT=4012
MCP_QUIZ_PORT=4013
MCP_MORNING_ROUTINE_PORT=4014
MCP_ACTIVITY_TRACKER_PORT=4015
MCP_OURA_RING_PORT=4016
MCP_GOOGLE_SHEETS_PORT=4017

# Oura Ring
OURA_API_TOKEN=your_token_here

# Google Sheets
GOOGLE_SHEETS_CLIENT_ID=...
GOOGLE_SHEETS_CLIENT_SECRET=...
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:4001/auth/google/callback
WORKOUT_SHEET_ID=your_sheet_id_from_url
```

---

## Running All MCP Servers

```bash
# Start all 8 servers at once
npm run dev:mcp

# Or start all (frontend + backend + all MCP servers)
npm run dev
```

You'll see:
```
🔧 Habit Tracker MCP server running on http://localhost:4010
📅 Calendar MCP server running on http://localhost:4011
📝 Notion MCP server running on http://localhost:4012
🎓 Quiz MCP server running on http://localhost:4013
🌅 Morning Routine MCP server running on http://localhost:4014
📊 Activity Tracker MCP server running on http://localhost:4015
💍 Oura Ring MCP server running on http://localhost:4016
📊 Google Sheets MCP server running on http://localhost:4017
```

---

## Testing Individual Servers

Each server has a health check endpoint:

```bash
curl http://localhost:4016/health
# Response: {"status":"ok","server":"oura-ring-mcp"}
```

---

## How AI Uses These Servers

**Morning Briefing (6 AM):**
1. Calls `get_recovery_status()` → Readiness/sleep data
2. Calls `get_workout_summary()` → Last workout, weekly progress
3. Calls `get_daily_summary()` → Calendar for today
4. Calls `get_priorities()` → High-priority tasks
5. Generates briefing with all context

**Throughout Day:**
- Monitors `get_current_activity()` for stuck detection
- Checks `detect_distraction()` if prolonged inactivity
- Tracks habits as you log them
- Pulls calendar events for reminders

**Evening Check-in (9 PM):**
1. Calls `get_habit_status(today)` → Which habits completed
2. Asks about accountability (sensitive data)
3. Celebrates wins
4. Previews tomorrow

---

## MCP Architecture Benefits

**Why 8 separate servers?**
- ✅ **Separation of concerns** - Each server has one job
- ✅ **Independent scaling** - Can run on different machines if needed
- ✅ **Easy testing** - Test each tool individually
- ✅ **Extensibility** - Add new servers without touching existing ones
- ✅ **Fault isolation** - If one fails, others keep working

**AI Orchestration:**
- Backend MCP Client routes tool calls to appropriate server
- AI decides which tools to use based on user request
- Multiple tools can be called in sequence for complex requests

---

**You now have 8 specialized MCP servers working together to be your intelligent personal assistant!** 🚀

