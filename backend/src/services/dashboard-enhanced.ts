/**
 * Enhanced Dashboard service - aggregates data from multiple sources via service clients
 */

import { OfficialNotionMCP, type NotionMCPClient } from './notion-mcp';
import { OfficialCalendarMCP, type CalendarMCPClient } from './calendar-mcp';
import { OuraService, type OuraServiceClient } from './oura-service';
import { ScreenTimeService, type ScreenTimeServiceClient } from './screen-time-service';

export interface DashboardData {
    habits: {
        today: Array<{
            name: string;
            completed: boolean;
            streak: number;
        }>;
    };
    calendar: {
        today: Array<{
            title: string;
            start: string;
            end: string;
        }>;
        upcoming: Array<{
            title: string;
            start: string;
            end: string;
        }>;
    };
    tasks: {
        priorities: Array<{
            title: string;
            dueDate?: string;
            list: string;
        }>;
    };
    oura: {
        sleep: {
            score: number;
            duration: number;
            efficiency: number;
        } | null;
        readiness: {
            score: number;
            restingHeartRate: number;
            heartRateVariability: number;
        } | null;
        activity: {
            score: number;
            activeCalories: number;
            steps: number;
        } | null;
        recovery: {
            score: number;
            restingHeartRate: number;
            heartRateVariability: number;
        } | null;
    };
    screenTime: {
        total: number;
        productivity: number;
        apps: Record<string, number>;
        websites: Record<string, number>;
    } | null;
    integrationStatus: {
        directApiWorking: boolean;
        officialMCPWorking: boolean;
        method: string;
    };
}

async function fetchHabitsData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`🔧 Fetching habits for user: ${userId}, date: ${today}`);

        // Return empty habits array for now
        // In production, this would connect to a habits database
        return {
            today: []
        };
    } catch (error) {
        console.error('Error fetching habits data:', error);
        return { today: [] };
    }
}

async function fetchCalendarData(userId: string) {
    try {
        // Mock calendar data for now
        return {
            today: [
                {
                    title: 'Team Meeting',
                    start: '2024-01-15T10:00:00Z',
                    end: '2024-01-15T11:00:00Z'
                }
            ],
            upcoming: [
                {
                    title: 'Project Review',
                    start: '2024-01-16T14:00:00Z',
                    end: '2024-01-16T15:00:00Z'
                }
            ]
        };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return { today: [], upcoming: [] };
    }
}

async function fetchTasksData(userId: string) {
    try {
        console.log(`📋 Fetching tasks for user: ${userId}`);

        // Return empty tasks array for now
        // In production, this would connect to Notion or task database
        return {
            priorities: []
        };
    } catch (error) {
        console.error('Error fetching tasks data:', error);
        return { priorities: [] };
    }
}

async function fetchOuraData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`💍 Fetching Oura data for user: ${userId}, date: ${today}`);

        // For now, return null for all Oura data
        // In production, this would call the Oura API directly
        return {
            sleep: null,
            readiness: null,
            activity: null,
            recovery: null
        };
    } catch (error) {
        console.error('Error fetching Oura data:', error);
        return {
            sleep: null,
            readiness: null,
            activity: null,
            recovery: null
        };
    }
}

async function fetchScreenTimeData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`📱 Fetching screen time for user: ${userId}, date: ${today}`);

        // Return null for screen time data for now
        // In production, this would connect to screen time tracking
        return null;
    } catch (error) {
        console.error('Error fetching screen time data:', error);
        return null;
    }
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
    console.log(`📊 Getting dashboard data for user: ${userId}`);

    // Initialize service clients once per request (could move to a singleton if desired)
    const notionClient: NotionMCPClient = new OfficialNotionMCP();
    const calendarClient: CalendarMCPClient = new OfficialCalendarMCP();
    const ouraClient: OuraServiceClient = new OuraService();
    const screenTimeClient: ScreenTimeServiceClient = new ScreenTimeService();

    try {
        // Fetch all data in parallel
        const [habitsData, calendarData, tasksData, ouraData, screenTimeData] = await Promise.all([
            fetchHabitsData(userId),
            (async () => {
                const today = await calendarClient.listToday({ userId });
                const upcoming = await calendarClient.listUpcoming({ userId, days: 3 });
                return { today, upcoming };
            })(),
            (async () => {
                // Placeholder: priorities from Notion MCP
                const priorities = await notionClient.getPriorities({ userId });
                return { priorities: priorities.map(t => ({ title: t.title, dueDate: t.dueDate ?? undefined, list: t.list || 'notion' })) };
            })(),
            (async () => {
                const todayStr = new Date().toISOString().split('T')[0];
                const [sleep, readiness, activity, recovery] = await Promise.all([
                    ouraClient.getSleep({ userId, date: todayStr }),
                    ouraClient.getReadiness({ userId, date: todayStr }),
                    ouraClient.getActivity({ userId, date: todayStr }),
                    ouraClient.getRecovery({ userId, date: todayStr })
                ]);
                return { sleep, readiness, activity, recovery };
            })(),
            (async () => {
                const todayStr = new Date().toISOString().split('T')[0];
                const summary = await screenTimeClient.getSummary({ userId, date: todayStr });
                return summary;
            })()
        ]);

        // Determine integration status
        const directApiWorking = true;
        const officialMCPWorking = true; // target state: official MCP for Notion/Calendar
        const method = 'service-clients';

        return {
            habits: habitsData,
            calendar: calendarData,
            tasks: tasksData,
            oura: ouraData,
            screenTime: screenTimeData,
            integrationStatus: { directApiWorking, officialMCPWorking, method }
        };
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        throw error;
    }
}