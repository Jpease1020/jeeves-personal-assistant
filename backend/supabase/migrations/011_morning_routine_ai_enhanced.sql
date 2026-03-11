-- Enhanced Morning Routine with AI Analysis
-- Stores LLM-generated structure and insights

CREATE TABLE IF NOT EXISTS morning_routine_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    notion_page_id TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notion_page_id)
);

-- Store per-step tracking for learning
CREATE TABLE IF NOT EXISTS morning_routine_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    routine_id UUID REFERENCES morning_routine_analysis(id),
    step_id TEXT NOT NULL,
    step_title TEXT NOT NULL,
    section TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    skipped BOOLEAN DEFAULT false,
    friction_points TEXT[],
    used_fallback BOOLEAN DEFAULT false,
    energy_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_morning_routine_analysis_user ON morning_routine_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_morning_routine_analysis_page ON morning_routine_analysis(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_morning_routine_tracking_user ON morning_routine_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_morning_routine_tracking_step ON morning_routine_tracking(step_id);
CREATE INDEX IF NOT EXISTS idx_morning_routine_tracking_date ON morning_routine_tracking(created_at);

-- RLS Policies
ALTER TABLE morning_routine_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_routine_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routine analysis" 
    ON morning_routine_analysis FOR SELECT 
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own routine analysis" 
    ON morning_routine_analysis FOR ALL 
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their own routine tracking" 
    ON morning_routine_tracking FOR ALL 
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

