/**
 * API Endpoint Integration Tests
 * Tests the actual HTTP endpoints with real requests
 * Uses supertest to test the Express app directly
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { chatRouter } from '../routes/chat';
import { dashboardRouter } from '../routes/dashboard';
import { activityRouter } from '../routes/activity';

// Create test app
const createTestApp = () => {
    const app = express();

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:4000',
        credentials: true
    }));
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    });

    // API Routes
    app.use('/api/chat', chatRouter);
    app.use('/api/dashboard', dashboardRouter);
    app.use('/api/activity', activityRouter);

    return app;
};

describe('API Endpoint Integration Tests', () => {
    const app = createTestApp();
    const testUserId = 'test-user-api';

    describe('Health Check Endpoint', () => {
        test('GET /health should return 200 with status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version', '1.0.0');

            console.log('✅ Health endpoint working correctly');
        });
    });

    describe('Chat Endpoints', () => {
        test('POST /api/chat should accept messages and return responses', async () => {
            const testMessage = 'Hello, can you help me with my morning routine?';

            const response = await request(app)
                .post('/api/chat')
                .send({
                    message: testMessage,
                    userId: testUserId
                })
                .expect(200);

            expect(response.body).toHaveProperty('response');
            expect(response.body).toHaveProperty('timestamp');
            expect(typeof response.body.response).toBe('string');
            expect(response.body.response.length).toBeGreaterThan(0);

            console.log(`✅ Chat endpoint working. Response length: ${response.body.response.length}`);
        });

        test('POST /api/chat should reject requests without message', async () => {
            await request(app)
                .post('/api/chat')
                .send({
                    userId: testUserId
                })
                .expect(400);

            console.log('✅ Chat endpoint properly validates required fields');
        });

        test('GET /api/chat/briefing should generate morning briefing', async () => {
            const response = await request(app)
                .get('/api/chat/briefing')
                .query({ userId: testUserId })
                .expect(200);

            expect(response.body).toHaveProperty('briefing');
            expect(response.body).toHaveProperty('timestamp');
            expect(typeof response.body.briefing).toBe('string');
            expect(response.body.briefing.length).toBeGreaterThan(0);

            console.log(`✅ Morning briefing endpoint working. Briefing length: ${response.body.briefing.length}`);
        });

        test('POST /api/chat/check-in should perform evening check-in', async () => {
            const response = await request(app)
                .post('/api/chat/check-in')
                .send({ userId: testUserId })
                .expect(200);

            expect(response.body).toHaveProperty('checkIn');
            expect(response.body).toHaveProperty('timestamp');
            expect(typeof response.body.checkIn).toBe('string');
            expect(response.body.checkIn.length).toBeGreaterThan(0);

            console.log(`✅ Evening check-in endpoint working. Check-in length: ${response.body.checkIn.length}`);
        });

        test('GET /api/chat/spanish-study should fetch Spanish study plan', async () => {
            const response = await request(app)
                .get('/api/chat/spanish-study')
                .expect(200);

            expect(response.body).toHaveProperty('studyPlan');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body.studyPlan).toHaveProperty('title');
            expect(response.body.studyPlan).toHaveProperty('content');
            expect(response.body.studyPlan).toHaveProperty('subPages');
            expect(response.body.studyPlan).toHaveProperty('tasks');

            console.log(`✅ Spanish study plan endpoint working. Title: "${response.body.studyPlan.title}"`);
        });
    });

    describe('Dashboard Endpoints', () => {
        test('GET /api/dashboard should return dashboard data', async () => {
            const response = await request(app)
                .get('/api/dashboard')
                .query({ userId: testUserId })
                .expect(200);

            expect(response.body.data).toHaveProperty('habits');
            expect(response.body.data).toHaveProperty('calendar');
            expect(response.body.data).toHaveProperty('tasks');
            expect(response.body.data).toHaveProperty('oura');
            expect(response.body.data).toHaveProperty('screenTime');
            expect(response.body.data).toHaveProperty('integrationStatus');

            // Check structure of nested objects
            expect(response.body.data.habits).toHaveProperty('today');
            expect(response.body.data.calendar).toHaveProperty('today');
            expect(response.body.data.calendar).toHaveProperty('upcoming');
            expect(response.body.data.tasks).toHaveProperty('priorities');
            expect(response.body.data.oura).toHaveProperty('sleep');
            expect(response.body.data.oura).toHaveProperty('readiness');
            expect(response.body.data.oura).toHaveProperty('activity');
            expect(response.body.data.oura).toHaveProperty('recovery');
            expect(response.body.data.integrationStatus).toHaveProperty('directApiWorking');
            expect(response.body.data.integrationStatus).toHaveProperty('officialMCPWorking');
            expect(response.body.data.integrationStatus).toHaveProperty('method');

            console.log('✅ Dashboard endpoint working with proper data structure');
        });
    });

    describe('Activity Endpoints', () => {
        test('should handle activity endpoint gracefully', async () => {
            // The activity endpoint doesn't exist yet, so we expect 404
            await request(app)
                .get('/api/activity')
                .query({ userId: testUserId })
                .expect(404);

            console.log('✅ Activity endpoint properly returns 404 (not implemented yet)');
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid routes gracefully', async () => {
            await request(app)
                .get('/api/nonexistent')
                .expect(404);

            console.log('✅ 404 handling working correctly');
        });

        test('should handle malformed JSON gracefully', async () => {
            await request(app)
                .post('/api/chat')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);

            console.log('✅ Malformed JSON handling working correctly');
        });
    });
});
