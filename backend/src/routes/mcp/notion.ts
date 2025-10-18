import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const router = express.Router();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Helper function to format Notion database IDs with hyphens
function formatNotionId(id: string): string {
    if (!id) return '';
    // Remove any existing hyphens and add them back in the correct positions
    const cleanId = id.replace(/-/g, '');
    if (cleanId.length === 32) {
        return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20)}`;
    }
    return id;
}

// Get database ID for a list
function getDatabaseId(listName: string): string {
    const list = listName?.toLowerCase() || 'justin';
    
    if (list === 'justin') {
        return formatNotionId(process.env.NOTION_TASKS_DATABASE_ID || '');
    } else if (list === 'family' || list === 'shared') {
        return formatNotionId(process.env.NOTION_FAMILY_TASKS_DATABASE_ID || '');
    }
    
    throw new Error(`Unknown list: ${listName}. Use 'justin', 'family', or 'shared'`);
}

// List tasks from Notion page
router.post('/tasks', async (req, res) => {
    try {
        const { list_name, list } = req.body;
        const listName = list_name || list || 'justin';
        
        console.log(`📋 Listing tasks for: ${listName}`);
        
        const pageId = getDatabaseId(listName);
        console.log(`🔍 Using page ID: ${pageId}`);
        
        // Retrieve the page
        const page = await notion.pages.retrieve({ page_id: pageId });
        console.log(`📄 Retrieved page: ${page.id}`);
        
        // Get blocks from the page
        const blocksResponse = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100
        });
        
        const tasks = [];
        
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
                    list: listName,
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
                    list: listName,
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
                    list: listName,
                    completed: false
                });
            }
        }
        
        console.log(`✅ Found ${tasks.length} tasks`);
        res.json({ tasks });
        
    } catch (error: any) {
        console.error('❌ Error listing tasks:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to list tasks',
            details: error.toString()
        });
    }
});

// Create a new task
router.post('/tasks/create', async (req, res) => {
    try {
        const { title, list_name, list } = req.body;
        const listName = list_name || list || 'justin';
        
        console.log(`➕ Creating task: ${title} in ${listName}`);
        
        const pageId = getDatabaseId(listName);
        
        // Add a new to-do block to the page
        const response = await notion.blocks.children.append({
            block_id: pageId,
            children: [{
                type: 'to_do',
                to_do: {
                    rich_text: [{
                        type: 'text',
                        text: { content: title }
                    }]
                }
            }]
        });
        
        console.log(`✅ Created task: ${title}`);
        res.json({ 
            success: true, 
            task: {
                id: response.results[0]?.id,
                title,
                status: 'Not started',
                list: listName,
                completed: false
            }
        });
        
    } catch (error: any) {
        console.error('❌ Error creating task:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to create task',
            details: error.toString()
        });
    }
});

// Get priorities (extract from existing tasks)
router.get('/priorities', async (req, res) => {
    try {
        const { list_name, list } = req.query;
        const listName = (list_name || list || 'justin') as string;
        
        console.log(`🎯 Getting priorities for: ${listName}`);
        
        const pageId = getDatabaseId(listName);
        
        // Get blocks from the page
        const blocksResponse = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100
        });
        
        const priorities = [];
        
        for (const block of blocksResponse.results) {
            const blockAny = block as any;
            if (blockAny.type === 'to_do' && !blockAny.to_do?.checked) {
                priorities.push({
                    id: block.id,
                    title: blockAny.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                    priority: 'High', // Default priority
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`
                });
            }
        }
        
        console.log(`✅ Found ${priorities.length} priorities`);
        res.json({ priorities });
        
    } catch (error: any) {
        console.error('❌ Error getting priorities:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to get priorities',
            details: error.toString()
        });
    }
});

export default router;
