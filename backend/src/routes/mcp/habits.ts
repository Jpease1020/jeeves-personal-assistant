import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Get habit status for a user and date
router.post('/status', async (req, res) => {
    try {
        const { userId, date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`📊 Fetching habit status for user ${userId} on ${targetDate}`);
        
        // For now, return mock data since we're using Notion for habits
        // In the future, this could sync with Notion or store completion status
        const mockHabits = [
            {
                name: 'Morning Exercise',
                completed: false,
                streak: 5,
                category: 'Health'
            },
            {
                name: 'Read 30 minutes',
                completed: true,
                streak: 12,
                category: 'Learning'
            },
            {
                name: 'Meditation',
                completed: false,
                streak: 3,
                category: 'Mindfulness'
            },
            {
                name: 'No Social Media After 9pm',
                completed: true,
                streak: 7,
                category: 'Digital Wellness'
            }
        ];
        
        res.json({
            success: true,
            habits: mockHabits,
            date: targetDate,
            totalHabits: mockHabits.length,
            completedHabits: mockHabits.filter(h => h.completed).length
        });
        
    } catch (error: any) {
        console.error('❌ Error fetching habit status:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch habit status',
            details: error.toString()
        });
    }
});

// Create a new habit
router.post('/create', async (req, res) => {
    try {
        const { userId, name, category, description } = req.body;
        
        console.log(`➕ Creating habit: ${name} for user ${userId}`);
        
        // For now, just return success since we're using Notion
        // In the future, this could create a habit in Notion or store in Supabase
        res.json({
            success: true,
            habit: {
                id: `habit_${Date.now()}`,
                name,
                category: category || 'General',
                description: description || '',
                userId,
                createdAt: new Date().toISOString()
            }
        });
        
    } catch (error: any) {
        console.error('❌ Error creating habit:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to create habit',
            details: error.toString()
        });
    }
});

// Mark habit as completed
router.post('/complete', async (req, res) => {
    try {
        const { userId, habitId, date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`✅ Marking habit ${habitId} as completed for user ${userId} on ${targetDate}`);
        
        // For now, just return success since we're using Notion
        // In the future, this could update Notion or store completion in Supabase
        res.json({
            success: true,
            completion: {
                habitId,
                userId,
                date: targetDate,
                completedAt: new Date().toISOString()
            }
        });
        
    } catch (error: any) {
        console.error('❌ Error completing habit:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to complete habit',
            details: error.toString()
        });
    }
});

// Get habit analytics
router.get('/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        console.log(`📈 Fetching habit analytics for user ${userId} (${days} days)`);
        
        // For now, return mock analytics
        // In the future, this could calculate from Notion or Supabase data
        const mockAnalytics = {
            totalHabits: 4,
            averageCompletionRate: 0.75,
            longestStreak: 12,
            currentStreaks: {
                'Morning Exercise': 5,
                'Read 30 minutes': 12,
                'Meditation': 3,
                'No Social Media After 9pm': 7
            },
            weeklyTrend: [
                { week: 'Week 1', completionRate: 0.7 },
                { week: 'Week 2', completionRate: 0.8 },
                { week: 'Week 3', completionRate: 0.75 },
                { week: 'Week 4', completionRate: 0.8 }
            ]
        };
        
        res.json({
            success: true,
            analytics: mockAnalytics
        });
        
    } catch (error: any) {
        console.error('❌ Error fetching habit analytics:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch habit analytics',
            details: error.toString()
        });
    }
});

export default router;
