import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key for schema changes
);

export async function createDatabaseSchema() {
  console.log('🗄️ Creating database schema via Supabase API...');

  try {
    // Method 1: Using Supabase's REST API for SQL execution
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        sql: `
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

          -- Enable RLS and create policies
          ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "Users can insert their own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

          ALTER TABLE morning_routine_logs ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "Users can view their own morning routine logs" ON morning_routine_logs FOR SELECT USING (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "Users can insert their own morning routine logs" ON morning_routine_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "Users can update their own morning routine logs" ON morning_routine_logs FOR UPDATE USING (auth.uid() = user_id);
        `
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Database schema created successfully via API');
    return true;

  } catch (error) {
    console.error('❌ Error creating database schema:', error);
    
    // Fallback: Try using the Supabase client directly
    try {
      console.log('🔄 Trying fallback method...');
      
      // Create tables using Supabase client
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      });

      if (error) throw error;
      console.log('✅ Fallback method succeeded');
      return true;

    } catch (fallbackError) {
      console.error('❌ Both methods failed:', fallbackError);
      throw fallbackError;
    }
  }
}

// Auto-run schema creation when this module is imported
if (require.main === module) {
  createDatabaseSchema();
}