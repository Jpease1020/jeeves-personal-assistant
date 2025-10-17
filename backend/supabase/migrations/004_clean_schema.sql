-- Clean Migration: Option A - Supabase Auth + New Tables
-- This replaces all existing schema with a clean, consistent approach

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE USER TABLES (Supabase Auth Integration)
-- ========================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    adhd_preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- HABIT TRACKING
-- ========================================

-- Habits table (standardized)
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'morning', 'evening', 'work', 'health'
    target_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily habit completions
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, habit_id, date)
);

-- ========================================
-- MORNING ROUTINE (Enhanced)
-- ========================================

-- Morning routine logs (comprehensive)
CREATE TABLE IF NOT EXISTS morning_routine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Sleep data from Oura
    wake_time TIMESTAMP WITH TIME ZONE,
    sleep_score INTEGER,
    sleep_duration INTEGER, -- minutes
    sleep_efficiency DECIMAL(5,2),
    deep_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
    
    -- Routine timing
    routine_started_at TIMESTAMP WITH TIME ZONE,
    routine_completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
    
    -- Individual step completion times
    wake_grounding_completed_at TIMESTAMP WITH TIME ZONE,
    reset_space_completed_at TIMESTAMP WITH TIME ZONE,
    identity_direction_completed_at TIMESTAMP WITH TIME ZONE,
    workout_completed_at TIMESTAMP WITH TIME ZONE,
    cool_down_completed_at TIMESTAMP WITH TIME ZONE,
    recenter_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- AI assistance
    ai_guidance_used BOOLEAN DEFAULT false,
    ai_suggestions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- ========================================
-- SCREEN TIME MONITORING (Enhanced)
-- ========================================

-- Screen time goals and settings
CREATE TABLE IF NOT EXISTS screen_time_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_limit INTEGER DEFAULT 480, -- 8 hours in minutes
    break_interval INTEGER DEFAULT 25, -- Pomodoro technique
    focus_apps TEXT[] DEFAULT '{}',
    blocked_apps TEXT[] DEFAULT '{}',
    work_hours_start TIME DEFAULT '09:00',
    work_hours_end TIME DEFAULT '17:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily screen time summaries
CREATE TABLE IF NOT EXISTS screen_time_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_screen_time INTEGER NOT NULL, -- in minutes
    focus_score INTEGER NOT NULL CHECK (focus_score >= 0 AND focus_score <= 100),
    app_usage JSONB NOT NULL DEFAULT '{}',
    distraction_patterns JSONB NOT NULL DEFAULT '{}',
    break_reminders INTEGER DEFAULT 0,
    productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Distraction events (real-time tracking)
CREATE TABLE IF NOT EXISTS distraction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    time_spent INTEGER NOT NULL, -- in minutes
    distraction_level TEXT NOT NULL CHECK (distraction_level IN ('low', 'medium', 'high')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context JSONB DEFAULT '{}'
);

-- ========================================
-- NOTIFICATION SYSTEM
-- ========================================

-- Proactive notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'morning_routine', 'habit_reminder', 'break_reminder', 'stuck_detection'
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    delivery_method TEXT DEFAULT 'websocket', -- 'websocket', 'push', 'email'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LEARNING SYSTEM (Enhanced)
-- ========================================

-- Study materials
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL, -- 'spanish', 'swift', 'ai', 'green_card'
    content TEXT NOT NULL,
    title TEXT,
    difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    difficulty TEXT,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions and answers
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    topic TEXT,
    difficulty TEXT,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning progress (spaced repetition)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    mastery_level FLOAT DEFAULT 0, -- 0 to 1
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    correct_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject, topic)
);

-- ========================================
-- ACTIVITY TRACKING
-- ========================================

-- Activities (for stuck detection and time tracking)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    task_id TEXT, -- link to Notion task if applicable
    category TEXT, -- 'work', 'learning', 'personal', 'health'
    estimated_duration_mins INTEGER,
    actual_duration_mins INTEGER,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    progress_notes TEXT,
    stuck BOOLEAN DEFAULT false,
    stuck_reason TEXT,
    ai_assistance_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- HEALTH & FITNESS TRACKING
-- ========================================

-- Body measurements
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight FLOAT,
    waist FLOAT,
    chest FLOAT,
    arms FLOAT,
    legs FLOAT,
    body_fat_percentage FLOAT,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Food logs
CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    description TEXT NOT NULL,
    calories INTEGER,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AI CONVERSATION SYSTEM
-- ========================================

-- Conversation history (for AI context)
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID, -- group related conversations
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT '{}', -- MCP tool calls made
    context JSONB DEFAULT '{}', -- additional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EXTERNAL INTEGRATIONS
-- ========================================

-- OAuth tokens (for Google Calendar, Notion, etc.)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL, -- 'google_calendar', 'notion', 'oura', 'google_sheets'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service)
);

-- Wake detection logs (for analytics)
CREATE TABLE IF NOT EXISTS wake_detection_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
    detection_method TEXT NOT NULL, -- 'oura_webhook', 'manual', 'calendar_alarm'
    sleep_score INTEGER,
    sleep_duration INTEGER,
    sleep_efficiency DECIMAL(5,2),
    morning_routine_triggered BOOLEAN DEFAULT FALSE,
    time_to_routine_start INTEGER, -- seconds from wake to routine start
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User-based indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_morning_routine_logs_user_date ON morning_routine_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_screen_time_summaries_user_date ON screen_time_summaries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_distraction_events_user_timestamp ON distraction_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_start ON activities(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_time ON conversation_history(user_id, created_at DESC);

-- Status and date indexes
CREATE INDEX IF NOT EXISTS idx_morning_routine_logs_status ON morning_routine_logs(status);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_activities_stuck ON activities(stuck) WHERE stuck = true;
CREATE INDEX IF NOT EXISTS idx_learning_progress_next_review ON learning_progress(next_review);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_morning_routine_logs_updated_at BEFORE UPDATE ON morning_routine_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screen_time_goals_updated_at BEFORE UPDATE ON screen_time_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screen_time_summaries_updated_at BEFORE UPDATE ON screen_time_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE distraction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE wake_detection_logs ENABLE ROW LEVEL SECURITY;

-- Service role policies (for backend operations)
CREATE POLICY "Service role can access user_profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access habits" ON habits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access habit_completions" ON habit_completions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access morning_routine_logs" ON morning_routine_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access screen_time_goals" ON screen_time_goals
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access screen_time_summaries" ON screen_time_summaries
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access distraction_events" ON distraction_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access study_materials" ON study_materials
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access quiz_sessions" ON quiz_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access quiz_questions" ON quiz_questions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access learning_progress" ON learning_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access activities" ON activities
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access body_measurements" ON body_measurements
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access food_logs" ON food_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access conversation_history" ON conversation_history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access oauth_tokens" ON oauth_tokens
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access wake_detection_logs" ON wake_detection_logs
    FOR ALL USING (auth.role() = 'service_role');

-- User-specific policies (for frontend operations)
CREATE POLICY "Users can access own user_profiles" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own habit_completions" ON habit_completions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own morning_routine_logs" ON morning_routine_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own screen_time_goals" ON screen_time_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own screen_time_summaries" ON screen_time_summaries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own distraction_events" ON distraction_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own study_materials" ON study_materials
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own quiz_sessions" ON quiz_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own quiz_questions" ON quiz_questions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own learning_progress" ON learning_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own activities" ON activities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own body_measurements" ON body_measurements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own food_logs" ON food_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own conversation_history" ON conversation_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own oauth_tokens" ON oauth_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own wake_detection_logs" ON wake_detection_logs
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE user_profiles IS 'User profile information and preferences';
COMMENT ON TABLE habits IS 'User-defined habits to track';
COMMENT ON TABLE habit_completions IS 'Daily habit completion records';
COMMENT ON TABLE morning_routine_logs IS 'Comprehensive morning routine tracking with Oura integration';
COMMENT ON TABLE screen_time_goals IS 'Screen time limits and focus settings';
COMMENT ON TABLE screen_time_summaries IS 'Daily screen time summaries and analytics';
COMMENT ON TABLE distraction_events IS 'Real-time distraction tracking';
COMMENT ON TABLE notifications IS 'Proactive notification system';
COMMENT ON TABLE study_materials IS 'Learning content and materials';
COMMENT ON TABLE quiz_sessions IS 'Quiz session records';
COMMENT ON TABLE quiz_questions IS 'Individual quiz questions and answers';
COMMENT ON TABLE learning_progress IS 'Spaced repetition learning progress';
COMMENT ON TABLE activities IS 'Activity tracking and stuck detection';
COMMENT ON TABLE body_measurements IS 'Fitness and body transformation tracking';
COMMENT ON TABLE food_logs IS 'Nutrition and meal logging';
COMMENT ON TABLE conversation_history IS 'AI conversation context and history';
COMMENT ON TABLE oauth_tokens IS 'External service authentication tokens';
COMMENT ON TABLE wake_detection_logs IS 'Wake detection analytics and morning routine triggering';
