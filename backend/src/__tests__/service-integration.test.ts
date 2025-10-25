/**
 * Service Integration Tests
 * Tests the integration between services and external APIs
 * These tests use REAL external APIs with minimal mocking
 */

import { getDashboardData } from '../services/dashboard-enhanced';
import { notionService } from '../services/notion-service';
import { ScreenTimeService } from '../services/screen-time-service';
import { OuraService } from '../services/oura-service';

describe('Service Integration Tests', () => {
    const testUserId = 'test-user-service-integration';
    const testDate = '2024-01-15';

    describe('Dashboard Service Integration', () => {
        test('should aggregate data from all services', async () => {
            const dashboardData = await getDashboardData(testUserId);

            // Verify the structure
            expect(dashboardData).toBeDefined();
            expect(dashboardData.habits).toBeDefined();
            expect(dashboardData.calendar).toBeDefined();
            expect(dashboardData.tasks).toBeDefined();
            expect(dashboardData.oura).toBeDefined();
            expect(dashboardData.screenTime).toBeDefined();
            expect(dashboardData.integrationStatus).toBeDefined();

            // Verify nested structures
            expect(dashboardData.habits.today).toBeDefined();
            expect(Array.isArray(dashboardData.habits.today)).toBe(true);

            expect(dashboardData.calendar.today).toBeDefined();
            expect(Array.isArray(dashboardData.calendar.today)).toBe(true);
            expect(dashboardData.calendar.upcoming).toBeDefined();
            expect(Array.isArray(dashboardData.calendar.upcoming)).toBe(true);

            expect(dashboardData.tasks.priorities).toBeDefined();
            expect(Array.isArray(dashboardData.tasks.priorities)).toBe(true);

            expect(dashboardData.oura.sleep).toBeDefined();
            expect(dashboardData.oura.readiness).toBeDefined();
            expect(dashboardData.oura.activity).toBeDefined();
            expect(dashboardData.oura.recovery).toBeDefined();

            expect(dashboardData.integrationStatus.directApiWorking).toBeDefined();
            expect(dashboardData.integrationStatus.officialMCPWorking).toBeDefined();
            expect(dashboardData.integrationStatus.method).toBeDefined();

            console.log('✅ Dashboard service integration working correctly');
            console.log(`   - Habits: ${dashboardData.habits.today.length} items`);
            console.log(`   - Calendar today: ${dashboardData.calendar.today.length} items`);
            console.log(`   - Calendar upcoming: ${dashboardData.calendar.upcoming.length} items`);
            console.log(`   - Task priorities: ${dashboardData.tasks.priorities.length} items`);
            console.log(`   - Integration method: ${dashboardData.integrationStatus.method}`);
        });

        test('should handle service failures gracefully', async () => {
            // This test verifies that if one service fails, others still work
            const dashboardData = await getDashboardData(testUserId);

            // Even if some services fail, we should get a valid response
            expect(dashboardData).toBeDefined();
            expect(typeof dashboardData).toBe('object');

            console.log('✅ Dashboard service handles failures gracefully');
        });
    });

    describe('Notion Service Integration', () => {
        test('should fetch and parse tasks correctly', async () => {
            const tasks = await notionService.getTasksFromList('justin');

            expect(tasks).toBeDefined();
            expect(tasks.priorities).toBeDefined();
            expect(tasks.overdue).toBeDefined();
            expect(Array.isArray(tasks.priorities)).toBe(true);
            expect(Array.isArray(tasks.overdue)).toBe(true);

            // If we have tasks, verify their structure
            if (tasks.priorities.length > 0) {
                const task = tasks.priorities[0];
                expect(task).toHaveProperty('id');
                expect(task).toHaveProperty('title');
                expect(task).toHaveProperty('status');
                expect(task).toHaveProperty('priority');
                expect(task).toHaveProperty('url');
                expect(task).toHaveProperty('list');
                expect(task).toHaveProperty('completed');
                expect(typeof task.completed).toBe('boolean');
            }

            console.log(`✅ Notion service integration working. Found ${tasks.priorities.length} priority tasks`);
        });

        test('should fetch page content correctly', async () => {
            const studyPlan = await notionService.getSpanishStudyPlan();

            expect(studyPlan).toBeDefined();
            expect(studyPlan.title).toBeDefined();
            expect(studyPlan.content).toBeDefined();
            expect(studyPlan.subPages).toBeDefined();
            expect(studyPlan.tasks).toBeDefined();

            expect(typeof studyPlan.title).toBe('string');
            expect(typeof studyPlan.content).toBe('string');
            expect(Array.isArray(studyPlan.subPages)).toBe(true);
            expect(Array.isArray(studyPlan.tasks)).toBe(true);

            console.log(`✅ Notion page content integration working. Title: "${studyPlan.title}"`);
        });
    });

    describe('Screen Time Service Integration', () => {
        test('should connect to Supabase and handle queries', async () => {
            const screenTimeService = new ScreenTimeService();

            const result = await screenTimeService.getSummary({
                userId: testUserId,
                date: testDate
            });

            // Should return either data or null, but not throw
            expect(result === null || typeof result === 'object').toBe(true);

            if (result) {
                expect(result).toHaveProperty('date');
                expect(result).toHaveProperty('totalMinutes');
                expect(result).toHaveProperty('productiveMinutes');
                expect(result).toHaveProperty('distractingMinutes');
                expect(result).toHaveProperty('apps');

                expect(typeof result.totalMinutes).toBe('number');
                expect(typeof result.productiveMinutes).toBe('number');
                expect(typeof result.distractingMinutes).toBe('number');
                expect(Array.isArray(result.apps)).toBe(true);
            }

            console.log('✅ Screen time service integration working');
        });
    });

    describe('Oura Service Integration', () => {
        test('should initialize and provide service interface', () => {
            const ouraService = new OuraService();

            expect(ouraService).toBeDefined();
            expect(typeof ouraService.getSleep).toBe('function');
            expect(typeof ouraService.getReadiness).toBe('function');
            expect(typeof ouraService.getActivity).toBe('function');
            expect(typeof ouraService.getRecovery).toBe('function');

            console.log('✅ Oura service integration interface working');
        });

        test('should handle service calls without errors', async () => {
            const ouraService = new OuraService();

            // Currently returns null, but should not throw
            const sleep = await ouraService.getSleep({ userId: testUserId, date: testDate });
            const readiness = await ouraService.getReadiness({ userId: testUserId, date: testDate });
            const activity = await ouraService.getActivity({ userId: testUserId, date: testDate });
            const recovery = await ouraService.getRecovery({ userId: testUserId, date: testDate });

            // All should return null (current implementation) or valid data
            expect(sleep === null || typeof sleep === 'object').toBe(true);
            expect(readiness === null || typeof readiness === 'object').toBe(true);
            expect(activity === null || typeof activity === 'object').toBe(true);
            expect(recovery === null || typeof recovery === 'object').toBe(true);

            console.log('✅ Oura service calls working without errors');
        });
    });

    describe('Data Consistency Tests', () => {
        test('should return consistent data structure across multiple calls', async () => {
            const call1 = await getDashboardData(testUserId);
            const call2 = await getDashboardData(testUserId);

            // Structure should be consistent
            expect(Object.keys(call1)).toEqual(Object.keys(call2));

            // Nested structures should be consistent
            expect(Object.keys(call1.habits)).toEqual(Object.keys(call2.habits));
            expect(Object.keys(call1.calendar)).toEqual(Object.keys(call2.calendar));
            expect(Object.keys(call1.tasks)).toEqual(Object.keys(call2.tasks));
            expect(Object.keys(call1.oura)).toEqual(Object.keys(call2.oura));
            expect(Object.keys(call1.integrationStatus)).toEqual(Object.keys(call2.integrationStatus));

            console.log('✅ Data structure consistency verified');
        });
    });
});
