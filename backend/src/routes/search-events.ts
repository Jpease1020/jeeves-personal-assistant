import { Router } from 'express';
import { searchEventService } from '../services/search-event-service';

const router = Router();

/**
 * POST /api/search-events
 * Log search query events for accountability
 */
router.post('/', async (req, res) => {
    try {
        const { userId, query, source, url, severity, matchedKeywords, timestamp } = req.body;

        // Validate required fields
        if (!userId || !query || !source) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, query, source'
            });
        }

        // Validate severity
        const validSeverities = ['explicit', 'moderate', 'suspicious'];
        if (!validSeverities.includes(severity)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid severity. Must be one of: explicit, moderate, suspicious'
            });
        }

        // Create search event
        const eventData = {
            userId,
            query: query.toLowerCase(),
            source: source.toLowerCase(),
            url: url || null,
            severity,
            matchedKeywords: matchedKeywords || [],
            timestamp: timestamp || new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || null
        };

        const result = await searchEventService.createEvent(eventData);

        console.log(`🔍 Search event logged: ${severity} query "${query}" on ${source} by ${userId}`);

        res.json({
            success: true,
            eventId: result.id,
            message: 'Search event logged successfully'
        });

    } catch (error) {
        console.error('Error logging search event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log search event'
        });
    }
});

/**
 * GET /api/search-events/:userId
 * Get search events for a user
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            startDate, 
            endDate, 
            severity, 
            source,
            limit = 100, 
            offset = 0 
        } = req.query;

        const events = await searchEventService.getUserEvents({
            userId,
            startDate,
            endDate,
            severity,
            source,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            events,
            total: events.length
        });

    } catch (error) {
        console.error('Error fetching search events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch search events'
        });
    }
});

/**
 * GET /api/search-events/:userId/stats
 * Get search statistics for a user
 */
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;

        const stats = await searchEventService.getUserStats(userId, parseInt(days));

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching search stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch search stats'
        });
    }
});

/**
 * GET /api/search-events/:userId/keywords
 * Get most searched keywords for a user
 */
router.get('/:userId/keywords', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30, limit = 50 } = req.query;

        const keywords = await searchEventService.getTopKeywords(userId, parseInt(days), parseInt(limit));

        res.json({
            success: true,
            keywords
        });

    } catch (error) {
        console.error('Error fetching top keywords:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch top keywords'
        });
    }
});

export { router as searchEventRouter };
