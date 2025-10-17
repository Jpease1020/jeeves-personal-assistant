import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_OURA_RING_PORT || 4016;

app.use(cors());
app.use(express.json());

const OURA_API_TOKEN = process.env.OURA_API_TOKEN;
const OURA_API_BASE = 'https://api.ouraring.com/v2/usercollection';

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'oura-ring-mcp' });
});

// Helper function to fetch from Oura API
async function fetchOuraData(endpoint: string) {
    if (!OURA_API_TOKEN) {
        throw new Error('OURA_API_TOKEN not configured');
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${OURA_API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${OURA_API_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`Oura API error: ${response.statusText}`);
    }

    return response.json();
}

// Tool: get_daily_readiness
app.post('/tools/get_daily_readiness', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const data = await fetchOuraData(`/daily_readiness?start_date=${targetDate}&end_date=${targetDate}`);

        const readiness = data.data?.[0];

        if (!readiness) {
            return res.json({
                success: true,
                data: null,
                message: 'No readiness data available for this date'
            });
        }

        // Parse readiness score and contributors
        const score = readiness.score || 0;
        const contributors = readiness.contributors || {};

        // Interpret readiness level
        let level = 'Good';
        let recommendation = 'You\'re ready for a normal workout day';

        if (score >= 85) {
            level = 'Excellent';
            recommendation = 'Perfect day for challenging workouts - push hard!';
        } else if (score >= 70) {
            level = 'Good';
            recommendation = 'Good day for a solid workout';
        } else if (score >= 60) {
            level = 'Fair';
            recommendation = 'Consider a moderate workout or active recovery';
        } else {
            level = 'Low';
            recommendation = 'Rest day or very light activity recommended';
        }

        res.json({
            success: true,
            data: {
                date: targetDate,
                readiness_score: score,
                level,
                recommendation,
                contributors: {
                    activity_balance: contributors.activity_balance || 0,
                    body_temperature: contributors.body_temperature || 0,
                    hrv_balance: contributors.hrv_balance || 0,
                    previous_day_activity: contributors.previous_day_activity || 0,
                    previous_night_sleep: contributors.previous_night_sleep || 0,
                    recovery_index: contributors.recovery_index || 0,
                    resting_heart_rate: contributors.resting_heart_rate || 0,
                    sleep_balance: contributors.sleep_balance || 0
                }
            }
        });
    } catch (error: any) {
        console.error('Error getting daily readiness:', error);
        res.status(500).json({
            error: error.message || 'Failed to get readiness data'
        });
    }
});

// Tool: get_sleep_data
app.post('/tools/get_sleep_data', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const data = await fetchOuraData(`/sleep?start_date=${targetDate}&end_date=${targetDate}`);

        const sleep = data.data?.[0];

        if (!sleep) {
            return res.json({
                success: true,
                data: null,
                message: 'No sleep data available for this date'
            });
        }

        const totalSleepSeconds = sleep.total_sleep_duration || 0;
        const totalSleepHours = (totalSleepSeconds / 3600).toFixed(1);
        const score = sleep.score || 0;

        // Interpret sleep quality
        let quality = 'Good';
        if (score >= 85) quality = 'Excellent';
        else if (score >= 70) quality = 'Good';
        else if (score < 70) quality = 'Poor';

        res.json({
            success: true,
            data: {
                date: targetDate,
                sleep_score: score,
                quality,
                total_sleep_hours: parseFloat(totalSleepHours),
                efficiency: sleep.efficiency || 0,
                latency_seconds: sleep.latency || 0,
                deep_sleep_duration_seconds: sleep.deep_sleep_duration || 0,
                rem_sleep_duration_seconds: sleep.rem_sleep_duration || 0,
                light_sleep_duration_seconds: sleep.light_sleep_duration || 0,
                restless_periods: sleep.restless_periods || 0,
                bedtime_start: sleep.bedtime_start,
                bedtime_end: sleep.bedtime_end
            }
        });
    } catch (error: any) {
        console.error('Error getting sleep data:', error);
        res.status(500).json({
            error: error.message || 'Failed to get sleep data'
        });
    }
});

// Tool: get_activity_summary
app.post('/tools/get_activity_summary', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const data = await fetchOuraData(`/daily_activity?start_date=${targetDate}&end_date=${targetDate}`);

        const activity = data.data?.[0];

        if (!activity) {
            return res.json({
                success: true,
                data: null,
                message: 'No activity data available for this date'
            });
        }

        res.json({
            success: true,
            data: {
                date: targetDate,
                activity_score: activity.score || 0,
                steps: activity.steps || 0,
                active_calories: activity.active_calories || 0,
                total_calories: activity.total_calories || 0,
                equivalent_walking_distance_meters: activity.equivalent_walking_distance || 0,
                low_activity_time_seconds: activity.low_activity_time || 0,
                medium_activity_time_seconds: activity.medium_activity_time || 0,
                high_activity_time_seconds: activity.high_activity_time || 0,
                inactivity_alerts: activity.inactivity_alerts || 0,
                average_met: activity.average_met_minutes || 0
            }
        });
    } catch (error: any) {
        console.error('Error getting activity summary:', error);
        res.status(500).json({
            error: error.message || 'Failed to get activity data'
        });
    }
});

// Tool: get_recovery_status
app.post('/tools/get_recovery_status', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Get both readiness and sleep for comprehensive recovery status
        const [readinessData, sleepData] = await Promise.all([
            fetchOuraData(`/daily_readiness?start_date=${today}&end_date=${today}`),
            fetchOuraData(`/sleep?start_date=${today}&end_date=${today}`)
        ]);

        const readiness = readinessData.data?.[0];
        const sleep = sleepData.data?.[0];

        const readinessScore = readiness?.score || 0;
        const sleepScore = sleep?.score || 0;
        const sleepHours = sleep?.total_sleep_duration ? (sleep.total_sleep_duration / 3600).toFixed(1) : 0;

        // Determine if ready for intense workout
        const readyForHeavyLifting = readinessScore >= 75 && sleepScore >= 70;
        const needsRest = readinessScore < 60 || sleepScore < 60;

        let recommendation = 'Proceed with normal workout';
        if (readyForHeavyLifting) {
            recommendation = 'Great recovery! Perfect for heavy lifting or intense training';
        } else if (needsRest) {
            recommendation = 'Consider rest day or light recovery work only';
        } else {
            recommendation = 'Moderate intensity recommended - avoid max effort today';
        }

        res.json({
            success: true,
            data: {
                date: today,
                readiness_score: readinessScore,
                sleep_score: sleepScore,
                sleep_hours: parseFloat(sleepHours as string),
                ready_for_heavy_lifting: readyForHeavyLifting,
                needs_rest: needsRest,
                recommendation,
                status: readyForHeavyLifting ? 'recovered' : needsRest ? 'needs_rest' : 'moderate'
            }
        });
    } catch (error: any) {
        console.error('Error getting recovery status:', error);
        res.status(500).json({
            error: error.message || 'Failed to get recovery status'
        });
    }
});

app.listen(PORT, () => {
    console.log(`💍 Oura Ring MCP server running on http://localhost:${PORT}`);
});

