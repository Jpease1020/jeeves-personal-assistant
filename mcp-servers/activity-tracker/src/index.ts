import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_ACTIVITY_TRACKER_PORT || 4015;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Distraction apps list
const DISTRACTION_APPS = [
    'instagram',
    'facebook',
    'twitter',
    'tiktok',
    'reddit',
    'youtube',
    'snapchat'
];

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'activity-tracker-mcp' });
});

// Tool: start_activity
app.post('/tools/start_activity', async (req, res) => {
    try {
        const { activity_name, task_id, estimated_duration_mins, userId } = req.body;

        if (!activity_name) {
            return res.status(400).json({ error: 'Activity name is required' });
        }

        // Check if there's an open activity - close it first
        const { data: openActivities } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .is('end_time', null);

        if (openActivities && openActivities.length > 0) {
            // Auto-close previous activity
            await supabase
                .from('activities')
                .update({ end_time: new Date().toISOString() })
                .eq('id', openActivities[0].id);
        }

        // Create new activity
        const { data, error } = await supabase
            .from('activities')
            .insert({
                user_id: userId || 'default-user',
                activity_name,
                task_id,
                estimated_duration_mins: estimated_duration_mins || 60,
                start_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            data: {
                activity_id: data.id,
                activity_name,
                started_at: data.start_time,
                estimated_end: new Date(new Date(data.start_time).getTime() + (estimated_duration_mins || 60) * 60000).toISOString()
            },
            message: `Started working on: ${activity_name}`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: end_activity
app.post('/tools/end_activity', async (req, res) => {
    try {
        const { activity_id, progress_notes, userId } = req.body;

        let activityToEnd;

        if (activity_id) {
            // End specific activity
            const { data } = await supabase
                .from('activities')
                .select('*')
                .eq('id', activity_id)
                .single();
            activityToEnd = data;
        } else {
            // End current open activity
            const { data } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', userId || 'default-user')
                .is('end_time', null)
                .order('start_time', { ascending: false })
                .limit(1)
                .single();
            activityToEnd = data;
        }

        if (!activityToEnd) {
            return res.status(404).json({ error: 'No active activity found' });
        }

        const endTime = new Date().toISOString();
        const startTime = new Date(activityToEnd.start_time);
        const durationMins = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000);

        await supabase
            .from('activities')
            .update({
                end_time: endTime,
                progress_notes
            })
            .eq('id', activityToEnd.id);

        res.json({
            success: true,
            data: {
                activity_id: activityToEnd.id,
                activity_name: activityToEnd.activity_name,
                duration_mins: durationMins,
                started_at: activityToEnd.start_time,
                ended_at: endTime
            },
            message: `Completed: ${activityToEnd.activity_name} (${durationMins} mins)`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: get_current_activity
app.post('/tools/get_current_activity', async (req, res) => {
    try {
        const { userId } = req.body;

        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .is('end_time', null)
            .order('start_time', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return res.json({
                success: true,
                data: null,
                message: 'No current activity'
            });
        }

        const timeElapsed = Math.round((new Date().getTime() - new Date(data.start_time).getTime()) / 60000);

        res.json({
            success: true,
            data: {
                activity_id: data.id,
                activity_name: data.activity_name,
                started_at: data.start_time,
                time_elapsed_mins: timeElapsed,
                estimated_duration_mins: data.estimated_duration_mins
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: check_for_stuck
app.post('/tools/check_for_stuck', async (req, res) => {
    try {
        const { userId } = req.body;

        const { data: currentActivity } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .is('end_time', null)
            .order('start_time', { ascending: false })
            .limit(1)
            .single();

        if (!currentActivity) {
            return res.json({
                success: true,
                data: {
                    is_stuck: false,
                    message: 'No current activity to check'
                }
            });
        }

        const timeElapsed = Math.round((new Date().getTime() - new Date(currentActivity.start_time).getTime()) / 60000);
        const estimatedDuration = currentActivity.estimated_duration_mins || 60;

        // Consider "stuck" if activity has been running for 2x estimated duration
        const isStuck = timeElapsed > estimatedDuration * 2;

        if (isStuck) {
            // Mark as stuck in database
            await supabase
                .from('activities')
                .update({ stuck: true })
                .eq('id', currentActivity.id);
        }

        res.json({
            success: true,
            data: {
                is_stuck: isStuck,
                activity_name: currentActivity.activity_name,
                time_elapsed_mins: timeElapsed,
                estimated_duration_mins: estimatedDuration,
                message: isStuck
                    ? `You've been working on "${currentActivity.activity_name}" for ${timeElapsed} mins (estimated: ${estimatedDuration}). Need help?`
                    : 'On track'
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: log_screentime
app.post('/tools/log_screentime', async (req, res) => {
    try {
        const { app_name, duration_mins, date, userId } = req.body;

        if (!app_name || !duration_mins) {
            return res.status(400).json({ error: 'App name and duration are required' });
        }

        const isDistraction = DISTRACTION_APPS.some(app =>
            app_name.toLowerCase().includes(app)
        );

        const targetDate = date || new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('screentime_logs')
            .insert({
                user_id: userId || 'default-user',
                date: targetDate,
                app_name,
                duration_mins,
                is_distraction_app: isDistraction
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            data: {
                app_name,
                duration_mins,
                is_distraction: isDistraction
            },
            message: `Screen time logged: ${app_name} (${duration_mins} mins)`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: get_screentime_report
app.post('/tools/get_screentime_report', async (req, res) => {
    try {
        const { date, userId } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('screentime_logs')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .eq('date', targetDate);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const totalTime = data?.reduce((sum, log) => sum + log.duration_mins, 0) || 0;
        const distractionTime = data
            ?.filter(log => log.is_distraction_app)
            .reduce((sum, log) => sum + log.duration_mins, 0) || 0;

        res.json({
            success: true,
            data: {
                date: targetDate,
                total_screen_time_mins: totalTime,
                distraction_time_mins: distractionTime,
                distraction_percentage: totalTime > 0 ? Math.round((distractionTime / totalTime) * 100) : 0,
                apps: data || []
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: detect_distraction
app.post('/tools/detect_distraction', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('screentime_logs')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .eq('date', today)
            .eq('is_distraction_app', true);

        const totalDistractionTime = data?.reduce((sum, log) => sum + log.duration_mins, 0) || 0;

        // Threshold: more than 30 mins on distraction apps today
        const isDistracted = totalDistractionTime > 30;

        res.json({
            success: true,
            data: {
                is_distracted: isDistracted,
                distraction_time_mins: totalDistractionTime,
                message: isDistracted
                    ? `You've spent ${totalDistractionTime} mins on social media/distracting apps today. Ready to refocus?`
                    : 'Staying focused today!'
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`📊 Activity Tracker MCP server running on http://localhost:${PORT}`);
});

