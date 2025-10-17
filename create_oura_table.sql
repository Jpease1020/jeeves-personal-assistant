-- Create oura_sleep_data table for storing Oura webhook data
CREATE TABLE IF NOT EXISTS oura_sleep_data (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    bedtime_start TIMESTAMP WITH TIME ZONE,
    bedtime_end TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    total_sleep_duration INTEGER,
    awake_time INTEGER,
    light_sleep_duration INTEGER,
    deep_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
    hr_average DECIMAL,
    hr_lowest DECIMAL,
    temperature_delta DECIMAL,
    temperature_trend_deviation DECIMAL,
    respiratory_rate_average DECIMAL,
    spo2_average DECIMAL,
    spo2_minimum DECIMAL,
    sleep_score INTEGER,
    sleep_consistency INTEGER,
    sleep_efficiency INTEGER,
    source TEXT DEFAULT 'oura_webhook',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE oura_sleep_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to see their own data
CREATE POLICY "Users can view their own oura sleep data" ON oura_sleep_data
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy for service role to insert data
CREATE POLICY "Service role can insert oura sleep data" ON oura_sleep_data
    FOR INSERT WITH CHECK (true);

-- Create RLS policy for service role to update data
CREATE POLICY "Service role can update oura sleep data" ON oura_sleep_data
    FOR UPDATE USING (true);