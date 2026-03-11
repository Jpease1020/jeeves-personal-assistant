import { Router } from 'express';
import { mochiService } from '../services/mochi-service';
import { spanishStudyService } from '../services/spanish-study';

const router = Router();

/**
 * POST /api/mochi/analyze
 * Let Jeeves analyze your Notion content and explain it back to you
 */
router.post('/analyze', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Step 1: Sync from Notion to Supabase
        console.log('📚 Analyzing Notion content...');
        const notionSync = await spanishStudyService.syncFromNotion(userId);

        // Get the synced items
        const supabase = spanishStudyService.supabase;
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        const { data: studyItems } = await supabase
            .from('spanish_study_items')
            .select('*')
            .eq('user_id', userId);

        res.json({
            success: true,
            message: `Found ${notionSync.synced} items from Notion`,
            data: {
                itemsCount: studyItems?.length || 0,
                items: studyItems,
                summary: `Found ${studyItems?.length || 0} study items. Ready to sync to Mochi!`
            }
        });
    } catch (error: any) {
        console.error('Error analyzing Notion content:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze Notion content'
        });
    }
});

/**
 * POST /api/mochi/sync
 * Sync Spanish study content from Notion to Mochi
 */
router.post('/sync', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Step 1: Sync from Notion to Supabase
        console.log('📚 Step 1: Syncing from Notion...');
        const notionSync = await spanishStudyService.syncFromNotion(userId);
        console.log(`✅ Notion sync complete: ${notionSync.synced} items synced`);

        // Step 2: Get all Spanish items from Supabase
        console.log('📝 Step 2: Fetching items from Supabase...');

        // Access Supabase client directly from the service
        const supabase = spanishStudyService.supabase;
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        const { data: studyItems, error } = await supabase
            .from('spanish_study_items')
            .select('content, type, tags')
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Failed to fetch items from Supabase: ${error.message}`);
        }

        if (!studyItems || studyItems.length === 0) {
            return res.json({
                success: true,
                message: 'No Spanish study items found. Sync from Notion first.',
                data: { created: 0, errors: [] }
            });
        }

        console.log(`📊 Found ${studyItems.length} items in Supabase`);

        // Parse content and convert to Mochi format
        const mochiItems: Array<{ front: string; back: string; context?: string }> = studyItems
            .filter((item: any) => item.content && item.content.includes('='))
            .map((item: any) => {
                const parts = item.content.split('=');
                return {
                    front: parts[0]?.trim() || '',
                    back: parts[1]?.trim() || '',
                    context: item.tags?.join(', ') || undefined
                };
            });

        // Step 3: Sync to Mochi
        console.log('🎴 Step 3: Syncing to Mochi...');
        const result = await mochiService.syncNotionContentToMochi(mochiItems);

        res.json({
            success: true,
            message: `Synced ${result.created} items to Mochi`,
            data: result
        });
    } catch (error: any) {
        console.error('Error syncing to Mochi:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sync to Mochi'
        });
    }
});

/**
 * GET /api/mochi/decks
 * Get all Mochi decks
 */
router.get('/decks', async (req, res) => {
    try {
        const decks = await mochiService.getDecks();

        res.json({
            success: true,
            data: {
                decks,
                count: decks.length
            }
        });
    } catch (error: any) {
        console.error('Error getting Mochi decks:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get Mochi decks'
        });
    }
});

/**
 * GET /api/mochi/deck/:deckId/cards
 * Get all cards from a specific deck
 */
router.get('/deck/:deckId/cards', async (req, res) => {
    try {
        const { deckId } = req.params;
        const cards = await mochiService.getCardsFromDeck(deckId);

        res.json({
            success: true,
            data: {
                cards,
                count: cards.length
            }
        });
    } catch (error: any) {
        console.error('Error getting cards from deck:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get cards from deck'
        });
    }
});

/**
 * GET /api/mochi/deck/:deckId/stats
 * Get review statistics for a deck
 */
router.get('/deck/:deckId/stats', async (req, res) => {
    try {
        const { deckId } = req.params;
        const stats = await mochiService.getReviewStats(deckId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Error getting deck stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get deck stats'
        });
    }
});

export { router as mochiRouter };
