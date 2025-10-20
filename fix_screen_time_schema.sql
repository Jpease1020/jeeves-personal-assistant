-- Fix screen_time_summaries table schema
-- Add missing columns that the service expects

ALTER TABLE screen_time_summaries 
ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS productive_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS distracting_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS app_breakdown JSONB DEFAULT '[]'::jsonb;

-- Update existing records with default values
UPDATE screen_time_summaries 
SET 
    total_minutes = COALESCE(total_minutes, 0),
    productive_minutes = COALESCE(productive_minutes, 0),
    distracting_minutes = COALESCE(distracting_minutes, 0),
    app_breakdown = COALESCE(app_breakdown, '[]'::jsonb)
WHERE 
    total_minutes IS NULL 
    OR productive_minutes IS NULL 
    OR distracting_minutes IS NULL 
    OR app_breakdown IS NULL;
