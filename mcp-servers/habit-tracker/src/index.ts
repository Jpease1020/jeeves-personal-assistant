import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_HABIT_TRACKER_PORT || 4010;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'habit-tracker-mcp' });
});

// Tool: log_habit
app.post('/tools/log_habit', async (req, res) => {
    try {
        const { habit_name, date, completed, notes, userId } = req.body;

        // Validate required parameters
        if (!habit_name || !date) {
            return res.status(400).json({
                error: 'Missing required parameters: habit_name and date are required'
            });
        }

        // Insert or update habit log in Supabase
        const { data, error } = await supabase
            .from('habits')
            .upsert({
                user_id: userId || 'default-user',
                habit_name,
                date,
                completed: completed !== undefined ? completed : false,
                notes: notes || null,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,habit_name,date'
            })
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data?.[0] || null,
            message: `Habit "${habit_name}" logged for ${date}`
        });
    } catch (error) {
        console.error('Error in log_habit:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Tool: get_habit_status
app.post('/tools/get_habit_status', async (req, res) => {
    try {
        const { date, userId } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .eq('date', date);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            data: data || [],
            date
        });
    } catch (error) {
        console.error('Error in get_habit_status:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Tool: get_streaks
app.post('/tools/get_streaks', async (req, res) => {
    try {
        const { habit_name, userId } = req.body;

        if (!habit_name) {
            return res.status(400).json({ error: 'Habit name is required' });
        }

        // Get all habit logs for this habit, ordered by date descending
        const { data, error } = await supabase
            .from('habits')
            .select('date, completed')
            .eq('user_id', userId || 'default-user')
            .eq('habit_name', habit_name)
            .order('date', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (const log of data || []) {
            const logDate = log.date;
            const expectedDate = checkDate.toISOString().split('T')[0];

            if (logDate === expectedDate && log.completed) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (logDate === expectedDate) {
                break; // Streak broken
            }
        }

        // Calculate longest streak (simple version)
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate: string | null = null;

        for (const log of (data || []).reverse()) {
            if (log.completed) {
                if (!lastDate || isConsecutiveDay(lastDate, log.date)) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
                lastDate = log.date;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 0;
                lastDate = null;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        res.json({
            success: true,
            data: {
                habit_name,
                current_streak: currentStreak,
                longest_streak: longestStreak
            }
        });
    } catch (error) {
        console.error('Error in get_streaks:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Tool: get_sensitive_data (returns local storage data - placeholder)
app.post('/tools/get_sensitive_data', async (req, res) => {
    try {
        // This tool is for local storage only
        // The actual sensitive data (porn/alcohol) is stored in browser localStorage
        res.json({
            success: true,
            message: 'Sensitive data is stored locally in the browser only',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Tool: log_sensitive_data (placeholder)
app.post('/tools/log_sensitive_data', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Sensitive data should be logged via frontend localStorage only'
        });
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Helper function to check if two dates are consecutive
function isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

// Start server
app.listen(PORT, () => {
    console.log(`🔧 Habit Tracker MCP server running on http://localhost:${PORT}`);
});

