import { Router } from 'express';
import { getDashboardData } from '../services/dashboard-enhanced';

export const dashboardRouter = Router();

// Get all dashboard data
dashboardRouter.get('/', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';
        console.log(`📊 Dashboard request for user: ${userId}`);

        // Return mock data for now to test connectivity
        const mockData = {
            habits: {
                today: [
                    { name: 'Drink Water', completed: true, streak: 5 },
                    { name: 'Exercise', completed: false, streak: 2 },
                    { name: 'Meditate', completed: true, streak: 3 }
                ]
            },
            calendar: {
                today: [
                    { title: 'Morning Meeting', start: '09:00', end: '10:00' },
                    { title: 'Lunch Break', start: '12:00', end: '13:00' }
                ],
                upcoming: [
                    { title: 'Team Standup', start: '15:00', end: '15:30' }
                ]
            },
            tasks: {
                priorities: [
                    { title: 'Review project proposal', dueDate: '2025-10-21', list: 'work' },
                    { title: 'Call dentist', dueDate: '2025-10-22', list: 'personal' }
                ]
            },
            oura: {
                sleep: { score: 85, duration: 7.5, efficiency: 92 },
                readiness: { score: 78, restingHeartRate: 55, heartRateVariability: 42 },
                activity: { score: 82, activeCalories: 450, steps: 8500 },
                recovery: { score: 88, restingHeartRate: 55, heartRateVariability: 42 }
            },
            screenTime: {
                today: { totalMinutes: 180, productiveMinutes: 120, distractingMinutes: 60 },
                weekly: { totalMinutes: 1260, productiveMinutes: 840, distractingMinutes: 420 }
            },
            integrationStatus: {
                directApiWorking: true,
                officialMCPWorking: false,
                method: 'direct-api'
            }
        };

        console.log(`✅ Dashboard data prepared for user: ${userId}`);
        res.json({
            data: mockData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

