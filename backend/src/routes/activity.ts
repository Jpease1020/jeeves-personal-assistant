import { Router } from 'express';

export const activityRouter = Router();

// Start activity tracking
activityRouter.post('/start', async (req, res) => {
    try {
        const { userId, activityName, taskId, estimatedDuration } = req.body;

        if (!activityName) {
            return res.status(400).json({ error: 'Activity name is required' });
        }

        // TODO: Call Activity Tracker MCP server
        // For now, just acknowledge
        const activity = {
            id: Date.now().toString(),
            activityName,
            taskId,
            estimatedDuration,
            startTime: new Date().toISOString(),
            userId: userId || 'default-user'
        };

        res.json({
            activity,
            message: 'Activity started successfully'
        });
    } catch (error) {
        console.error('Error starting activity:', error);
        res.status(500).json({
            error: 'Failed to start activity',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// End activity tracking
activityRouter.post('/end', async (req, res) => {
    try {
        const { userId, activityId, notes } = req.body;

        if (!activityId) {
            return res.status(400).json({ error: 'Activity ID is required' });
        }

        // TODO: Call Activity Tracker MCP server
        res.json({
            activityId,
            endTime: new Date().toISOString(),
            message: 'Activity ended successfully'
        });
    } catch (error) {
        console.error('Error ending activity:', error);
        res.status(500).json({
            error: 'Failed to end activity',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get current activity
activityRouter.get('/current', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';

        // TODO: Call Activity Tracker MCP server
        res.json({
            currentActivity: null,
            message: 'No current activity'
        });
    } catch (error) {
        console.error('Error fetching current activity:', error);
        res.status(500).json({
            error: 'Failed to fetch current activity',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

