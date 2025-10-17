import cron from 'node-cron';
import { chatWithAgent } from '../services/ai-agent';

/**
 * Start all scheduled background jobs
 */
export function startScheduledJobs() {
    // Morning Briefing (6:00 AM every day)
    cron.schedule('0 6 * * *', async () => {
        console.log('[CRON] Running morning briefing job...');
        try {
            const briefing = await chatWithAgent(
                'Generate my morning briefing for today. Include calendar, priorities, and a motivational connection to my goals.',
                'default-user'
            );

            // Send briefing to all connected WebSocket clients
            broadcastToClients({
                type: 'morning-briefing',
                content: briefing,
                timestamp: new Date().toISOString()
            });

            console.log('[CRON] Morning briefing sent');
        } catch (error) {
            console.error('[CRON] Error in morning briefing:', error);
        }
    });

    // Evening Check-in (9:00 PM every day)
    cron.schedule('0 21 * * *', async () => {
        console.log('[CRON] Running evening check-in job...');
        try {
            const checkIn = await chatWithAgent(
                'Let\'s do my evening check-in. Review my habits for today and ask about accountability.',
                'default-user'
            );

            broadcastToClients({
                type: 'evening-check-in',
                content: checkIn,
                timestamp: new Date().toISOString()
            });

            console.log('[CRON] Evening check-in sent');
        } catch (error) {
            console.error('[CRON] Error in evening check-in:', error);
        }
    });

    // Stuck Detection (Every 30 minutes during work hours: 8 AM - 8 PM)
    cron.schedule('*/30 8-20 * * *', async () => {
        console.log('[CRON] Running stuck detection...');
        try {
            // TODO: Check with Activity Tracker MCP if user is stuck
            // For now, just log
            console.log('[CRON] Stuck detection check complete');
        } catch (error) {
            console.error('[CRON] Error in stuck detection:', error);
        }
    });

    // Upcoming Event Reminder (Every hour during work hours)
    cron.schedule('0 8-20 * * *', async () => {
        console.log('[CRON] Checking for upcoming events...');
        try {
            // TODO: Check calendar for events in next 2 hours
            // Send reminders if needed
            console.log('[CRON] Event check complete');
        } catch (error) {
            console.error('[CRON] Error checking events:', error);
        }
    });

    console.log('Scheduled jobs registered:');
    console.log('  - Morning briefing: 6:00 AM daily');
    console.log('  - Evening check-in: 9:00 PM daily');
    console.log('  - Stuck detection: Every 30 mins (8 AM - 8 PM)');
    console.log('  - Event reminders: Hourly (8 AM - 8 PM)');
}

/**
 * Broadcast message to all connected WebSocket clients
 * We import wss dynamically to avoid circular dependency
 */
function broadcastToClients(message: any) {
    const messageStr = JSON.stringify(message);
    // Dynamic import to avoid circular dependency
    import('../index').then(({ wss }) => {
        wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(messageStr);
            }
        });
    }).catch(err => {
        console.error('Error broadcasting message:', err);
    });
}

