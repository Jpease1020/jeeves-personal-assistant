export interface NotionTask {
    id: string;
    title: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    url?: string;
    list?: string;
    completed?: boolean;
}

export interface NotionMCPClient {
    listTasks(params: { userId: string; list: 'justin' | 'family' | 'shared' }): Promise<NotionTask[]>;
    createTask(params: { userId: string; list: 'justin' | 'family' | 'shared'; title: string }): Promise<NotionTask>;
    getPriorities(params: { userId: string }): Promise<NotionTask[]>;
}

export class OfficialNotionMCP implements NotionMCPClient {
    private baseUrl: string;
    private token?: string;

    constructor(opts?: { baseUrl?: string; token?: string }) {
        this.baseUrl = opts?.baseUrl || process.env.MCP_NOTION_URL || 'https://mcp.notion.com/mcp';
        this.token = opts?.token || process.env.MCP_NOTION_TOKEN;
    }

    async listTasks(_: { userId: string; list: 'justin' | 'family' | 'shared' }): Promise<NotionTask[]> {
        // TODO: Implement JSON-RPC over SSE for official Notion MCP
        return [];
    }

    async createTask(_: { userId: string; list: 'justin' | 'family' | 'shared'; title: string }): Promise<NotionTask> {
        // TODO: Implement create via MCP
        return { id: 'not-implemented', title: 'not-implemented' };
    }

    async getPriorities(_: { userId: string }): Promise<NotionTask[]> {
        // TODO: Implement priorities via MCP
        return [];
    }
}


