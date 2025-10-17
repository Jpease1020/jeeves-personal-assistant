-- Simplified Database Schema - Only Real-time/Technical Data
-- User data (habits, tasks, etc.) lives in Notion

-- User profiles (minimal)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notion_user_id TEXT,
    oura_user_id TEXT
);

-- Real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screen time data (from Chrome extension)
CREATE TABLE IF NOT EXISTS screen_time_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    total_minutes INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0,
    app_usage JSONB,
    distraction_patterns JSONB,
    source TEXT DEFAULT 'chrome_extension',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, source)
);

-- Distraction events (real-time tracking)
CREATE TABLE IF NOT EXISTS distraction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    app_name TEXT,
    website_url TEXT,
    duration_seconds INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- AI conversation history
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth tokens (technical)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    provider TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Wake detection logs (from Oura webhooks)
CREATE TABLE IF NOT EXISTS wake_detection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sleep_duration_minutes INTEGER,
    readiness_score INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE distraction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE wake_detection_logs ENABLE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own screen time" ON screen_time_summaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own distraction events" ON distraction_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON conversation_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own oauth tokens" ON oauth_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own wake logs" ON wake_detection_logs FOR ALL USING (auth.uid() = user_id);
