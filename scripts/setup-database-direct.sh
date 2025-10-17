#!/bin/bash

# Alternative: Direct SQL Migration Script
# Use this if you prefer to run SQL directly in Supabase Dashboard

set -e

echo "🚀 Personal Assistant Database Setup (Direct SQL)"
echo "=================================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found"
    echo "Please create it with your Supabase credentials:"
    echo ""
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_ANON_KEY=your_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    exit 1
fi

# Load environment variables
source backend/.env

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required Supabase credentials in .env file"
    exit 1
fi

echo "📋 Database Setup Instructions:"
echo ""
echo "1. Open Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Go to your project"
echo "3. Navigate to SQL Editor"
echo "4. Copy and paste the following SQL:"
echo ""
echo "=================================================="
echo ""

# Read and display the migration file
cat backend/supabase/migrations/20241220_001_clean_schema_with_shared_habits.sql

echo ""
echo "=================================================="
echo ""
echo "5. Click 'Run' to execute the migration"
echo "6. Verify tables were created in the Table Editor"
echo ""
echo "📊 Expected Tables:"
echo "   - user_profiles"
echo "   - habits (with sharing)"
echo "   - habit_completions"
echo "   - habit_sharing_requests"
echo "   - morning_routine_logs"
echo "   - screen_time_goals"
echo "   - screen_time_summaries"
echo "   - distraction_events"
echo "   - notifications"
echo "   - study_materials"
echo "   - quiz_sessions"
echo "   - quiz_questions"
echo "   - learning_progress"
echo "   - activities"
echo "   - body_measurements"
echo "   - food_logs"
echo "   - conversation_history"
echo "   - oauth_tokens"
echo "   - wake_detection_logs"
echo ""
echo "✅ After running the SQL, your database will be ready!"
echo ""
echo "🔧 Next steps:"
echo "1. Create your first user account in Supabase Auth"
echo "2. Start your backend server: npm run dev"
echo "3. Test the API endpoints"
