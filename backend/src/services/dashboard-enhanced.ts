/**
 * Enhanced Dashboard service - aggregates data from multiple sources via service clients
 */

import { notionService } from './notion-service';
import { OuraService, type OuraServiceClient, type OuraDailySummary } from './oura-service';
import { ScreenTimeService, type ScreenTimeServiceClient, type ScreenTimeSummary } from './screen-time-service';

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
        sleep: OuraDailySummary | null;
        readiness: OuraDailySummary | null;
        activity: OuraDailySummary | null;
        recovery: OuraDailySummary | null;
    };
    screenTime: ScreenTimeSummary | null;
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
        console.log(`📅 Fetching calendar data for user: ${userId}`);

        // Calendar integration not yet implemented
        // Return empty arrays when no calendar API is connected
        console.log('⚠️ Calendar API not connected - returning empty data');
        return {
            today: [],
            upcoming: []
        };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return { today: [], upcoming: [] };
    }
}

async function fetchTasksData(userId: string) {
    try {
        console.log(`📋 Fetching tasks for user: ${userId} using Notion service`);

        // Get tasks from Notion using the service
        const tasks = await notionService.getTasksFromList('justin');

        console.log(`✅ Found ${tasks.priorities.length} priorities`);

        return {
            priorities: tasks.priorities.map(t => ({ title: t.title, dueDate: t.dueDate ?? undefined, list: t.list || 'notion' }))
        };
    } catch (error) {
        console.error('Error fetching tasks data from Notion:', error);
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
            sleep: null as OuraDailySummary | null,
            readiness: null as OuraDailySummary | null,
            activity: null as OuraDailySummary | null,
            recovery: null as OuraDailySummary | null
        };
    } catch (error) {
        console.error('Error fetching Oura data:', error);
        return {
            sleep: null as OuraDailySummary | null,
            readiness: null as OuraDailySummary | null,
            activity: null as OuraDailySummary | null,
            recovery: null as OuraDailySummary | null
        };
    }
}

async function fetchScreenTimeData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`📱 Fetching screen time for user: ${userId}, date: ${today}`);

        // Return null for screen time data for now
        // In production, this would connect to screen time tracking
        return null as ScreenTimeSummary | null;
    } catch (error) {
        console.error('Error fetching screen time data:', error);
        return null as ScreenTimeSummary | null;
    }
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
    console.log(`📊 Getting dashboard data for user: ${userId}`);

    try {
        // Fetch all data in parallel
        const [habitsData, calendarData, tasksData, ouraData, screenTimeData] = await Promise.all([
            fetchHabitsData(userId),
            fetchCalendarData(userId),
            fetchTasksData(userId),
            fetchOuraData(userId),
            fetchScreenTimeData(userId)
        ]);

        // Determine integration status
        const directApiWorking = true;
        const officialMCPWorking = false; // Using direct APIs now
        const method = 'direct-apis';

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