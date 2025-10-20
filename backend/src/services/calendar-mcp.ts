export interface CalendarEvent {
    id: string;
    title: string;
    start: string; // ISO
    end: string;   // ISO
    location?: string;
    url?: string;
}

export interface CalendarMCPClient {
    listToday(params: { userId: string }): Promise<CalendarEvent[]>;
    listUpcoming(params: { userId: string; days?: number }): Promise<CalendarEvent[]>;
}

export class OfficialCalendarMCP implements CalendarMCPClient {
    private baseUrl: string;
    private token?: string;

    constructor(opts?: { baseUrl?: string; token?: string }) {
        this.baseUrl = opts?.baseUrl || process.env.MCP_CALENDAR_URL || '';
        this.token = opts?.token || process.env.MCP_CALENDAR_TOKEN;
    }

    async listToday(_: { userId: string }): Promise<CalendarEvent[]> {
        // TODO: Implement via official MCP if available
        return [];
    }

    async listUpcoming(_: { userId: string; days?: number }): Promise<CalendarEvent[]> {
        // TODO: Implement via official MCP if available
        return [];
    }
}


