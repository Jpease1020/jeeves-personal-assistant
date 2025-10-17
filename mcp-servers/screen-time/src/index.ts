import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_SCREEN_TIME_PORT || 4018;

app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

// Screen time data structure
interface ScreenTimeData {
    userId: string;
    date: string;
    totalScreenTime: number; // in minutes
    appUsage: Array<{
        appName: string;
        category: string;
        timeSpent: number; // in minutes
        pickups: number;
    }>;
    distractionPatterns: Array<{
        timeRange: string;
        appName: string;
        duration: number;
        distractionLevel: 'low' | 'medium' | 'high';
    }>;
    focusScore: number; // 0-100
    breakReminders: number;
}

// Mock screen time data (in production, this would integrate with macOS Screen Time API)
const getScreenTimeData = async (userId: string, date: string): Promise<ScreenTimeData> => {
    // This is a mock implementation
    // In production, you'd use:
    // 1. macOS Screen Time API (requires entitlements)
    // 2. Third-party APIs like RescueTime
    // 3. Browser extensions for web usage

    return {
        userId,
        date,
        totalScreenTime: 0, // No data yet
        appUsage: [],
        distractionPatterns: [],
        focusScore: 0,
        breakReminders: 0
    };
};

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'screen-time-mcp' });
});

// Receive data from Chrome extension
app.post('/chrome-data', async (req, res) => {
    try {
        const { userId, date, totalScreenTime, appUsage, distractionPatterns, focusScore } = req.body;

        // Store in Supabase
        const { data, error } = await supabase
            .from('screen_time_summaries')
            .upsert({
                user_id: userId,
                date,
                total_screen_time: totalScreenTime,
                app_usage: appUsage,
                distraction_patterns: distractionPatterns,
                focus_score: focusScore,
                source: 'chrome_extension',
                created_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,date'
            });

        if (error) {
            console.error('Error storing Chrome data:', error);
            return res.status(500).json({ error: 'Failed to store data' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error processing Chrome data:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// Get screen time data for a specific date
app.get('/screen-time/:userId/:date', async (req, res) => {
    try {
        const { userId, date } = req.params;

        // Try to get data from Supabase first
        const { data: dbData, error } = await supabase
            .from('screen_time_summaries')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .single();

        if (dbData && !error) {
            // Return real data from database
            res.json({
                userId,
                date,
                totalScreenTime: dbData.total_screen_time || 0,
                appUsage: dbData.app_usage || [],
                distractionPatterns: dbData.distraction_patterns || [],
                focusScore: dbData.focus_score || 0,
                source: dbData.source || 'database'
            });
            return;
        }

        // Fallback to mock data if no real data
        const screenTimeData = await getScreenTimeData(userId, date);
        res.json(screenTimeData);
    } catch (error) {
        console.error('Error fetching screen time data:', error);
        res.status(500).json({ error: 'Failed to fetch screen time data' });
    }
});

// Get distraction patterns
app.get('/distraction-patterns/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = '7' } = req.query;

        // Mock distraction analysis
        const patterns = {
            userId,
            analysisPeriod: `${days} days`,
            averageFocusScore: 68,
            topDistractions: [
                { appName: 'Safari', category: 'Web Browsing', distractionScore: 85 },
                { appName: 'Slack', category: 'Communication', distractionScore: 70 },
                { appName: 'Messages', category: 'Communication', distractionScore: 60 }
            ],
            peakDistractionTimes: ['09:00-10:00', '14:00-15:00', '16:00-17:00'],
            recommendations: [
                'Use website blockers during peak distraction times',
                'Set specific times for checking messages',
                'Take breaks every 25 minutes using Pomodoro technique'
            ]
        };

        res.json(patterns);
    } catch (error) {
        console.error('Error analyzing distraction patterns:', error);
        res.status(500).json({ error: 'Failed to analyze distraction patterns' });
    }
});

// Set screen time goals
app.post('/goals/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { dailyLimit, breakInterval, focusApps, blockedApps } = req.body;

        const goal = {
            userId,
            dailyLimit, // in minutes
            breakInterval, // in minutes
            focusApps, // apps to encourage
            blockedApps, // apps to block during focus time
            createdAt: new Date().toISOString()
        };

        // Store in database
        const { data, error } = await supabase
            .from('screen_time_goals')
            .upsert(goal)
            .select();

        if (error) throw error;

        res.json({ success: true, goal: data[0] });
    } catch (error) {
        console.error('Error setting screen time goals:', error);
        res.status(500).json({ error: 'Failed to set screen time goals' });
    }
});

// Get focus recommendations
app.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const recommendations = {
            userId,
            timestamp: new Date().toISOString(),
            currentFocusScore: 65,
            recommendations: [
                {
                    type: 'break_reminder',
                    message: 'You\'ve been focused for 45 minutes. Time for a 5-minute break!',
                    priority: 'high',
                    action: 'take_break'
                },
                {
                    type: 'distraction_block',
                    message: 'Safari usage is high. Consider blocking distracting websites.',
                    priority: 'medium',
                    action: 'block_websites'
                },
                {
                    type: 'focus_session',
                    message: 'Your focus score is improving! Keep up the good work.',
                    priority: 'low',
                    action: 'continue_focus'
                }
            ]
        };

        res.json(recommendations);
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Real-time distraction detection (WebSocket)
app.post('/detect-distraction', async (req, res) => {
    try {
        const { userId, appName, timeSpent, context } = req.body;

        // Analyze if this is a distraction
        const distractionLevel = analyzeDistraction(appName, timeSpent, context);

        if (distractionLevel === 'high') {
            // Send proactive notification
            await sendDistractionAlert(userId, appName, timeSpent);
        }

        res.json({
            distractionLevel,
            shouldIntervene: distractionLevel === 'high',
            message: distractionLevel === 'high' ? 'High distraction detected' : 'Normal usage'
        });
    } catch (error) {
        console.error('Error detecting distraction:', error);
        res.status(500).json({ error: 'Failed to detect distraction' });
    }
});

// Helper functions
function analyzeDistraction(appName: string, timeSpent: number, context: any): 'low' | 'medium' | 'high' {
    const distractingApps = ['Safari', 'Twitter', 'Instagram', 'TikTok', 'YouTube'];
    const productiveApps = ['Xcode', 'VS Code', 'Notion', 'Calendar'];

    if (distractingApps.includes(appName) && timeSpent > 30) {
        return 'high';
    } else if (distractingApps.includes(appName) && timeSpent > 15) {
        return 'medium';
    } else if (productiveApps.includes(appName)) {
        return 'low';
    }

    return 'medium';
}

async function sendDistractionAlert(userId: string, appName: string, timeSpent: number) {
    // This would integrate with the notification service
    console.log(`🚨 Distraction Alert: ${userId} spent ${timeSpent} minutes on ${appName}`);

    // Store distraction event
    const { error } = await supabase
        .from('distraction_events')
        .insert({
            user_id: userId,
            app_name: appName,
            time_spent: timeSpent,
            timestamp: new Date().toISOString()
        });

    if (error) {
        console.error('Error storing distraction event:', error);
    }
}

app.listen(PORT, () => {
    console.log(`📱 Screen Time MCP server running on http://localhost:${PORT}`);
});
