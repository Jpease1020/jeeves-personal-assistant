-- Migration script for blocked_site_events table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS blocked_site_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('blocked', 'unlock_requested', 'unlocked')),
    reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    full_url TEXT,
    source VARCHAR(50) DEFAULT 'extension',
    user_agent TEXT,
    extension_version VARCHAR(50),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_user_id ON blocked_site_events(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_timestamp ON blocked_site_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_domain ON blocked_site_events(domain);
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_action ON blocked_site_events(action);
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_user_timestamp ON blocked_site_events(user_id, timestamp);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_blocked_site_events_user_action_timestamp 
ON blocked_site_events(user_id, action, timestamp);

-- Add RLS (Row Level Security) policies
ALTER TABLE blocked_site_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own events
CREATE POLICY "Users can view their own blocked site events" ON blocked_site_events
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own events
CREATE POLICY "Users can insert their own blocked site events" ON blocked_site_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own events (for future features)
CREATE POLICY "Users can update their own blocked site events" ON blocked_site_events
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blocked_site_events_updated_at 
    BEFORE UPDATE ON blocked_site_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing (optional)
-- INSERT INTO blocked_site_events (user_id, domain, action, reason, source) VALUES
-- ('e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4', 'example.com', 'blocked', 'Test block', 'extension'),
-- ('e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4', 'example.com', 'unlock_requested', 'Need to access for work', 'extension'),
-- ('e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4', 'example.com', 'unlocked', 'Legitimate work need', 'extension');

COMMENT ON TABLE blocked_site_events IS 'Logs blocked site events for accountability and analytics';
COMMENT ON COLUMN blocked_site_events.user_id IS 'User identifier from the extension';
COMMENT ON COLUMN blocked_site_events.domain IS 'Domain that was blocked or unlocked';
COMMENT ON COLUMN blocked_site_events.action IS 'Type of action: blocked, unlock_requested, or unlocked';
COMMENT ON COLUMN blocked_site_events.reason IS 'Reason provided for unlock requests';
COMMENT ON COLUMN blocked_site_events.source IS 'Source of the event (extension, content_script, etc.)';
COMMENT ON COLUMN blocked_site_events.full_url IS 'Complete URL that was blocked';
COMMENT ON COLUMN blocked_site_events.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN blocked_site_events.extension_version IS 'Version of the Chrome extension';
COMMENT ON COLUMN blocked_site_events.ip_address IS 'IP address of the request';
