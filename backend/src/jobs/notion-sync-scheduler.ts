// Add to your existing scheduler
import { notionSyncService } from '../services/notion-sync';

// Add this to your scheduled jobs
export function startScheduledJobs() {
    // Existing jobs...

    // NEW: Daily Notion sync at 6:30 AM
    cron.schedule('30 6 * * *', async () => {
        console.log('[CRON] Running Notion sync...');
        try {
            await notionSyncService.syncDailyTasks('default-user');
            console.log('[CRON] Notion sync completed');
        } catch (error) {
            console.error('[CRON] Notion sync failed:', error);
        }
    });

    // NEW: Midday sync at 12:00 PM (for task updates)
    cron.schedule('0 12 * * *', async () => {
        console.log('[CRON] Running midday Notion sync...');
        try {
            await notionSyncService.syncDailyTasks('default-user');
            console.log('[CRON] Midday sync completed');
        } catch (error) {
            console.error('[CRON] Midday sync failed:', error);
        }
    });

    // NEW: Evening sync at 8:00 PM (for completion tracking)
    cron.schedule('0 20 * * *', async () => {
        console.log('[CRON] Running evening Notion sync...');
        try {
            await notionSyncService.syncDailyTasks('default-user');
            console.log('[CRON] Evening sync completed');
        } catch (error) {
            console.error('[CRON] Evening sync failed:', error);
        }
    });
}
