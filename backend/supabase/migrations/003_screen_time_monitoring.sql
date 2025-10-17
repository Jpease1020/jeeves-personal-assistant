-- Screen Time Monitoring Tables
-- Run this in Supabase SQL Editor

-- Screen time goals table
CREATE TABLE IF NOT EXISTS screen_time_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_limit INTEGER DEFAULT 480, -- 8 hours in minutes
    break_interval INTEGER DEFAULT 25, -- Pomodoro technique
    focus_apps TEXT[] DEFAULT '{}',
    blocked_apps TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distraction events table
CREATE TABLE IF NOT EXISTS distraction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    time_spent INTEGER NOT NULL, -- in minutes
    distraction_level TEXT NOT NULL CHECK (distraction_level IN ('low', 'medium', 'high')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context JSONB
);

-- Screen time daily summaries
CREATE TABLE IF NOT EXISTS screen_time_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_screen_time INTEGER NOT NULL, -- in minutes
    focus_score INTEGER NOT NULL CHECK (focus_score >= 0 AND focus_score <= 100),
    app_usage JSONB NOT NULL DEFAULT '{}',
    distraction_patterns JSONB NOT NULL DEFAULT '{}',
    break_reminders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- RLS Policies
ALTER TABLE screen_time_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own screen time goals" ON screen_time_goals 
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE distraction_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own distraction events" ON distraction_events 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own distraction events" ON distraction_events 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE screen_time_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own screen time summaries" ON screen_time_summaries 
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_distraction_events_user_timestamp ON distraction_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_screen_time_summaries_user_date ON screen_time_summaries(user_id, date);
