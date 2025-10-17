// Simple API endpoint to setup database
// Just call this once: POST /api/setup-database

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Lazy initialization of Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
}

router.post('/setup-database', async (req, res) => {
    try {
        console.log('🗄️ Setting up database schema...');

        const supabase = getSupabaseClient();

        // Method 1: Use Supabase's built-in SQL execution
        const { data, error } = await supabase.rpc('exec_sql', {
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
      `
        });

        if (error) {
            console.error('❌ Database setup error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        console.log('✅ Database schema created successfully!');
        res.json({
            success: true,
            message: 'Database schema created successfully',
            tables: ['notifications', 'morning_routine_logs']
        });

    } catch (error) {
        console.error('❌ Setup error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
