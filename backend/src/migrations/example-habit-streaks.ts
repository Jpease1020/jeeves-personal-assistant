// Example: Adding habit streaks feature
// Just add this to your migrations array!

{
    version: "004",
        name: "add_habit_streaks",
            up: `
    -- Add streak tracking to habits
    CREATE TABLE IF NOT EXISTS habit_streaks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      habit_name TEXT NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_completed_date DATE,
      streak_start_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, habit_name)
    );

    -- Add streak data to existing habits table
    ALTER TABLE habits ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
    ALTER TABLE habits ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
    ALTER TABLE habits ADD COLUMN IF NOT EXISTS last_completed_date DATE;

    -- Enable RLS
    ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY IF NOT EXISTS "Users can manage their own habit streaks" 
      ON habit_streaks FOR ALL USING (auth.uid() = user_id);

    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_habit_streaks_user_streak 
      ON habit_streaks(user_id, current_streak DESC);
  `,
                down: `
    DROP TABLE IF EXISTS habit_streaks;
    ALTER TABLE habits DROP COLUMN IF EXISTS current_streak;
    ALTER TABLE habits DROP COLUMN IF EXISTS longest_streak;
    ALTER TABLE habits DROP COLUMN IF EXISTS last_completed_date;
  `
}
