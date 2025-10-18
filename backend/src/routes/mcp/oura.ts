import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const router = express.Router();

const OURA_API_TOKEN = process.env.OURA_API_TOKEN;
const OURA_API_BASE = 'https://api.ouraring.com/v2/usercollection';

// Helper function to fetch from Oura API
async function fetchOuraData(endpoint: string) {
    if (!OURA_API_TOKEN) {
        throw new Error('OURA_API_TOKEN not configured');
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${OURA_API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${OURA_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Get sleep data
router.post('/sleep', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`💤 Fetching sleep data for: ${targetDate}`);
        
        const data = await fetchOuraData(`/daily_sleep?start_date=${targetDate}&end_date=${targetDate}`);
        
        if (data.data && data.data.length > 0) {
            const sleepData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: sleepData.day,
                    bedtimeStart: sleepData.bedtime_start,
                    bedtimeEnd: sleepData.bedtime_end,
                    totalSleepTime: sleepData.total_sleep_duration,
                    deepSleepTime: sleepData.deep_sleep_duration,
                    lightSleepTime: sleepData.light_sleep_duration,
                    remSleepTime: sleepData.rem_sleep_duration,
                    awakeTime: sleepData.awake_time,
                    sleepEfficiency: sleepData.sleep_efficiency,
                    sleepScore: sleepData.sleep_score,
                    restingHeartRate: sleepData.resting_heart_rate,
                    heartRateVariability: sleepData.heart_rate_variability
                }
            });
        } else {
            res.json({
                success: true,
                data: null,
                message: 'No sleep data available for this date'
            });
        }
        
    } catch (error: any) {
        console.error('❌ Error fetching sleep data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch sleep data',
            details: error.toString()
        });
    }
});

// Get daily readiness
router.post('/readiness', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`⚡ Fetching readiness data for: ${targetDate}`);
        
        const data = await fetchOuraData(`/daily_readiness?start_date=${targetDate}&end_date=${targetDate}`);
        
        if (data.data && data.data.length > 0) {
            const readinessData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: readinessData.day,
                    readinessScore: readinessData.readiness_score,
                    temperatureDeviation: readinessData.temperature_deviation,
                    temperatureTrend: readinessData.temperature_trend,
                    restingHeartRate: readinessData.resting_heart_rate,
                    heartRateVariability: readinessData.heart_rate_variability,
                    recoveryIndex: readinessData.recovery_index
                }
            });
        } else {
            res.json({
                success: true,
                data: null,
                message: 'No readiness data available for this date'
            });
        }
        
    } catch (error: any) {
        console.error('❌ Error fetching readiness data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch readiness data',
            details: error.toString()
        });
    }
});

// Get activity summary
router.post('/activity', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`🏃 Fetching activity data for: ${targetDate}`);
        
        const data = await fetchOuraData(`/daily_activity?start_date=${targetDate}&end_date=${targetDate}`);
        
        if (data.data && data.data.length > 0) {
            const activityData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: activityData.day,
                    activeCalories: activityData.active_calories,
                    averageMetMinutes: activityData.average_met_minutes,
                    highActivityMetMinutes: activityData.high_activity_met_minutes,
                    lowActivityMetMinutes: activityData.low_activity_met_minutes,
                    mediumActivityMetMinutes: activityData.medium_activity_met_minutes,
                    steps: activityData.steps,
                    totalCalories: activityData.total_calories,
                    activityScore: activityData.activity_score
                }
            });
        } else {
            res.json({
                success: true,
                data: null,
                message: 'No activity data available for this date'
            });
        }
        
    } catch (error: any) {
        console.error('❌ Error fetching activity data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch activity data',
            details: error.toString()
        });
    }
});

// Get recovery status
router.post('/recovery', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        console.log(`🔄 Fetching recovery data for: ${targetDate}`);
        
        const data = await fetchOuraData(`/daily_readiness?start_date=${targetDate}&end_date=${targetDate}`);
        
        if (data.data && data.data.length > 0) {
            const recoveryData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: recoveryData.day,
                    recoveryScore: recoveryData.readiness_score,
                    restingHeartRate: recoveryData.resting_heart_rate,
                    heartRateVariability: recoveryData.heart_rate_variability,
                    temperatureDeviation: recoveryData.temperature_deviation,
                    recoveryIndex: recoveryData.recovery_index
                }
            });
        } else {
            res.json({
                success: true,
                data: null,
                message: 'No recovery data available for this date'
            });
        }
        
    } catch (error: any) {
        console.error('❌ Error fetching recovery data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch recovery data',
            details: error.toString()
        });
    }
});

export default router;
