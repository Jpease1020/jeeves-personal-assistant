import { Router } from 'express';
import { calendarService } from '../services/calendar-service';

const router = Router();

/**
 * GET /api/calendar/auth-url
 * Get Google Calendar OAuth authorization URL
 */
router.get('/auth-url', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const authUrl = calendarService.getAuthUrl(userId as string);
        
        res.json({
            success: true,
            authUrl
        });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate authorization URL'
        });
    }
});

/**
 * POST /api/calendar/callback
 * Handle OAuth callback and exchange code for tokens
 */
router.post('/callback', async (req, res) => {
    try {
        const { code, state: userId } = req.body;
        
        if (!code || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Authorization code and user ID are required'
            });
        }

        const tokens = await calendarService.exchangeCodeForTokens(code, userId);
        
        console.log(`✅ Calendar integration completed for user: ${userId}`);
        
        res.json({
            success: true,
            message: 'Calendar integration successful',
            data: {
                hasIntegration: true,
                scopes: tokens.scope
            }
        });
    } catch (error) {
        console.error('Error in calendar callback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete calendar integration'
        });
    }
});

/**
 * GET /api/calendar/events
 * Get user's calendar events
 */
router.get('/events', async (req, res) => {
    try {
        const { userId, timeMin, timeMax, maxResults, calendarId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const events = await calendarService.getEvents(userId as string, {
            timeMin: timeMin as string,
            timeMax: timeMax as string,
            maxResults: maxResults ? parseInt(maxResults as string) : undefined,
            calendarId: calendarId as string
        });
        
        res.json({
            success: true,
            data: {
                events,
                count: events.length
            }
        });
    } catch (error) {
        console.error('Error getting calendar events:', error);
        
        if (error instanceof Error && error.message.includes('No calendar tokens')) {
            return res.status(401).json({
                success: false,
                error: 'Calendar not integrated. Please authenticate first.',
                needsAuth: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve calendar events'
        });
    }
});

/**
 * GET /api/calendar/upcoming
 * Get upcoming events for proactive assistance
 */
router.get('/upcoming', async (req, res) => {
    try {
        const { userId, hoursAhead = '24' } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const events = await calendarService.getUpcomingEvents(
            userId as string, 
            parseInt(hoursAhead as string)
        );
        
        res.json({
            success: true,
            data: {
                events,
                count: events.length,
                hoursAhead: parseInt(hoursAhead as string)
            }
        });
    } catch (error) {
        console.error('Error getting upcoming events:', error);
        
        if (error instanceof Error && error.message.includes('No calendar tokens')) {
            return res.status(401).json({
                success: false,
                error: 'Calendar not integrated. Please authenticate first.',
                needsAuth: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve upcoming events'
        });
    }
});

/**
 * GET /api/calendar/today
 * Get today's events
 */
router.get('/today', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const events = await calendarService.getTodaysEvents(userId as string);
        
        res.json({
            success: true,
            data: {
                events,
                count: events.length,
                date: new Date().toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error('Error getting today\'s events:', error);
        
        if (error instanceof Error && error.message.includes('No calendar tokens')) {
            return res.status(401).json({
                success: false,
                error: 'Calendar not integrated. Please authenticate first.',
                needsAuth: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve today\'s events'
        });
    }
});

/**
 * GET /api/calendar/status
 * Check if user has calendar integration
 */
router.get('/status', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const hasIntegration = await calendarService.hasIntegration(userId as string);
        
        res.json({
            success: true,
            data: {
                hasIntegration,
                userId
            }
        });
    } catch (error) {
        console.error('Error checking calendar status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check calendar integration status'
        });
    }
});

/**
 * DELETE /api/calendar/revoke
 * Revoke calendar integration
 */
router.delete('/revoke', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        await calendarService.revokeIntegration(userId);
        
        res.json({
            success: true,
            message: 'Calendar integration revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking calendar integration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke calendar integration'
        });
    }
});

/**
 * GET /api/calendar/freebusy
 * Get free/busy information
 */
router.get('/freebusy', async (req, res) => {
    try {
        const { userId, timeMin, timeMax } = req.query;
        
        if (!userId || !timeMin || !timeMax) {
            return res.status(400).json({
                success: false,
                error: 'userId, timeMin, and timeMax are required'
            });
        }

        const freeBusy = await calendarService.getFreeBusy(
            userId as string,
            timeMin as string,
            timeMax as string
        );
        
        res.json({
            success: true,
            data: {
                freeBusy,
                timeMin,
                timeMax
            }
        });
    } catch (error) {
        console.error('Error getting free/busy info:', error);
        
        if (error instanceof Error && error.message.includes('No calendar tokens')) {
            return res.status(401).json({
                success: false,
                error: 'Calendar not integrated. Please authenticate first.',
                needsAuth: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to get free/busy information'
        });
    }
});

export { router as calendarRouter };

