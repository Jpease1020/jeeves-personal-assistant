/**
 * Official Notion MCP Server Integration
 * Handles communication with the official Notion MCP server running locally
 */

interface MCPRequest {
    jsonrpc: string;
    id: string | number;
    method: string;
    params?: any;
}

interface MCPResponse {
    jsonrpc: string;
    id: string | number;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

interface NotionPage {
    id: string;
    title: string;
    url: string;
    properties?: any;
}

interface NotionTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    url: string;
    list: string;
    completed: boolean;
}

export class OfficialNotionMCPService {
    private baseUrl: string;
    private authToken: string;
    private sessionId: string | null = null;

    constructor() {
this.baseUrl = process.env.MCP_NOTION_URL || 'http://localhost:4012/mcp';
        this.authToken = 'notion-mcp-token-123';
    }

    private async makeMCPRequest(request: MCPRequest): Promise<MCPResponse> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'Authorization': `Bearer ${this.authToken}`
        };

        // Add session ID if we have one
        if (this.sessionId) {
            headers['mcp-session-id'] = this.sessionId;
        }

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle Server-Sent Events response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream')) {
            const text = await response.text();
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data.trim() === '') continue;

                    try {
                        const result = JSON.parse(data) as MCPResponse;

                        // Extract session ID from response if present
                        if (result.result?.sessionId) {
                            this.sessionId = result.result.sessionId;
                        }

                        return result;
                    } catch (error) {
                        console.warn('Failed to parse SSE data:', data);
                    }
                }
            }

            throw new Error('No valid JSON-RPC response found in SSE stream');
        } else {
            // Handle regular JSON response
            const result = await response.json() as MCPResponse;

            // Extract session ID from response if present
            if (result.result?.sessionId) {
                this.sessionId = result.result.sessionId;
            }

            return result;
        }
    }

    async initialize(): Promise<void> {
        try {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        roots: { listChanged: true },
                        sampling: {}
                    },
                    clientInfo: {
                        name: 'personal-assistant',
                        version: '1.0.0'
                    }
                }
            };

            const response = await this.makeMCPRequest(request);

            if (response.error) {
                throw new Error(`MCP Initialize Error: ${response.error.message}`);
            }

            console.log('✅ Official Notion MCP Server initialized');
        } catch (error) {
            console.error('❌ Failed to initialize official Notion MCP server:', error);
            throw error;
        }
    }

    async listTools(): Promise<string[]> {
        try {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list'
            };

            const response = await this.makeMCPRequest(request);

            if (response.error) {
                throw new Error(`MCP Tools List Error: ${response.error.message}`);
            }

            return response.result?.tools?.map((tool: any) => tool.name) || [];
        } catch (error) {
            console.error('❌ Failed to list MCP tools:', error);
            return [];
        }
    }

    async searchPages(query: string, limit: number = 10): Promise<NotionPage[]> {
        try {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 3,
                method: 'tools/call',
                params: {
                    name: 'search_pages',
                    arguments: {
                        query,
                        limit
                    }
                }
            };

            const response = await this.makeMCPRequest(request);

            if (response.error) {
                throw new Error(`MCP Search Pages Error: ${response.error.message}`);
            }

            return response.result?.content || [];
        } catch (error) {
            console.error('❌ Failed to search pages:', error);
            return [];
        }
    }

    async getPageContent(pageId: string): Promise<any> {
        try {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 4,
                method: 'tools/call',
                params: {
                    name: 'get_page_content',
                    arguments: {
                        page_id: pageId
                    }
                }
            };

            const response = await this.makeMCPRequest(request);

            if (response.error) {
                throw new Error(`MCP Get Page Content Error: ${response.error.message}`);
            }

            return response.result?.content;
        } catch (error) {
            console.error('❌ Failed to get page content:', error);
            return null;
        }
    }

    async getTasksFromList(listName: string = 'justin'): Promise<{ priorities: NotionTask[], overdue: NotionTask[] }> {
        try {
            // Initialize if not already done
            if (!this.sessionId) {
                await this.initialize();
            }

            // Search for TO-DO pages
            const pages = await this.searchPages('TO-DO');

            if (pages.length === 0) {
                console.log('No TO-DO pages found via official MCP');
                return { priorities: [], overdue: [] };
            }

            // Get content from the first TO-DO page
            const page = pages[0];
            const content = await this.getPageContent(page.id);

            if (!content) {
                console.log('No content found for TO-DO page');
                return { priorities: [], overdue: [] };
            }

            // Parse tasks from the content
            const tasks: NotionTask[] = [];

            // The content structure depends on how Notion MCP formats it
            // This is a simplified parser - we may need to adjust based on actual content structure
            if (content.blocks) {
                for (const block of content.blocks) {
                    if (block.type === 'to_do' || block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
                        tasks.push({
                            id: block.id || Math.random().toString(36).substr(2, 9),
                            title: block.text || block.content || 'Untitled Task',
                            status: block.checked ? 'Done' : 'Not started',
                            priority: 'Medium',
                            dueDate: block.due_date || null,
                            url: `https://notion.so/${page.id}#${block.id}`,
                            list: listName,
                            completed: block.checked || false
                        });
                    }
                }
            }

            return {
                priorities: tasks.slice(0, 5),
                overdue: []
            };

        } catch (error) {
            console.error('❌ Failed to get tasks from official MCP:', error);
            return { priorities: [], overdue: [] };
        }
    }
}

// Export singleton instance
export const officialNotionMCP = new OfficialNotionMCPService();