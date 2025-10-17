/**
 * Enhanced Dashboard service - aggregates data from multiple sources
 * Supports both direct Notion API and official MCP server
 */

import { officialNotionMCP } from './notion-official-mcp';

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
            completed?: boolean;
            url?: string;
        }>;
        overdue: Array<{
            title: string;
            dueDate: string;
            list: string;
        }>;
    };
    goals: {
        greenCardDaysLeft: number;
        bodyTransformation: {
            currentWeight?: number;
            targetWeight?: number;
            daysIntoChallenge: number;
        };
        learningProgress: Array<{
            subject: string;
            masteryLevel: number;
        }>;
    };
    currentFocus?: {
        activity: string;
        startedAt: string;
        estimatedEnd?: string;
    };
    oura: {
        sleep: {
            score: number;
            hours: number;
            efficiency: number;
            quality: string;
        };
        readiness: {
            score: number;
            level: string;
            recommendation: string;
        };
        activity: {
            score: number;
            steps: number;
            calories: number;
        };
        recovery: {
            status: string;
            readyForHeavyLifting: boolean;
            needsRest: boolean;
        };
    };
    screenTime: {
        totalMinutes: number;
        focusScore: number;
        topApps: Array<{
            name: string;
            timeSpent: number;
            pickups: number;
        }>;
        distractionPatterns: Array<{
            timeRange: string;
            appName: string;
            duration: number;
            level: string;
        }>;
    };
    notionIntegration: {
        method: 'direct-api' | 'official-mcp' | 'both';
        directApiWorking: boolean;
        officialMCPWorking: boolean;
        lastSync: string;
    };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
    try {
        // Fetch real data from MCP servers
        const [habitsData, tasksData, ouraData, screenTimeData, notionStatus] = await Promise.all([
            fetchHabitsData(userId),
            fetchTasksDataEnhanced(userId),
            fetchOuraData(userId),
            fetchScreenTimeData(userId),
            checkNotionIntegrationStatus()
        ]);

        const dashboardData: DashboardData = {
            habits: habitsData,
            calendar: {
                today: [],
                upcoming: []
            },
            tasks: tasksData,
            goals: {
                greenCardDaysLeft: 0,
                bodyTransformation: {
                    daysIntoChallenge: 0
                },
                learningProgress: []
            },
            oura: ouraData,
            screenTime: screenTimeData,
            notionIntegration: notionStatus
        };

        return dashboardData;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw new Error('Failed to fetch dashboard data');
    }
}

async function fetchHabitsData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch('${process.env.MCP_HABIT_TRACKER_URL || 'http://localhost:4010'}/tools/get_habit_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date: today })
        });

        const data = await response.json() as any;

        // If we get habits data, return it, otherwise return empty array
        if (data.habits && Array.isArray(data.habits)) {
            return {
                today: data.habits.map((habit: any) => ({
                    name: habit.habit_name || habit.name,
                    completed: habit.completed || false,
                    streak: habit.streak || 0
                }))
            };
        }

        return { today: [] };
    } catch (error) {
        console.error('Error fetching habits data:', error);
        return { today: [] };
    }
}

async function fetchTasksDataEnhanced(userId: string) {
    try {
        // Try both methods and combine results
        const [directApiTasks, officialMCPTasks] = await Promise.allSettled([
            fetchTasksDataDirectAPI(userId),
            fetchTasksDataOfficialMCP(userId)
        ]);

        let combinedTasks = { priorities: [], overdue: [] };

        // Use direct API results if successful
        if (directApiTasks.status === 'fulfilled') {
            combinedTasks = directApiTasks.value;
            console.log('✅ Using Direct API tasks:', combinedTasks.priorities.length);
        }

        // If direct API failed, try official MCP
        if (directApiTasks.status === 'rejected' && officialMCPTasks.status === 'fulfilled') {
            combinedTasks = officialMCPTasks.value;
            console.log('✅ Using Official MCP tasks:', combinedTasks.priorities.length);
        }

        // If both succeeded, prefer direct API but log both
        if (directApiTasks.status === 'fulfilled' && officialMCPTasks.status === 'fulfilled') {
            console.log('✅ Both methods working - Direct API:', directApiTasks.value.priorities.length, 'Official MCP:', officialMCPTasks.value.priorities.length);
        }

        return combinedTasks;
    } catch (error) {
        console.error('Error fetching tasks data:', error);
        return { priorities: [], overdue: [] };
    }
}

async function fetchTasksDataDirectAPI(userId: string) {
    try {
        // Use the existing Internal Integration
        const { Client } = await import('@notionhq/client');

        const notion = new Client({
            auth: process.env.NOTION_API_KEY
        });

        // Search for TO-DO pages
        const searchResults = await notion.search({
            query: 'TO-DO',
            filter: {
                property: 'object',
                value: 'page'
            }
        });

        if (searchResults.results.length === 0) {
            console.log('No TO-DO pages found via Direct API');
            return { priorities: [], overdue: [] };
        }

        // Get the first TO-DO page
        const page = searchResults.results[0] as any;
        const pageId = page.id;

        // Get the page content
        const blocksResponse = await notion.blocks.children.list({
            block_id: pageId
        });

        // Extract tasks from the page content
        const tasks: any[] = [];

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
                    list: 'justin',
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
                    list: 'justin',
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
                    list: 'justin',
                    completed: false
                });
            }
        }

        return {
            priorities: tasks.slice(0, 5).map((task: any) => ({
                title: task.title || task.name,
                dueDate: task.due_date || task.dueDate,
                list: task.list || 'justin',
                completed: task.completed || false,
                url: task.url
            })),
            overdue: []
        };
    } catch (error) {
        console.error('Error fetching tasks data via Direct API:', error);
        throw error;
    }
}

async function fetchTasksDataOfficialMCP(userId: string) {
    try {
        return await officialNotionMCP.getTasksFromList('justin');
    } catch (error) {
        console.error('Error fetching tasks data via Official MCP:', error);
        throw error;
    }
}

async function checkNotionIntegrationStatus() {
    try {
        const [directApiTest, officialMCPTest] = await Promise.allSettled([
            testDirectAPI(),
            testOfficialMCP()
        ]);

        const directApiWorking = directApiTest.status === 'fulfilled';
        const officialMCPWorking = officialMCPTest.status === 'fulfilled';

        let method: 'direct-api' | 'official-mcp' | 'both';
        if (directApiWorking && officialMCPWorking) {
            method = 'both';
        } else if (directApiWorking) {
            method = 'direct-api';
        } else if (officialMCPWorking) {
            method = 'official-mcp';
        } else {
            method = 'direct-api'; // fallback
        }

        return {
            method,
            directApiWorking,
            officialMCPWorking,
            lastSync: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error checking Notion integration status:', error);
        return {
            method: 'direct-api',
            directApiWorking: false,
            officialMCPWorking: false,
            lastSync: new Date().toISOString()
        };
    }
}

async function testDirectAPI(): Promise<boolean> {
    try {
        const { Client } = await import('@notionhq/client');
        const notion = new Client({ auth: process.env.NOTION_API_KEY });
        await notion.search({ query: 'test', filter: { property: 'object', value: 'page' } });
        return true;
    } catch (error) {
        return false;
    }
}

async function testOfficialMCP(): Promise<boolean> {
    try {
        await officialNotionMCP.initialize();
        return true;
    } catch (error) {
        return false;
    }
}

async function fetchOuraData(userId: string) {
    try {
        // Try to get data from today first, then yesterday if no data
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Try today's data first
        let sleepData: any, readinessData: any, activityData: any, recoveryData: any;

        try {
            const [sleepResponse, readinessResponse, activityResponse, recoveryResponse] = await Promise.all([
                fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_sleep_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_daily_readiness', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_activity_summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_recovery_status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            ]);

            sleepData = await sleepResponse.json();
            readinessData = await readinessResponse.json();
            activityData = await activityResponse.json();
            recoveryData = await recoveryResponse.json();

            // If no data for today, try yesterday and recent dates
            if (!sleepData.data && !readinessData.data) {
                console.log('No data for today, trying recent dates...');

                // Try yesterday first
                const [yesterdaySleepResponse, yesterdayReadinessResponse, yesterdayActivityResponse] = await Promise.all([
                    fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_sleep_data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterday })
                    }),
                    fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_daily_readiness', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterday })
                    }),
                    fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_activity_summary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterday })
                    })
                ]);

                sleepData = await yesterdaySleepResponse.json();
                readinessData = await yesterdayReadinessResponse.json();
                activityData = await yesterdayActivityResponse.json();

                // If still no data, try January 15th (known data date)
                if (!sleepData.data && !readinessData.data) {
                    console.log('Trying January 15th data...');
                    const [jan15SleepResponse, jan15ReadinessResponse, jan15ActivityResponse] = await Promise.all([
                        fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_sleep_data', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: '2025-01-15' })
                        }),
                        fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_daily_readiness', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: '2025-01-15' })
                        }),
                        fetch('${process.env.MCP_OURA_RING_URL || 'http://localhost:4016'}/tools/get_activity_summary', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: '2025-01-15' })
                        })
                    ]);

                    sleepData = await jan15SleepResponse.json();
                    readinessData = await jan15ReadinessResponse.json();
                    activityData = await jan15ActivityResponse.json();
                }
            }
        } catch (error) {
            console.error('Error fetching Oura data:', error);
            throw error;
        }

        return {
            sleep: {
                score: sleepData.data?.sleep_score || 0,
                hours: sleepData.data?.total_sleep_hours || 0,
                efficiency: sleepData.data?.efficiency || 0,
                quality: sleepData.data?.quality || 'No data'
            },
            readiness: {
                score: readinessData.data?.readiness_score || 0,
                level: readinessData.data?.level || 'No data',
                recommendation: readinessData.data?.recommendation || 'No data available'
            },
            activity: {
                score: activityData.data?.activity_score || 0,
                steps: activityData.data?.steps || 0,
                calories: activityData.data?.active_calories || 0
            },
            recovery: {
                status: recoveryData.data?.status || 'unknown',
                readyForHeavyLifting: recoveryData.data?.ready_for_heavy_lifting || false,
                needsRest: recoveryData.data?.needs_rest || true
            }
        };
    } catch (error) {
        console.error('Error fetching Oura data:', error);
        return {
            sleep: { score: 0, hours: 0, efficiency: 0, quality: 'No data' },
            readiness: { score: 0, level: 'No data', recommendation: 'No data available' },
            activity: { score: 0, steps: 0, calories: 0 },
            recovery: { status: 'unknown', readyForHeavyLifting: false, needsRest: true }
        };
    }
}

async function fetchScreenTimeData(userId: string) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${process.env.MCP_SCREEN_TIME_URL || 'http://localhost:4018'}/screen-time/${userId}/${today}`);
        const data = await response.json() as any;

        return {
            totalMinutes: data.totalScreenTime || 0,
            focusScore: data.focusScore || 0,
            topApps: data.appUsage?.slice(0, 3).map((app: any) => ({
                name: app.appName,
                timeSpent: app.timeSpent,
                pickups: app.pickups
            })) || [],
            distractionPatterns: data.distractionPatterns?.map((pattern: any) => ({
                timeRange: pattern.timeRange,
                appName: pattern.appName,
                duration: pattern.duration,
                level: pattern.distractionLevel
            })) || []
        };
    } catch (error) {
        console.error('Error fetching screen time data:', error);
        return {
            totalMinutes: 0,
            focusScore: 0,
            topApps: [],
            distractionPatterns: []
        };
    }
}
