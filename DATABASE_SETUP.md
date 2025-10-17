# Personal Assistant Database Setup Guide

## 🚀 Quick Start Options

### Option 1: Supabase CLI (Recommended)
```bash
# Run the automated setup script
./scripts/setup-database.sh
```

### Option 2: Direct SQL (Manual)
```bash
# Display SQL to copy/paste into Supabase Dashboard
./scripts/setup-database-direct.sh
```

## 📊 What Gets Created

### Core Tables
- **user_profiles** - User preferences and settings
- **habits** - Personal habits with sharing capabilities
- **habit_completions** - Daily habit tracking
- **habit_sharing_requests** - Share habits with spouse/family

### Morning Routine System
- **morning_routine_logs** - Comprehensive routine tracking
- **wake_detection_logs** - Oura Ring integration analytics

### Screen Time Monitoring
- **screen_time_goals** - Daily limits and focus settings
- **screen_time_summaries** - Daily usage analytics
- **distraction_events** - Real-time distraction tracking

### Learning System
- **study_materials** - Content for quizzes
- **quiz_sessions** - Quiz attempts and scores
- **quiz_questions** - Individual questions and answers
- **learning_progress** - Spaced repetition tracking

### Activity & Health Tracking
- **activities** - Time tracking and stuck detection
- **body_measurements** - Fitness progress
- **food_logs** - Nutrition tracking

### AI & Integrations
- **conversation_history** - AI chat context
- **notifications** - Proactive notification system
- **oauth_tokens** - External service authentication

## 🔒 Security Features

### Row Level Security (RLS)
- **Strict user isolation** - Users only see their own data
- **Shared habits** - Controlled sharing between users
- **Service role access** - Backend can access all data for admin operations

### Shared Habits System
- **Share habits** with specific users (e.g., spouse)
- **Request access** to shared habits
- **Approve/reject** sharing requests
- **Granular permissions** per habit

## 🛠️ Helper Functions

### Habit Sharing Functions
```sql
-- Share a habit with another user
SELECT share_habit_with_user('habit_id', 'target_user_id');

-- Request access to a shared habit
SELECT request_habit_access('habit_id');

-- Approve a sharing request
SELECT approve_habit_sharing_request('request_id');
```

## 📋 Prerequisites

### Required Environment Variables
```bash
# In backend/.env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase CLI (for Option 1)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

## 🎯 Next Steps After Setup

1. **Create user accounts** in Supabase Auth
2. **Test API endpoints** with your user ID
3. **Set up Oura webhook** for wake detection
4. **Configure Notion sync** for task management
5. **Enable push notifications** with VAPID keys

## 🔧 Troubleshooting

### Common Issues
- **RLS policies** blocking access - Check user authentication
- **Service role** not working - Verify SERVICE_ROLE_KEY
- **Migration fails** - Check SQL syntax in Supabase Dashboard
- **CLI errors** - Ensure you're logged in and linked to project

### Verification Commands
```bash
# Check Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/"

# Test user authentication
curl -H "Authorization: Bearer $USER_TOKEN" "$SUPABASE_URL/rest/v1/habits"
```
