import { Router } from 'express';

const router = Router();

// Sleep data endpoint
router.post('/sleep', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        console.log(`💤 Fetching sleep data for: ${targetDate}`);

        const apiToken = process.env.OURA_API_TOKEN;
        if (!apiToken) {
            return res.status(500).json({
                success: false,
                message: 'OURA_API_TOKEN not configured',
                data: null
            });
        }

        const baseUrl = 'https://api.ouraring.com/v2';
        const url = `${baseUrl}/daily_sleep?start_date=${targetDate}&end_date=${targetDate}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;

        if (data.data && data.data.length > 0) {
            const sleepData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: sleepData.day,
                    bedtimeStart: sleepData.bedtime_start,
                    bedtimeEnd: sleepData.bedtime_end,
                    totalSleepTime: sleepData.total_sleep_duration,
                    sleepScore: sleepData.score,
                    sleepEfficiency: sleepData.efficiency,
                    deepSleep: sleepData.deep_sleep_duration,
                    lightSleep: sleepData.light_sleep_duration,
                    remSleep: sleepData.rem_sleep_duration,
                    awakeTime: sleepData.awake_time
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No sleep data available for this date',
                data: null
            });
        }
    } catch (error) {
        console.error('Error fetching sleep data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sleep data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Readiness data endpoint
router.post('/readiness', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        console.log(`📊 Fetching readiness data for: ${targetDate}`);

        const apiToken = process.env.OURA_API_TOKEN;
        if (!apiToken) {
            return res.status(500).json({
                success: false,
                message: 'OURA_API_TOKEN not configured',
                data: null
            });
        }

        const baseUrl = 'https://api.ouraring.com/v2';
        const url = `${baseUrl}/daily_readiness?start_date=${targetDate}&end_date=${targetDate}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;

        if (data.data && data.data.length > 0) {
            const readinessData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: readinessData.day,
                    readinessScore: readinessData.score,
                    restingHeartRate: readinessData.contributors.resting_heart_rate?.score || 0,
                    heartRateVariability: readinessData.contributors.hrv_balance?.score || 0,
                    recoveryIndex: readinessData.contributors.recovery_index?.score || 0,
                    temperature: readinessData.contributors.temperature?.score || 0
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No readiness data available for this date',
                data: null
            });
        }
    } catch (error) {
        console.error('Error fetching readiness data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch readiness data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Activity data endpoint
router.post('/activity', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        console.log(`🏃 Fetching activity data for: ${targetDate}`);

        const apiToken = process.env.OURA_API_TOKEN;
        if (!apiToken) {
            return res.status(500).json({
                success: false,
                message: 'OURA_API_TOKEN not configured',
                data: null
            });
        }

        const baseUrl = 'https://api.ouraring.com/v2';
        const url = `${baseUrl}/daily_activity?start_date=${targetDate}&end_date=${targetDate}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;

        if (data.data && data.data.length > 0) {
            const activityData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: activityData.day,
                    activityScore: activityData.score,
                    activeCalories: activityData.active_calories,
                    steps: activityData.steps,
                    sedentaryTime: activityData.sedentary_time,
                    lowActivityTime: activityData.low_activity_time,
                    mediumActivityTime: activityData.medium_activity_time,
                    highActivityTime: activityData.high_activity_time,
                    metMinutes: activityData.met_minutes
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No activity data available for this date',
                data: null
            });
        }
    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Recovery data endpoint
router.post('/recovery', async (req, res) => {
    try {
        console.log(`🔄 Fetching recovery data`);

        const apiToken = process.env.OURA_API_TOKEN;
        if (!apiToken) {
            return res.status(500).json({
                success: false,
                message: 'OURA_API_TOKEN not configured',
                data: null
            });
        }

        const baseUrl = 'https://api.ouraring.com/v2';
        const url = `${baseUrl}/recovery`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;

        if (data.data && data.data.length > 0) {
            const recoveryData = data.data[0];
            res.json({
                success: true,
                data: {
                    date: recoveryData.day,
                    recoveryScore: recoveryData.score,
                    restingHeartRate: recoveryData.resting_heart_rate,
                    heartRateVariability: recoveryData.hrv_balance,
                    temperature: recoveryData.temperature_deviation
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No recovery data available',
                data: null
            });
        }
    } catch (error) {
        console.error('Error fetching recovery data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recovery data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;