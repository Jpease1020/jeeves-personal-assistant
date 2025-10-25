-- Spanish Study System Database Schema
-- This migration creates tables for Spanish study items and progress tracking

-- Create spanish_study_items table
CREATE TABLE IF NOT EXISTS spanish_study_items (
    id TEXT PRIMARY KEY,
    notion_page_id TEXT NOT NULL,
    notion_page_title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'phrase', 'conversation', 'other')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spanish_study_progress table for spaced repetition
CREATE TABLE IF NOT EXISTS spanish_study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    study_item_id TEXT NOT NULL REFERENCES spanish_study_items(id) ON DELETE CASCADE,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    interval INTEGER DEFAULT 1, -- days until next review
    ease_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 algorithm ease factor
    streak INTEGER DEFAULT 0, -- consecutive correct answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, study_item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spanish_study_items_type ON spanish_study_items(type);
CREATE INDEX IF NOT EXISTS idx_spanish_study_items_difficulty ON spanish_study_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_spanish_study_items_notion_page ON spanish_study_items(notion_page_id);

CREATE INDEX IF NOT EXISTS idx_spanish_study_progress_user ON spanish_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_spanish_study_progress_next_review ON spanish_study_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_spanish_study_progress_study_item ON spanish_study_progress(study_item_id);

-- Enable RLS
ALTER TABLE spanish_study_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spanish_study_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for spanish_study_items (read-only for now)
CREATE POLICY IF NOT EXISTS "Anyone can read spanish study items" 
    ON spanish_study_items FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Service role can manage spanish study items" 
    ON spanish_study_items FOR ALL USING (auth.role() = 'service_role');

-- Create policies for spanish_study_progress
CREATE POLICY IF NOT EXISTS "Users can view their own spanish study progress" 
    ON spanish_study_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own spanish study progress" 
    ON spanish_study_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own spanish study progress" 
    ON spanish_study_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role can manage spanish study progress" 
    ON spanish_study_progress FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_spanish_study_items_updated_at 
    BEFORE UPDATE ON spanish_study_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spanish_study_progress_updated_at 
    BEFORE UPDATE ON spanish_study_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
