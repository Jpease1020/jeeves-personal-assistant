import { Router } from 'express';

const router = Router();

// Screen time data endpoint
router.get('/:userId/:date', async (req, res) => {
    try {
        const { userId, date } = req.params;

        console.log(`📱 Fetching screen time for user: ${userId}, date: ${date}`);

        // For now, return empty screen time data
        // In production, this would connect to screen time tracking
        res.json({
            success: true,
            data: {
                totalScreenTime: 0,
                productivityScore: 0,
                appBreakdown: {},
                websiteBreakdown: {}
            }
        });

    } catch (error) {
        console.error('Error fetching screen time:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch screen time',
            error: error instanceof Error ? error.message : 'Unknown error',
            data: null
        });
    }
});

// Chrome extension data endpoint
router.post('/chrome-data', async (req, res) => {
    try {
        const { userId, date, data } = req.body;

        console.log(`📊 Received Chrome extension data for ${userId} on ${date}`);

        // For now, just acknowledge receipt
        // In production, this would store the data
        res.json({
            success: true,
            message: 'Screen time data received'
        });

    } catch (error) {
        console.error('Error processing Chrome extension data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process screen time data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;