import { Router } from 'express';

const router = Router();

// Habits status endpoint
router.post('/status', async (req, res) => {
    try {
        const { userId, date } = req.body;

        console.log(`🔧 Fetching habits for user: ${userId}, date: ${date}`);

        // For now, return empty habits array
        // In production, this would connect to a habits database
        res.json({
            success: true,
            habits: []
        });

    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habits',
            error: error instanceof Error ? error.message : 'Unknown error',
            habits: []
        });
    }
});

export default router;