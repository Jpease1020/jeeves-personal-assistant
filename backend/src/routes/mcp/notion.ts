import { Router } from 'express';
import { Client } from '@notionhq/client';

const router = Router();

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

// Tasks endpoint
router.post('/tasks', async (req, res) => {
    try {
        const { list_name } = req.body;

        console.log(`📋 Fetching tasks for list: ${list_name}`);

        if (!process.env.NOTION_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'NOTION_API_KEY not configured',
                tasks: []
            });
        }

        // Search for pages with "TO-DO" in the title
        const searchResponse = await notion.search({
            query: 'TO-DO',
            filter: {
                property: 'object',
                value: 'page'
            }
        });

        const tasks: any[] = [];

        for (const page of searchResponse.results) {
            if ('id' in page) {
                const pageId = page.id;

                // Get page blocks
                const blocksResponse = await notion.blocks.children.list({
                    block_id: pageId
                });

                for (const block of blocksResponse.results) {
                    const blockAny = block as any;
                    if (blockAny.type === 'to_do') {
                        tasks.push({
                            id: block.id,
                            title: blockAny.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                            status: blockAny.to_do?.checked ? 'Done' : 'Not started',
                            priority: 'Medium',
                            dueDate: null,
                            url: `https://notion.so/${pageId}#${block.id}`,
                            list: list_name || 'justin',
                            completed: blockAny.to_do?.checked || false
                        });
                    } else if (blockAny.type === 'bulleted_list_item') {
                        tasks.push({
                            id: block.id,
                            title: blockAny.bulleted_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                            status: 'Not started',
                            priority: 'Medium',
                            dueDate: null,
                            url: `https://notion.so/${pageId}#${block.id}`,
                            list: list_name || 'justin',
                            completed: false
                        });
                    } else if (blockAny.type === 'numbered_list_item') {
                        tasks.push({
                            id: block.id,
                            title: blockAny.numbered_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                            status: 'Not started',
                            priority: 'Medium',
                            dueDate: null,
                            url: `https://notion.so/${pageId}#${block.id}`,
                            list: list_name || 'justin',
                            completed: false
                        });
                    }
                }
            }
        }

        res.json({
            success: true,
            tasks: tasks.slice(0, 10) // Limit to 10 tasks
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error instanceof Error ? error.message : 'Unknown error',
            tasks: []
        });
    }
});

export default router;