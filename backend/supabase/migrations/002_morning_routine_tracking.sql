-- Migration 002: Morning Routine Tracking
-- Add tables for morning routine automation and wake detection

-- Morning routine logs table
CREATE TABLE IF NOT EXISTS morning_routine_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    wake_time TIMESTAMP WITH TIME ZONE,
    sleep_score INTEGER,
    sleep_duration INTEGER,
    sleep_efficiency DECIMAL(5,2),
    deep_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Notifications table for tracking proactive notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_method TEXT DEFAULT 'websocket',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    read_at TIMESTAMP WITH TIME ZONE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wake detection logs for analytics
CREATE TABLE IF NOT EXISTS wake_detection_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
    detection_method TEXT NOT NULL, -- 'oura_webhook', 'manual', 'calendar_alarm'
    sleep_score INTEGER,
    sleep_duration INTEGER,
    sleep_efficiency DECIMAL(5,2),
    morning_routine_triggered BOOLEAN DEFAULT FALSE,
    time_to_routine_start INTEGER, -- seconds from wake to routine start
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_morning_routine_logs_user_date ON morning_routine_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_morning_routine_logs_status ON morning_routine_logs(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_wake_detection_user_id ON wake_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wake_detection_wake_time ON wake_detection_logs(wake_time);

-- Update trigger for morning_routine_logs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_morning_routine_logs_updated_at 
    BEFORE UPDATE ON morning_routine_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE morning_routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wake_detection_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY "Service role can access morning_routine_logs" ON morning_routine_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access wake_detection_logs" ON wake_detection_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to access their own data
CREATE POLICY "Users can access own morning_routine_logs" ON morning_routine_logs
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can access own notifications" ON notifications
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can access own wake_detection_logs" ON wake_detection_logs
    FOR ALL USING (auth.uid()::text = user_id);

-- Comments for documentation
COMMENT ON TABLE morning_routine_logs IS 'Tracks daily morning routine completion and wake times';
COMMENT ON TABLE notifications IS 'Logs all proactive notifications sent to users';
COMMENT ON TABLE wake_detection_logs IS 'Analytics for wake detection and morning routine triggering';

