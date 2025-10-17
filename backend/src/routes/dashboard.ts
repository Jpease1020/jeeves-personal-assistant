import { Router } from 'express';
import { getDashboardData } from '../services/dashboard-enhanced';

export const dashboardRouter = Router();

// Get all dashboard data
dashboardRouter.get('/', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';

        const data = await getDashboardData(userId);

        res.json({
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

