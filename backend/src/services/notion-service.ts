/**
 * Notion API Service
 * Direct integration with Notion using the existing "Personal Assistant" integration
 */

import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';

dotenv.config();

export interface NotionTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    url: string;
    list: string;
    completed: boolean;
}

export class NotionService {
    private notion: Client;

    constructor() {
        const apiKey = process.env.NOTION_API_KEY;
        if (!apiKey) {
            throw new Error('NOTION_API_KEY is required');
        }
        this.notion = new Client({ auth: apiKey });
    }

    async getTasksFromList(listName: string = 'justin'): Promise<{ priorities: NotionTask[], overdue: NotionTask[] }> {
        try {
            console.log(`📋 Fetching tasks from Notion for list: ${listName}`);

            // First, try to query the specific database ID from your link
            const databaseId = '276a2b80227d80cd860aea414a2885e4';

            try {
                // Try to query as a database first
                const dbResponse = await this.notion.databases.query({
                    database_id: databaseId,
                    page_size: 50
                });

                if (dbResponse.results.length > 0) {
                    console.log(`✅ Found ${dbResponse.results.length} tasks in database`);
                    return this.parseDatabaseTasks(dbResponse.results, listName);
                }
            } catch (dbError) {
                console.log('📄 Database query failed, trying as page content...');
            }

            // If database query fails, try to read as page content
            try {
                const pageResponse = await this.notion.blocks.children.list({
                    block_id: databaseId,
                    page_size: 100
                });

                if (pageResponse.results.length > 0) {
                    console.log(`✅ Found ${pageResponse.results.length} blocks in page`);
                    return this.parsePageContent(pageResponse.results, listName);
                }
            } catch (pageError) {
                console.log('📄 Page content query also failed, falling back to search...');
            }

            // Fallback: search for pages with "TO-DO" in the title
            const searchResponse = await this.notion.search({
                query: 'TO-DO',
                filter: {
                    property: 'object',
                    value: 'page'
                }
            });

            if (searchResponse.results.length === 0) {
                console.log('No TO-DO pages found');
                return { priorities: [], overdue: [] };
            }

            console.log(`✅ Found ${searchResponse.results.length} pages via search`);
            return this.parseSearchResults(searchResponse.results, listName);

        } catch (error) {
            console.error('❌ Failed to fetch tasks from Notion:', error);
            return { priorities: [], overdue: [] };
        }
    }

    private parseDatabaseTasks(pages: any[], listName: string): { priorities: NotionTask[], overdue: NotionTask[] } {
        const tasks: NotionTask[] = [];

        for (const page of pages) {
            if (page.object === 'page') {
                const properties = page.properties;

                let title = 'Untitled Task';
                let status = 'Not started';
                let priority = 'Medium';
                let dueDate: string | undefined = undefined;
                let completed = false;

                // Parse properties according to Notion API structure
                for (const [key, prop] of Object.entries(properties)) {
                    if ((prop as any).type === 'title' && (prop as any).title.length > 0) {
                        title = (prop as any).title[0].plain_text;
                    } else if ((prop as any).type === 'rich_text' && (prop as any).rich_text.length > 0) {
                        title = (prop as any).rich_text[0].plain_text;
                    } else if ((prop as any).type === 'select' && (prop as any).select) {
                        if (key.toLowerCase().includes('status')) {
                            status = (prop as any).select.name;
                            completed = status.toLowerCase().includes('done') || status.toLowerCase().includes('complete');
                        } else if (key.toLowerCase().includes('priority')) {
                            priority = (prop as any).select.name;
                        }
                    } else if ((prop as any).type === 'date' && (prop as any).date) {
                        dueDate = (prop as any).date.start;
                    } else if ((prop as any).type === 'checkbox') {
                        completed = (prop as any).checkbox;
                        status = completed ? 'Done' : 'Not started';
                    }
                }

                tasks.push({
                    id: page.id,
                    title,
                    status,
                    priority,
                    dueDate,
                    url: `https://notion.so/${page.id}`,
                    list: listName,
                    completed
                });
            }
        }

        return this.sortAndFilterTasks(tasks);
    }

    private parsePageContent(blocks: any[], listName: string): { priorities: NotionTask[], overdue: NotionTask[] } {
        const tasks: NotionTask[] = [];

        for (const block of blocks) {
            if ('type' in block) {
                if (block.type === 'to_do') {
                    tasks.push({
                        id: block.id,
                        title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                        status: block.to_do?.checked ? 'Done' : 'Not started',
                        priority: 'Medium',
                        dueDate: undefined,
                        url: `https://notion.so/${block.id}`,
                        list: listName,
                        completed: block.to_do?.checked || false
                    });
                } else if (block.type === 'bulleted_list_item') {
                    tasks.push({
                        id: block.id,
                        title: block.bulleted_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                        status: 'Not started',
                        priority: 'Medium',
                        dueDate: undefined,
                        url: `https://notion.so/${block.id}`,
                        list: listName,
                        completed: false
                    });
                } else if (block.type === 'numbered_list_item') {
                    tasks.push({
                        id: block.id,
                        title: block.numbered_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                        status: 'Not started',
                        priority: 'Medium',
                        dueDate: undefined,
                        url: `https://notion.so/${block.id}`,
                        list: listName,
                        completed: false
                    });
                }
            }
        }

        return this.sortAndFilterTasks(tasks);
    }

    private parseSearchResults(pages: any[], listName: string): { priorities: NotionTask[], overdue: NotionTask[] } {
        const tasks: NotionTask[] = [];

        for (const page of pages) {
            if (page.object === 'page') {
                // Get the page content
                this.notion.blocks.children.list({
                    block_id: page.id
                }).then(blocksResponse => {
                    for (const block of blocksResponse.results) {
                        if ('type' in block && block.type === 'to_do') {
                            tasks.push({
                                id: block.id,
                                title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                                status: block.to_do?.checked ? 'Done' : 'Not started',
                                priority: 'Medium',
                                dueDate: undefined,
                                url: `https://notion.so/${page.id}#${block.id}`,
                                list: listName,
                                completed: block.to_do?.checked || false
                            });
                        }
                    }
                }).catch(error => {
                    console.error('Error fetching page blocks:', error);
                });
            }
        }

        return this.sortAndFilterTasks(tasks);
    }

    private sortAndFilterTasks(tasks: NotionTask[]): { priorities: NotionTask[], overdue: NotionTask[] } {
        // Sort by priority and return top tasks
        const sortedTasks = tasks.sort((a, b) => {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 2);
        });

        return {
            priorities: sortedTasks.slice(0, 10), // Return top 10 as priorities
            overdue: tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date())
        };
    }

    /**
     * Get content from a specific page, including sub-pages
     */
    async getPageContent(pageId: string, includeSubPages: boolean = true): Promise<{
        title: string;
        content: string;
        subPages: Array<{ title: string; id: string; url: string }>;
        tasks: NotionTask[];
    }> {
        try {
            console.log(`📄 Fetching content from page: ${pageId}`);

            // Get the page content
            const pageResponse = await this.notion.blocks.children.list({
                block_id: pageId,
                page_size: 100
            });

            let title = 'Untitled Page';
            let content = '';
            const subPages: Array<{ title: string; id: string; url: string }> = [];
            const tasks: NotionTask[] = [];

            // Parse the page content
            for (const block of pageResponse.results) {
                if ('type' in block) {
                    // Extract title from the first heading
                    if (block.type === 'heading_1' && title === 'Untitled Page') {
                        title = block.heading_1?.rich_text?.[0]?.plain_text || 'Untitled Page';
                    } else if (block.type === 'heading_2' && title === 'Untitled Page') {
                        title = block.heading_2?.rich_text?.[0]?.plain_text || 'Untitled Page';
                    }

                    // Extract content
                    if (block.type === 'paragraph' && block.paragraph?.rich_text) {
                        const text = block.paragraph.rich_text.map(rt => rt.plain_text).join('');
                        if (text.trim()) {
                            content += text + '\n';
                        }
                    } else if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
                        const headingText = (block as any)[block.type]?.rich_text?.[0]?.plain_text || '';
                        if (headingText) {
                            content += `\n## ${headingText}\n`;
                        }
                    }

                    // Extract tasks
                    if (block.type === 'to_do') {
                        tasks.push({
                            id: block.id,
                            title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                            status: block.to_do?.checked ? 'Done' : 'Not started',
                            priority: 'Medium',
                            dueDate: undefined,
                            url: `https://notion.so/${pageId}#${block.id}`,
                            list: 'page-content',
                            completed: block.to_do?.checked || false
                        });
                    }

                    // Extract sub-pages
                    if (includeSubPages && block.type === 'child_page') {
                        subPages.push({
                            title: block.child_page?.title || 'Untitled',
                            id: block.id,
                            url: `https://notion.so/${block.id}`
                        });
                    }
                }
            }

            // If we found sub-pages, fetch their content too
            if (includeSubPages && subPages.length > 0) {
                console.log(`📄 Found ${subPages.length} sub-pages, fetching their content...`);

                for (const subPage of subPages) {
                    try {
                        const subPageContent = await this.getPageContent(subPage.id, false); // Don't recurse further
                        content += `\n\n### ${subPageContent.title}\n${subPageContent.content}`;

                        // Add tasks from sub-pages
                        tasks.push(...subPageContent.tasks.map(task => ({
                            ...task,
                            list: `${title} > ${subPageContent.title}`
                        })));
                    } catch (error) {
                        console.error(`Error fetching sub-page ${subPage.id}:`, error);
                    }
                }
            }

            console.log(`✅ Retrieved page content: "${title}" with ${tasks.length} tasks and ${subPages.length} sub-pages`);

            return {
                title,
                content: content.trim(),
                subPages,
                tasks
            };

        } catch (error) {
            console.error('❌ Failed to fetch page content:', error);
            return {
                title: 'Error',
                content: 'Failed to fetch page content',
                subPages: [],
                tasks: []
            };
        }
    }

    /**
     * Search for pages by keywords using Notion's search API
     */
    async searchPages(keywords: string[]): Promise<Array<{
        id: string;
        title: string;
        url: string;
        lastEditedTime: string;
        content?: string;
    }>> {
        try {
            console.log(`🔍 Searching Notion for pages with keywords: ${keywords.join(', ')}`);

            const results: Array<{
                id: string;
                title: string;
                url: string;
                lastEditedTime: string;
                content?: string;
            }> = [];

            // Search for each keyword
            for (const keyword of keywords) {
                try {
                    const searchResponse = await this.notion.search({
                        query: keyword,
                        filter: {
                            property: 'object',
                            value: 'page'
                        },
                        page_size: 10
                    });

                    for (const page of searchResponse.results) {
                        if (page.object === 'page') {
                            // Extract title from page properties
                            let title = 'Untitled';
                            if ('properties' in page && page.properties) {
                                const properties = page.properties;
                                for (const [key, prop] of Object.entries(properties)) {
                                    if ((prop as any).type === 'title' && (prop as any).title?.length > 0) {
                                        title = (prop as any).title[0].plain_text;
                                        break;
                                    }
                                }
                            }

                            // Check if we already have this page
                            const existingPage = results.find(p => p.id === page.id);
                            if (!existingPage) {
                                results.push({
                                    id: page.id,
                                    title,
                                    url: `https://notion.so/${page.id}`,
                                    lastEditedTime: 'last_edited_time' in page ? page.last_edited_time : new Date().toISOString()
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error searching for keyword "${keyword}":`, error);
                }
            }

            // Sort by last edited time (most recent first)
            results.sort((a, b) => new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime());

            console.log(`✅ Found ${results.length} pages matching keywords`);
            return results;

        } catch (error) {
            console.error('❌ Failed to search Notion pages:', error);
            return [];
        }
    }

    /**
     * Find morning routine page by searching for relevant keywords
     */
    async findMorningRoutinePage(): Promise<{
        id: string;
        title: string;
        content: string;
        tasks: NotionTask[];
    } | null> {
        try {
            const keywords = ['morning routine', 'morning', 'routine', 'daily routine', 'wake up'];
            const pages = await this.searchPages(keywords);

            if (pages.length === 0) {
                console.log('No morning routine pages found');
                return null;
            }

            // Try to find the most relevant page
            for (const page of pages) {
                const pageContent = await this.getPageContent(page.id, true);

                // Check if this looks like a morning routine page
                const contentLower = pageContent.content.toLowerCase();
                const titleLower = pageContent.title.toLowerCase();

                if (titleLower.includes('morning') || titleLower.includes('routine') ||
                    contentLower.includes('wake') || contentLower.includes('breakfast') ||
                    contentLower.includes('workout') || contentLower.includes('meditation')) {

                    console.log(`✅ Found morning routine page: "${pageContent.title}"`);
                    return {
                        id: page.id,
                        title: pageContent.title,
                        content: pageContent.content,
                        tasks: pageContent.tasks
                    };
                }
            }

            // If no specific match, return the first page
            const firstPage = await this.getPageContent(pages[0].id, true);
            console.log(`📄 Using first search result as morning routine: "${firstPage.title}"`);

            return {
                id: pages[0].id,
                title: firstPage.title,
                content: firstPage.content,
                tasks: firstPage.tasks
            };

        } catch (error) {
            console.error('❌ Failed to find morning routine page:', error);
            return null;
        }
    }

    /**
     * Find Spanish study pages by searching for relevant keywords
     */
    async findSpanishStudyPages(): Promise<Array<{
        id: string;
        title: string;
        content: string;
        tasks: NotionTask[];
    }>> {
        try {
            const keywords = ['spanish', 'español', 'language', 'study', 'vocabulary', 'grammar'];
            const pages = await this.searchPages(keywords);

            const spanishPages: Array<{
                id: string;
                title: string;
                content: string;
                tasks: NotionTask[];
            }> = [];

            for (const page of pages) {
                const pageContent = await this.getPageContent(page.id, true);

                // Check if this looks like Spanish study content
                const contentLower = pageContent.content.toLowerCase();
                const titleLower = pageContent.title.toLowerCase();

                if (titleLower.includes('spanish') || titleLower.includes('español') ||
                    contentLower.includes('spanish') || contentLower.includes('español') ||
                    contentLower.includes('vocabulary') || contentLower.includes('grammar') ||
                    contentLower.includes('conjugation') || contentLower.includes('verbos')) {

                    spanishPages.push({
                        id: page.id,
                        title: pageContent.title,
                        content: pageContent.content,
                        tasks: pageContent.tasks
                    });
                }
            }

            console.log(`✅ Found ${spanishPages.length} Spanish study pages`);
            return spanishPages;

        } catch (error) {
            console.error('❌ Failed to find Spanish study pages:', error);
            return [];
        }
    }

    /**
     * Get Spanish study plan content specifically
     */
    async getSpanishStudyPlan(): Promise<{
        title: string;
        content: string;
        subPages: Array<{ title: string; id: string; url: string }>;
        tasks: NotionTask[];
    }> {
        const spanishPageId = 'fb482487604c4558b8dbb2478f3a36c4';
        return this.getPageContent(spanishPageId, true);
    }
}

// Export singleton instance
export const notionService = new NotionService();
