/**
 * Dashboard service - aggregates data from multiple sources
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
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
    try {
        // Fetch real data from MCP servers
        const [habitsData, tasksData, ouraData, screenTimeData] = await Promise.all([
            fetchHabitsData(userId),
            fetchTasksData(userId),
            fetchOuraData(userId),
            fetchScreenTimeData(userId)
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
            screenTime: screenTimeData
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
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/habits/status`, {
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

async function fetchTasksData(userId: string) {
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
            console.log('No TO-DO pages found');
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
            if ('type' in block && block.type === 'to_do') {
                tasks.push({
                    id: block.id,
                    title: block.to_do?.rich_text?.[0]?.plain_text || 'Untitled',
                    status: block.to_do?.checked ? 'Done' : 'Not started',
                    priority: 'Medium',
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`,
                    list: 'justin',
                    completed: block.to_do?.checked || false
                });
            } else if ('type' in block && block.type === 'bulleted_list_item') {
                tasks.push({
                    id: block.id,
                    title: block.bulleted_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
                    status: 'Not started',
                    priority: 'Medium',
                    dueDate: null,
                    url: `https://notion.so/${pageId}#${block.id}`,
                    list: 'justin',
                    completed: false
                });
            } else if ('type' in block && block.type === 'numbered_list_item') {
                tasks.push({
                    id: block.id,
                    title: block.numbered_list_item?.rich_text?.[0]?.plain_text || 'Untitled',
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
        console.error('Error fetching tasks data:', error);
        return { priorities: [], overdue: [] };
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
                fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: today })
                }),
                fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/recovery', {
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
                    fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterday })
                    }),
                    fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date: yesterday })
                    }),
                    fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity', {
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
                        fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/sleep', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: '2025-01-15' })
                        }),
                        fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/readiness', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: '2025-01-15' })
                        }),
                        fetch(${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/oura/activity', {
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
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4001'}/api/mcp/screen-time/${userId}/${today}`);
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

