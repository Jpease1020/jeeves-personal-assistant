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

// Get screen time data for a user and date
router.get('/:userId/:date', async (req, res) => {
    try {
        const { userId, date } = req.params;
        
        console.log(`📱 Fetching screen time data for user ${userId} on ${date}`);
        
        // Query screen time data from Supabase
        const { data, error } = await supabase
            .from('screen_time_summaries')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        if (data && data.length > 0) {
            const screenTimeData = data[0];
            res.json({
                success: true,
                data: {
                    userId: screenTimeData.user_id,
                    date: screenTimeData.date,
                    totalScreenTime: screenTimeData.total_screen_time || 0,
                    appBreakdown: screenTimeData.app_breakdown || {},
                    websiteBreakdown: screenTimeData.website_breakdown || {},
                    productivityScore: screenTimeData.productivity_score || 0,
                    distractionEvents: screenTimeData.distraction_events || 0,
                    source: screenTimeData.source || 'chrome_extension',
                    createdAt: screenTimeData.created_at
                }
            });
        } else {
            // Return empty data if no records found
            res.json({
                success: true,
                data: {
                    userId,
                    date,
                    totalScreenTime: 0,
                    appBreakdown: {},
                    websiteBreakdown: {},
                    productivityScore: 0,
                    distractionEvents: 0,
                    source: 'chrome_extension',
                    createdAt: new Date().toISOString()
                },
                message: 'No screen time data available for this date'
            });
        }
        
    } catch (error: any) {
        console.error('❌ Error fetching screen time data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch screen time data',
            details: error.toString()
        });
    }
});

// Store screen time data from Chrome extension
router.post('/chrome-data', async (req, res) => {
    try {
        const { userId, date, totalTime, appBreakdown, websiteBreakdown } = req.body;
        
        console.log(`💾 Storing screen time data for user ${userId} on ${date}`);
        
        // Calculate productivity score based on time spent on productive vs distracting sites
        const productiveSites = ['github.com', 'stackoverflow.com', 'notion.so', 'calendar.google.com'];
        const distractingSites = ['instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com'];
        
        let productiveTime = 0;
        let distractingTime = 0;
        
        Object.entries(websiteBreakdown || {}).forEach(([site, time]: [string, any]) => {
            if (productiveSites.some(prod => site.includes(prod))) {
                productiveTime += time;
            } else if (distractingSites.some(dist => site.includes(dist))) {
                distractingTime += time;
            }
        });
        
        const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 100;
        
        // Store in Supabase
        const { data, error } = await supabase
            .from('screen_time_summaries')
            .upsert({
                user_id: userId,
                date: date,
                total_screen_time: totalTime,
                app_breakdown: appBreakdown || {},
                website_breakdown: websiteBreakdown || {},
                productivity_score: productivityScore,
                distraction_events: Object.keys(websiteBreakdown || {}).filter(site => 
                    distractingSites.some(dist => site.includes(dist))
                ).length,
                source: 'chrome_extension'
            }, {
                onConflict: 'user_id,date'
            });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log(`✅ Stored screen time data for user ${userId}`);
        res.json({
            success: true,
            message: 'Screen time data stored successfully',
            productivityScore
        });
        
    } catch (error: any) {
        console.error('❌ Error storing screen time data:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to store screen time data',
            details: error.toString()
        });
    }
});

// Get screen time analytics
router.get('/analytics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;
        
        console.log(`📊 Fetching screen time analytics for user ${userId} (${days} days)`);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days as string));
        
        // Query screen time data from Supabase
        const { data, error } = await supabase
            .from('screen_time_summaries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        // Calculate analytics
        const analytics = {
            totalDays: data?.length || 0,
            averageScreenTime: 0,
            averageProductivityScore: 0,
            totalDistractionEvents: 0,
            topApps: {} as Record<string, number>,
            topWebsites: {} as Record<string, number>,
            dailyBreakdown: data?.map(record => ({
                date: record.date,
                totalScreenTime: record.total_screen_time,
                productivityScore: record.productivity_score,
                distractionEvents: record.distraction_events
            })) || []
        };
        
        if (data && data.length > 0) {
            analytics.averageScreenTime = Math.round(
                data.reduce((sum, record) => sum + (record.total_screen_time || 0), 0) / data.length
            );
            analytics.averageProductivityScore = Math.round(
                data.reduce((sum, record) => sum + (record.productivity_score || 0), 0) / data.length
            );
            analytics.totalDistractionEvents = data.reduce(
                (sum, record) => sum + (record.distraction_events || 0), 0
            );
            
            // Aggregate top apps and websites
            data.forEach(record => {
                Object.entries(record.app_breakdown || {}).forEach(([app, time]: [string, any]) => {
                    analytics.topApps[app] = (analytics.topApps[app] || 0) + time;
                });
                Object.entries(record.website_breakdown || {}).forEach(([site, time]: [string, any]) => {
                    analytics.topWebsites[site] = (analytics.topWebsites[site] || 0) + time;
                });
            });
        }
        
        res.json({
            success: true,
            analytics
        });
        
    } catch (error: any) {
        console.error('❌ Error fetching screen time analytics:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch screen time analytics',
            details: error.toString()
        });
    }
});

export default router;
