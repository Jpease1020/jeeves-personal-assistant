import { Router } from 'express';
import { blockedSiteService } from '../services/blocked-site-service';

const router = Router();

/**
 * POST /api/blocked-site
 * Log blocked site events for accountability
 */
router.post('/', async (req, res) => {
    try {
        const { userId, domain, action, reason, timestamp, fullUrl, source, userAgent, extensionVersion } = req.body;

        // Validate required fields
        if (!userId || !domain || !action) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, domain, action'
            });
        }

        // Validate action type
        const validActions = ['blocked', 'unlock_requested', 'unlocked'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid action. Must be one of: blocked, unlock_requested, unlocked'
            });
        }

        // Create blocked site event
        const eventData = {
            userId,
            domain: domain.toLowerCase(),
            action,
            reason: reason || null,
            timestamp: timestamp || new Date().toISOString(),
            fullUrl: fullUrl || null,
            source: source || 'extension',
            userAgent: userAgent || null,
            extensionVersion: extensionVersion || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || null
        };

        const result = await blockedSiteService.createEvent(eventData);

        console.log(`📊 Blocked site event logged: ${action} for ${domain} by ${userId}`);

        res.json({
            success: true,
            eventId: result.id,
            message: 'Event logged successfully'
        });

    } catch (error) {
        console.error('Error logging blocked site event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log event'
        });
    }
});

/**
 * GET /api/blocked-site/:userId
 * Get blocked site events for a user
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            startDate, 
            endDate, 
            action, 
            limit = 100, 
            offset = 0 
        } = req.query;

        const events = await blockedSiteService.getUserEvents({
            userId,
            startDate,
            endDate,
            action,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            events,
            total: events.length
        });

    } catch (error) {
        console.error('Error fetching blocked site events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});

/**
 * GET /api/blocked-site/:userId/stats
 * Get blocking statistics for a user
 */
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;

        const stats = await blockedSiteService.getUserStats(userId, parseInt(days));

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching blocked site stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats'
        });
    }
});

/**
 * GET /api/blocked-site/:userId/report
 * Generate accountability report for a user
 */
router.get('/:userId/report', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7, format = 'json' } = req.query;

        const report = await blockedSiteService.generateAccountabilityReport(userId, parseInt(days));

        if (format === 'csv') {
            // Generate CSV format
            const csv = blockedSiteService.generateCSVReport(report);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="blocked-sites-report-${userId}-${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send(csv);
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Error generating accountability report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report'
        });
    }
});

export { router as blockedSiteRouter };
