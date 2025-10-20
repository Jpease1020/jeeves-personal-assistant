/**
 * Enhanced Dashboard service - aggregates data from multiple sources with fallback mechanisms
 */

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
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/habits/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date: today })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as any;
        return {
            today: data.habits || []
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
                    end: '2024-01-16T15:30:00Z'
                }
            ]
        };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return { today: [], upcoming: [] };
    }
}

async function fetchTasksDataEnhanced(userId: string) {
    let directApiWorking = false;
    let officialMCPWorking = false;
    let method = 'none';

    // Try direct Notion API first
    try {
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/notion/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ list_name: 'justin' })
        });

        if (response.ok) {
            const data = await response.json() as any;
            directApiWorking = true;
            method = 'direct_api';
            return {
                priorities: data.tasks?.slice(0, 5) || [],
                status: { directApiWorking: true, officialMCPWorking: false, method: 'direct_api' }
            };
        }
    } catch (error) {
        console.error('Direct Notion API failed:', error);
    }

    // Fallback to official MCP server
    try {
        // This would use the official Notion MCP server
        // For now, return empty data
        officialMCPWorking = false;
        method = 'official_mcp_fallback';
        return {
            priorities: [],
            status: { directApiWorking: false, officialMCPWorking: false, method: 'fallback' }
        };
    } catch (error) {
        console.error('Official MCP server failed:', error);
    }

    return {
        priorities: [],
        status: { directApiWorking, officialMCPWorking, method }
    };
}

async function fetchOuraData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        let sleepData: any, readinessData: any, activityData: any, recoveryData: any;

        try {
            const [sleepResponse, readinessResponse, activityResponse, recoveryResponse] = await Promise.all([
                fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/recovery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            ]);

            sleepData = sleepResponse.ok ? await sleepResponse.json() : null;
            readinessData = readinessResponse.ok ? await readinessResponse.json() : null;
            activityData = activityResponse.ok ? await activityResponse.json() : null;
            recoveryData = recoveryResponse.ok ? await recoveryResponse.json() : null;
        } catch (error) {
            console.error('Error fetching Oura data:', error);
            sleepData = readinessData = activityData = recoveryData = null;
        }

        // Try to get yesterday's data if today's is not available
        if (!sleepData?.data) {
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const [yesterdaySleepResponse, yesterdayReadinessResponse, yesterdayActivityResponse] = await Promise.all([
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterdayStr })
                    }),
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterdayStr })
                    }),
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterdayStr })
                    })
                ]);

                sleepData = yesterdaySleepResponse.ok ? await yesterdaySleepResponse.json() : null;
                readinessData = yesterdayReadinessResponse.ok ? await yesterdayReadinessResponse.json() : null;
                activityData = yesterdayActivityResponse.ok ? await yesterdayActivityResponse.json() : null;
            } catch (error) {
                console.error('Error fetching yesterday\'s Oura data:', error);
            }
        }

        // Try to get sample data if no real data is available
        if (!sleepData?.data) {
            try {
                const [sampleSleepResponse, sampleReadinessResponse, sampleActivityResponse] = await Promise.all([
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: '2025-01-15' })
                    }),
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: '2025-01-15' })
                    }),
                    fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: '2025-01-15' })
                    })
                ]);

                sleepData = sampleSleepResponse.ok ? await sampleSleepResponse.json() : null;
                readinessData = sampleReadinessResponse.ok ? await sampleReadinessResponse.json() : null;
                activityData = sampleActivityResponse.ok ? await sampleActivityResponse.json() : null;
            } catch (error) {
                console.error('Error fetching sample Oura data:', error);
            }
        }

        return {
            sleep: sleepData?.data ? {
                score: sleepData.data.sleepScore || 0,
                duration: sleepData.data.totalSleepTime || 0,
                efficiency: sleepData.data.sleepEfficiency || 0
            } : null,
            readiness: readinessData?.data ? {
                score: readinessData.data.readinessScore || 0,
                restingHeartRate: readinessData.data.restingHeartRate || 0,
                heartRateVariability: readinessData.data.heartRateVariability || 0
            } : null,
            activity: activityData?.data ? {
                score: activityData.data.activityScore || 0,
                activeCalories: activityData.data.activeCalories || 0,
                steps: activityData.data.steps || 0
            } : null,
            recovery: recoveryData?.data ? {
                score: recoveryData.data.recoveryScore || 0,
                restingHeartRate: recoveryData.data.restingHeartRate || 0,
                heartRateVariability: recoveryData.data.heartRateVariability || 0
            } : null
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
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/screen-time/${userId}/${today}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as any;
        return data.data ? {
            total: data.data.totalScreenTime || 0,
            productivity: data.data.productivityScore || 0,
            apps: data.data.appBreakdown || {},
            websites: data.data.websiteBreakdown || {}
        } : null;
    } catch (error) {
        console.error('Error fetching screen time data:', error);
        return null;
    }
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
    try {
        const [habits, calendar, tasksResult, oura, screenTime] = await Promise.all([
            fetchHabitsData(userId),
            fetchCalendarData(userId),
            fetchTasksDataEnhanced(userId),
            fetchOuraData(userId),
            fetchScreenTimeData(userId)
        ]);

        return {
            habits,
            calendar,
            tasks: { priorities: tasksResult.priorities },
            oura,
            screenTime,
            integrationStatus: tasksResult.status
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}