-- Personal Assistant Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (if using custom auth, otherwise use Supabase auth.users)
-- For now, we'll just use a simple user_id string

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  habit_name TEXT NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_name, date)
);

CREATE INDEX idx_habits_user_date ON habits(user_id, date);
CREATE INDEX idx_habits_user_habit_date ON habits(user_id, habit_name, date DESC);

-- Study materials table (for quiz system)
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  subject TEXT NOT NULL, -- 'spanish', 'swift', 'ai', 'green_card'
  content TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_materials_user_subject ON study_materials(user_id, subject);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  subject TEXT NOT NULL,
  difficulty TEXT,
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
  topic TEXT, -- for tracking weak areas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_session ON quiz_questions(session_id);

-- Learning progress (mastery tracking with spaced repetition)
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_level FLOAT DEFAULT 0, -- 0 to 1
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject, topic)
);

CREATE INDEX idx_learning_progress_user_subject ON learning_progress(user_id, subject);
CREATE INDEX idx_learning_progress_next_review ON learning_progress(next_review);

-- Morning routine completions
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  steps_completed INTEGER DEFAULT 0,
  steps_skipped INTEGER DEFAULT 0,
  total_time_mins INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_routine_completions_user_date ON routine_completions(user_id, date DESC);

-- Routine step logs (detailed step-by-step tracking)
CREATE TABLE IF NOT EXISTS routine_step_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  completion_id UUID REFERENCES routine_completions(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER,
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  skip_reason TEXT,
  time_spent_mins INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_routine_step_logs_completion ON routine_step_logs(completion_id);

-- Activities (for activity tracking and stuck detection)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  activity_name TEXT NOT NULL,
  task_id TEXT, -- link to Notion task if applicable
  estimated_duration_mins INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  progress_notes TEXT,
  stuck BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user_start ON activities(user_id, start_time DESC);
CREATE INDEX idx_activities_stuck ON activities(stuck) WHERE stuck = true;

-- Screen time logs
CREATE TABLE IF NOT EXISTS screentime_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  date DATE NOT NULL,
  app_name TEXT NOT NULL,
  duration_mins INTEGER NOT NULL,
  is_distraction_app BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_screentime_user_date ON screentime_logs(user_id, date);
CREATE INDEX idx_screentime_distraction ON screentime_logs(is_distraction_app) WHERE is_distraction_app = true;

-- Body transformation tracking
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
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

CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, date DESC);

-- Food logs
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  date DATE NOT NULL,
  meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
  description TEXT NOT NULL,
  calories INTEGER,
  protein FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, date DESC);

-- Conversation history (for AI context)
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_history_user_time ON conversation_history(user_id, created_at DESC);

-- OAuth tokens (for Google Calendar, etc.)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  service TEXT NOT NULL, -- 'google_calendar', 'notion', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service)
);

CREATE INDEX idx_oauth_tokens_user_service ON oauth_tokens(user_id, service);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE screentime_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (we're using service key from backend)
-- In production, you'd want proper RLS policies based on auth.uid()
CREATE POLICY "Allow all for service role" ON habits FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON study_materials FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON quiz_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON learning_progress FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON routine_completions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON routine_step_logs FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON screentime_logs FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON body_measurements FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON food_logs FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON conversation_history FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON oauth_tokens FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

