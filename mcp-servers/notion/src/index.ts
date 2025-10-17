import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Client } from '@notionhq/client';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_NOTION_PORT || 4012;

app.use(cors());
app.use(express.json());

// Initialize Notion client
console.log('🔑 Notion API Key loaded:', process.env.NOTION_API_KEY ? 'Yes' : 'No');
console.log('📋 Database IDs loaded:', {
    justin: process.env.NOTION_TASKS_DATABASE_ID ? 'Yes' : 'No',
    family: process.env.NOTION_FAMILY_TASKS_DATABASE_ID ? 'Yes' : 'No'
});
const notion = new Client({ auth: process.env.NOTION_API_KEY });
console.log('🔍 Available Notion methods:', Object.keys(notion));
console.log('🔍 Available database methods:', Object.keys(notion.databases));
console.log('🔍 Raw database IDs:', {
    justin_raw: process.env.NOTION_TASKS_DATABASE_ID,
    family_raw: process.env.NOTION_FAMILY_TASKS_DATABASE_ID
});

// Helper function to format Notion database IDs with hyphens
function formatNotionId(id: string): string {
    if (!id) return '';
    // Remove any existing hyphens and add them in the correct positions
    const cleanId = id.replace(/-/g, '');
    if (cleanId.length === 32) {
        return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20, 32)}`;
    }
    return id; // Return as-is if not 32 characters
}

// Database IDs for the to-do lists
const DATABASE_IDS = {
    'justin': formatNotionId(process.env.NOTION_TASKS_DATABASE_ID || ''),
    'family': formatNotionId(process.env.NOTION_FAMILY_TASKS_DATABASE_ID || ''),
    'shared': formatNotionId(process.env.NOTION_FAMILY_TASKS_DATABASE_ID || '') // Use family database for shared tasks
};

console.log('🔍 Formatted database IDs:', DATABASE_IDS);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'notion-mcp' });
});

// Tool: list_tasks
app.post('/tools/list_tasks', async (req, res) => {
    try {
        const { list_name, list } = req.body;

        const listKey = (list_name || list)?.toLowerCase() || 'justin';
        const pageId = DATABASE_IDS[listKey as keyof typeof DATABASE_IDS];

        if (!pageId) {
            return res.status(400).json({ error: `Unknown list: ${list_name}. Use 'justin', 'family', or 'shared'` });
        }

        console.log(`🔍 Querying page: ${listKey} (${pageId})`);

        // First, try to get the page content
        const pageResponse = await notion.pages.retrieve({ page_id: pageId });
        console.log('📄 Page retrieved:', pageResponse);

        // Then get the page's children (blocks/content)
        const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
        console.log('📋 Page blocks:', blocksResponse.results.length);

        // Extract tasks from the page content
        const tasks: any[] = [];
        
        for (const block of blocksResponse.results) {
            if (block.type === 'to_do') {
                tasks.push({
                    id: block.id,
                    title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                    status: block.to_do?.checked ? 'Done' : 'Not started',
                    priority: 'Medium',
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`,
                    list: listKey,
                    completed: block.to_do?.checked || false
                });
            } else if (block.type === 'bulleted_list_item') {
                // Convert bulleted list items to tasks
                tasks.push({
                    id: block.id,
                    title: block.bulleted_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                    status: 'Not started',
                    priority: 'Medium',
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`,
                    list: listKey,
                    completed: false
                });
            } else if (block.type === 'numbered_list_item') {
                // Convert numbered list items to tasks
                tasks.push({
                    id: block.id,
                    title: block.numbered_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                    status: 'Not started',
                    priority: 'Medium',
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`,
                    list: listKey,
                    completed: false
                });
            }
        }

        console.log(`✅ Found ${tasks.length} tasks in ${listKey} page`);
        res.json({
            success: true,
            tasks: tasks,
            list_name: listKey
        });
    } catch (error: any) {
        console.error('Error listing tasks:', error);

        if (error.code === 'object_not_found') {
            return res.status(404).json({
                error: `Page not found. Please ensure the page is shared with your Notion integration.`,
                details: error.message
            });
        }

        res.status(500).json({
            error: error.message || 'Failed to list tasks from Notion'
        });
    }
});

// Tool: create_task
app.post('/tools/create_task', async (req, res) => {
    try {
        const { list_name, title, description, priority, due_date } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const listKey = list_name?.toLowerCase() || 'justin';
        const pageId = DATABASE_IDS[listKey as keyof typeof DATABASE_IDS];

        if (!pageId) {
            return res.status(400).json({ error: `Unknown list: ${list_name}` });
        }

        // Create a new to-do block in the page
        const response = await notion.blocks.children.append({
            block_id: pageId,
            children: [
                {
                    type: 'to_do',
                    to_do: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: title
                                }
                            }
                        ],
                        checked: false
                    }
                }
            ]
        });

        res.json({
            success: true,
            data: {
                id: response.results[0]?.id,
                url: `https://notion.so/${pageId}#${response.results[0]?.id}`
            },
            message: `Task "${title}" created in ${list_name} list`
        });
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({
            error: error.message || 'Failed to create task in Notion'
        });
    }
});

// Tool: get_priorities
app.post('/tools/get_priorities', async (req, res) => {
    try {
        const allPriorities: any[] = [];

        // Query all three pages for high priority tasks
        for (const [listName, pageId] of Object.entries(DATABASE_IDS)) {
            if (!pageId) continue;

            try {
                // Get the page's children (blocks/content)
                const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
                
                // Extract tasks from the page content
                for (const block of blocksResponse.results) {
                    if (block.type === 'to_do') {
                        allPriorities.push({
                            id: block.id,
                            title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                            list: listName,
                            dueDate: null,
                            url: `https://notion.so/${pageId}#${block.id}`,
                            completed: block.to_do?.checked || false
                        });
                    }
                }
            } catch (error) {
                console.error(`Error querying ${listName} page:`, error);
            }
        }

        res.json({
            success: true,
            data: allPriorities,
            count: allPriorities.length
        });
    } catch (error: any) {
        console.error('Error getting priorities:', error);
        res.status(500).json({
            error: error.message || 'Failed to get priorities'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📝 Notion MCP server running on http://localhost:${PORT}`);
});

