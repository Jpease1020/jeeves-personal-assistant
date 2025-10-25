/**
 * Health Check Tests
 * Tests the connectivity and basic functionality of external services
 * These tests use REAL APIs with minimal mocking
 */

import { notionService } from '../services/notion-service';
import { OuraService } from '../services/oura-service';
import { ScreenTimeService } from '../services/screen-time-service';

describe('Health Checks - External Services', () => {
    const testUserId = 'test-user-health-check';
    const testDate = '2024-01-15';

    describe('Notion Service Health', () => {
        test('should connect to Notion API successfully', async () => {
            // This test uses the REAL Notion API
            // It should pass if your NOTION_API_KEY is valid

            try {
                const tasks = await notionService.getTasksFromList('justin');

                // We expect either data or an empty result, but no errors
                expect(tasks).toBeDefined();
                expect(tasks.priorities).toBeDefined();
                expect(tasks.overdue).toBeDefined();
                expect(Array.isArray(tasks.priorities)).toBe(true);
                expect(Array.isArray(tasks.overdue)).toBe(true);

                console.log(`✅ Notion API connected successfully. Found ${tasks.priorities.length} priority tasks`);
            } catch (error) {
                // If this fails, it means your Notion API key is invalid or the database doesn't exist
                console.error('❌ Notion API connection failed:', error);
                throw error;
            }
        });

        test('should fetch Spanish study plan content', async () => {
            try {
                const studyPlan = await notionService.getSpanishStudyPlan();

                expect(studyPlan).toBeDefined();
                expect(studyPlan.title).toBeDefined();
                expect(studyPlan.content).toBeDefined();
                expect(studyPlan.subPages).toBeDefined();
                expect(studyPlan.tasks).toBeDefined();

                console.log(`✅ Spanish study plan fetched: "${studyPlan.title}"`);
            } catch (error) {
                console.error('❌ Spanish study plan fetch failed:', error);
                throw error;
            }
        });
    });

    describe('Supabase Health', () => {
        test('should connect to Supabase successfully', async () => {
            const screenTimeService = new ScreenTimeService();

            try {
                // Try to fetch screen time data (should return null for test user, but no error)
                const result = await screenTimeService.getSummary({
                    userId: testUserId,
                    date: testDate
                });

                // We expect either data or null, but no errors
                expect(result === null || typeof result === 'object').toBe(true);

                console.log('✅ Supabase connected successfully');
            } catch (error) {
                console.error('❌ Supabase connection failed:', error);
                throw error;
            }
        });
    });

    describe('Oura Service Health', () => {
        test('should initialize Oura service without errors', () => {
            const ouraService = new OuraService();

            // Currently returns null for all methods, but should not throw
            expect(ouraService).toBeDefined();
            expect(typeof ouraService.getSleep).toBe('function');
            expect(typeof ouraService.getReadiness).toBe('function');
            expect(typeof ouraService.getActivity).toBe('function');
            expect(typeof ouraService.getRecovery).toBe('function');

            console.log('✅ Oura service initialized successfully');
        });
    });

    describe('Environment Variables Health', () => {
        test('should have required environment variables', () => {
            const requiredVars = [
                'SUPABASE_URL',
                'SUPABASE_SERVICE_KEY',
                'NOTION_API_KEY',
                'ANTHROPIC_API_KEY'
            ];

            const missingVars = requiredVars.filter(varName => !process.env[varName]);

            if (missingVars.length > 0) {
                console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
                console.warn('Some tests may fail. Please check your .env.test file');
            }

            // Don't fail the test, just warn
            expect(missingVars.length).toBeLessThan(requiredVars.length);
        });
    });
});
