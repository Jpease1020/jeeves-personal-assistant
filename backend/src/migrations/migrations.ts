// Database Migration System
// Easy to modify, version-controlled, and reversible

interface Migration {
    version: string;
    name: string;
    up: string;    // Forward migration
    down: string;   // Rollback migration
}

const migrations: Migration[] = [
    {
        version: "001",
        name: "initial_schema",
        up: `
      -- Create notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        action TEXT,
        priority TEXT DEFAULT 'medium',
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create morning_routine_logs table
      CREATE TABLE IF NOT EXISTS morning_routine_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        sleep_data JSONB,
        step_wake_grounding_completed BOOLEAN DEFAULT FALSE,
        step_reset_space_completed BOOLEAN DEFAULT FALSE,
        step_identity_direction_completed BOOLEAN DEFAULT FALSE,
        step_workout_completed BOOLEAN DEFAULT FALSE,
        step_cool_down_completed BOOLEAN DEFAULT FALSE,
        step_recenter_completed BOOLEAN DEFAULT FALSE,
        overall_completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE morning_routine_logs ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY IF NOT EXISTS "Users can view their own notifications" 
        ON notifications FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own notifications" 
        ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can view their own morning routine logs" 
        ON morning_routine_logs FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own morning routine logs" 
        ON morning_routine_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update their own morning routine logs" 
        ON morning_routine_logs FOR UPDATE USING (auth.uid() = user_id);
    `,
        down: `
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS morning_routine_logs;
    `
    },

    {
        version: "002",
        name: "add_screen_time_tables",
        up: `
      -- Add screen time monitoring tables
      CREATE TABLE IF NOT EXISTS screen_time_goals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        daily_limit INTEGER DEFAULT 480,
        break_interval INTEGER DEFAULT 25,
        focus_apps TEXT[] DEFAULT '{}',
        blocked_apps TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS distraction_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        app_name TEXT NOT NULL,
        time_spent INTEGER NOT NULL,
        distraction_level TEXT NOT NULL CHECK (distraction_level IN ('low', 'medium', 'high')),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        context JSONB
      );

      -- Enable RLS
      ALTER TABLE screen_time_goals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE distraction_events ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY IF NOT EXISTS "Users can manage their own screen time goals" 
        ON screen_time_goals FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can view their own distraction events" 
        ON distraction_events FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert their own distraction events" 
        ON distraction_events FOR INSERT WITH CHECK (auth.uid() = user_id);
    `,
        down: `
      DROP TABLE IF EXISTS screen_time_goals;
      DROP TABLE IF EXISTS distraction_events;
    `
    },

    {
        version: "003",
        name: "add_notification_read_status",
        up: `
      -- Add read status to notifications
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
      
      -- Add index for better performance
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
        ON notifications(user_id, is_read);
    `,
        down: `
      ALTER TABLE notifications DROP COLUMN IF EXISTS is_read;
      ALTER TABLE notifications DROP COLUMN IF EXISTS read_at;
      DROP INDEX IF EXISTS idx_notifications_user_read;
    `
    }
];

export { migrations };
