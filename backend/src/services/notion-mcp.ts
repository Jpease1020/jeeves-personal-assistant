/**
 * Notion MCP Service - communicates with official Notion MCP server
 */

interface MCPRequest {
    jsonrpc: string;
    method: string;
    params: any;
    id: string;
}

interface MCPResponse {
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
    };
    id: string;
}

class NotionMCPService {
    private baseUrl = process.env.MCP_NOTION_URL || 'http://localhost:4012/mcp';
    private authToken = 'notion-mcp-token-123';
    private sessionId = 'personal-assistant-session';

    private async makeMCPRequest(method: string, params: any = {}): Promise<any> {
        const request: MCPRequest = {
            jsonrpc: '2.0',
            method,
            params,
            id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'mcp-session-id': this.sessionId
                },
                body: JSON.stringify(request)
            });

            const result: MCPResponse = await response.json();

            if (result.error) {
                throw new Error(`MCP Error: ${result.error.message}`);
            }

            return result.result;
        } catch (error) {
            console.error('MCP Request failed:', error);
            throw error;
        }
    }

    async initialize(): Promise<void> {
        try {
            await this.makeMCPRequest('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {}
                },
                clientInfo: {
                    name: 'personal-assistant',
                    version: '1.0.0'
                }
            });
            console.log('✅ Notion MCP server initialized');
        } catch (error) {
            console.error('Failed to initialize Notion MCP server:', error);
            throw error;
        }
    }

    async listTools(): Promise<any[]> {
        try {
            const result = await this.makeMCPRequest('tools/list');
            return result.tools || [];
        } catch (error) {
            console.error('Failed to list tools:', error);
            return [];
        }
    }

    async searchPages(query: string): Promise<any[]> {
        try {
            const result = await this.makeMCPRequest('tools/call', {
                name: 'search',
                arguments: {
                    query,
                    filter: {
                        property: 'object',
                        value: 'page'
                    }
                }
            });
            return result.content || [];
        } catch (error) {
            console.error('Failed to search pages:', error);
            return [];
        }
    }

    async getPageContent(pageId: string): Promise<any> {
        try {
            const result = await this.makeMCPRequest('tools/call', {
                name: 'read',
                arguments: {
                    resource: pageId
                }
            });
            return result;
        } catch (error) {
            console.error('Failed to get page content:', error);
            return null;
        }
    }

    async getPageBlocks(pageId: string): Promise<any[]> {
        try {
            const result = await this.makeMCPRequest('tools/call', {
                name: 'read',
                arguments: {
                    resource: pageId,
                    limit: 100
                }
            });
            return result.content || [];
        } catch (error) {
            console.error('Failed to get page blocks:', error);
            return [];
        }
    }

    async extractTasksFromPage(pageId: string): Promise<any[]> {
        try {
            const blocks = await this.getPageBlocks(pageId);
            const tasks: any[] = [];

            // Extract tasks from various block types
            for (const block of blocks) {
                if (block.type === 'to_do') {
                    tasks.push({
                        id: block.id,
                        title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                        completed: block.to_do?.checked || false,
                        type: 'to_do',
                        url: `https://notion.so/${block.id.replace(/-/g, '')}`
                    });
                } else if (block.type === 'bulleted_list_item') {
                    const text = block.bulleted_list_item?.rich_text?.[0]?.plain_text || '';
                    if (text.includes('☐') || text.includes('☑') || text.includes('✓')) {
                        tasks.push({
                            id: block.id,
                            title: text.replace(/[☐☑✓]/g, '').trim(),
                            completed: text.includes('☑') || text.includes('✓'),
                            type: 'bulleted_list_item',
                            url: `https://notion.so/${block.id.replace(/-/g, '')}`
                        });
                    }
                } else if (block.type === 'numbered_list_item') {
                    const text = block.numbered_list_item?.rich_text?.[0]?.plain_text || '';
                    if (text.includes('☐') || text.includes('☑') || text.includes('✓')) {
                        tasks.push({
                            id: block.id,
                            title: text.replace(/[☐☑✓]/g, '').trim(),
                            completed: text.includes('☑') || text.includes('✓'),
                            type: 'numbered_list_item',
                            url: `https://notion.so/${block.id.replace(/-/g, '')}`
                        });
                    }
                }
            }

            return tasks;
        } catch (error) {
            console.error('Failed to extract tasks from page:', error);
            return [];
        }
    }

    async getTasksFromList(listName: string): Promise<any[]> {
        try {
            // First, search for pages that might contain our TO-DO lists
            const searchQuery = listName === 'justin' ? 'TO-DO List' : 'Family To-DO List';
            const pages = await this.searchPages(searchQuery);
            
            if (pages.length === 0) {
                console.log(`No pages found for search query: ${searchQuery}`);
                return [];
            }

            // Get the first matching page
            const page = pages[0];
            console.log(`Found page: ${page.title} (${page.id})`);

            // Extract tasks from the page
            const tasks = await this.extractTasksFromPage(page.id);
            
            return tasks.map(task => ({
                ...task,
                list: listName
            }));
        } catch (error) {
            console.error(`Failed to get tasks from ${listName} list:`, error);
            return [];
        }
    }
}

export const notionMCP = new NotionMCPService();
