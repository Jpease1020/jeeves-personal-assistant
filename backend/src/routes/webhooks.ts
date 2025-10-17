import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ouraWebhookService } from '../services/oura-webhook';
import { ouraWebhookSubscriptionService } from '../services/oura-webhook-subscription';

export const webhookRouter = Router();

/**
 * Oura webhook verification endpoint (GET) - Required for subscription setup
 * This endpoint handles the verification challenge from Oura
 */
webhookRouter.get('/oura', (req: Request, res: Response) => {
    const { verification_token, challenge } = req.query;
    const expectedToken = process.env.OURA_WEBHOOK_SECRET;

    console.log('🔍 Oura webhook verification request:', {
        verification_token: verification_token ? '***' : 'missing',
        challenge: challenge ? '***' : 'missing',
        expectedToken: expectedToken ? '***' : 'missing'
    });

    if (verification_token === expectedToken) {
        console.log('✅ Webhook verification successful');
        return res.json({ challenge });
    }

    console.warn('❌ Webhook verification failed - invalid token');
    return res.status(401).send('Invalid verification token');
});

/**
 * Oura webhook event endpoint (POST) - Processes real-time events
 * This endpoint receives webhook notifications from Oura API
 */
webhookRouter.post('/oura', async (req: Request, res: Response) => {
    try {
        console.log('📡 Received Oura webhook event:', {
            headers: Object.keys(req.headers),
            bodyKeys: Object.keys(req.body || {}),
            timestamp: new Date().toISOString()
        });

        // Verify webhook signature for security
        const signature = req.headers['x-oura-signature'] as string;
        const timestamp = req.headers['x-oura-timestamp'] as string;
        const clientSecret = process.env.OURA_CLIENT_SECRET;

        if (signature && timestamp && clientSecret) {
            if (!verifyWebhookSignature(signature, timestamp, req.body, clientSecret)) {
                console.warn('⚠️ Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
            console.log('✅ Webhook signature verified');
        } else {
            console.warn('⚠️ Missing signature verification data');
        }

        // Always respond quickly (under 10 seconds) as required by Oura
        res.status(200).send('OK');

        // Process the event asynchronously
        const { event_type, data_type, object_id, user_id, event_time } = req.body;

        console.log('🔄 Processing webhook event:', {
            event_type,
            data_type,
            object_id,
            user_id,
            event_time
        });

        // Handle different data types
        if (data_type === 'sleep' || data_type === 'daily_sleep') {
            await handleSleepEvent(event_type, object_id, user_id);
        } else if (data_type === 'daily_activity') {
            await handleActivityEvent(event_type, object_id, user_id);
        } else if (data_type === 'daily_readiness') {
            await handleReadinessEvent(event_type, object_id, user_id);
        }

    } catch (error) {
        console.error('❌ Error processing Oura webhook:', error);
        // Don't send error response here since we already sent OK
    }
});

/**
 * Oura Ring sleep data webhook endpoint (Legacy)
 */
webhookRouter.post('/oura/sleep', async (req: Request, res: Response) => {
    try {
        console.log('📥 Received Oura webhook:', {
            headers: req.headers,
            bodyKeys: Object.keys(req.body || {}),
            timestamp: new Date().toISOString()
        });

        // Get webhook signature from headers
        const signature = req.headers['x-oura-signature'] as string;

        if (!signature) {
            console.warn('⚠️ No signature found in Oura webhook');
            return res.status(400).json({ error: 'Missing signature' });
        }

        // Verify webhook signature
        const payload = JSON.stringify(req.body);
        const isValid = ouraWebhookService.verifyWebhookSignature(payload, signature);

        if (!isValid) {
            console.error('❌ Invalid Oura webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('✅ Oura webhook signature verified');

        // Process the sleep data
        await ouraWebhookService.processSleepData(req.body);

        // Respond to Oura
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error processing Oura webhook:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Test webhook endpoint for development
 */
webhookRouter.post('/oura/test', async (req: Request, res: Response) => {
    try {
        console.log('🧪 Testing Oura webhook with sample data');

        // Sample sleep data for testing
        const samplePayload = {
            user_id: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4',
            subscription_id: 'test-subscription',
            event_type: 'sleep.updated',
            data: {
                sleep: [{
                    bedtime_start: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
                    bedtime_end: new Date().toISOString(), // Now
                    duration: 28800, // 8 hours in seconds
                    total_sleep_duration: 25200, // 7 hours
                    awake_time: 3600, // 1 hour awake
                    light_sleep_duration: 14400, // 4 hours
                    deep_sleep_duration: 7200, // 2 hours
                    rem_sleep_duration: 3600, // 1 hour
                    hr_average: 55,
                    hr_lowest: 45,
                    temperature_delta: -0.2,
                    temperature_trend_deviation: 0.1,
                    respiratory_rate_average: 14.5,
                    spo2_average: 97,
                    spo2_minimum: 95,
                    sleep_score: 85,
                    sleep_consistency: 80,
                    sleep_efficiency: 88
                }]
            }
        };

        // Process the test data
        await ouraWebhookService.processSleepData(samplePayload);

        res.status(200).json({
            success: true,
            message: 'Test webhook processed successfully',
            sampleData: samplePayload
        });

    } catch (error) {
        console.error('❌ Error processing test webhook:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Webhook setup instructions endpoint
 */
webhookRouter.get('/oura/setup', async (req: Request, res: Response) => {
    try {
        console.log('📋 Providing Oura webhook setup instructions');

        const setupInstructions = {
            webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:4001'}/webhooks/oura/sleep`,
            events: ['sleep.updated', 'sleep.completed'],
            steps: [
                '1. Go to Oura Cloud API settings',
                '2. Navigate to Webhooks section',
                '3. Add webhook URL (see webhookUrl above)',
                '4. Select events: sleep.updated, sleep.completed',
                '5. Set webhook secret in .env as OURA_WEBHOOK_SECRET',
                '6. Test webhook with /webhooks/oura/test endpoint'
            ],
            testEndpoint: `${process.env.BACKEND_URL || 'http://localhost:4001'}/webhooks/oura/test`,
            environmentVariables: {
                OURA_WEBHOOK_SECRET: 'Required - Set this in your .env file',
                BACKEND_URL: 'Optional - Your backend URL for webhook callbacks'
            }
        };

        res.status(200).json(setupInstructions);

    } catch (error) {
        console.error('❌ Error providing setup instructions:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Webhook subscription management endpoints
 */

/**
 * Create a new webhook subscription
 */
webhookRouter.post('/oura/subscription', async (req: Request, res: Response) => {
    try {
        const subscription = req.body;
        const result = await ouraWebhookSubscriptionService.createSubscription(subscription);
        res.status(201).json(result);
    } catch (error) {
        console.error('❌ Error creating webhook subscription:', error);
        res.status(500).json({
            error: 'Failed to create webhook subscription',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * List all webhook subscriptions
 */
webhookRouter.get('/oura/subscription', async (req: Request, res: Response) => {
    try {
        const subscriptions = await ouraWebhookSubscriptionService.listSubscriptions();
        res.status(200).json({ subscriptions });
    } catch (error) {
        console.error('❌ Error listing webhook subscriptions:', error);
        res.status(500).json({
            error: 'Failed to list webhook subscriptions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Delete a webhook subscription
 */
webhookRouter.delete('/oura/subscription/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ouraWebhookSubscriptionService.deleteSubscription(id);
        res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting webhook subscription:', error);
        res.status(500).json({
            error: 'Failed to delete webhook subscription',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Set up all recommended webhook subscriptions for personal assistant
 */
webhookRouter.post('/oura/setup-subscriptions', async (req: Request, res: Response) => {
    try {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4001';
        const results = await ouraWebhookSubscriptionService.setupPersonalAssistantSubscriptions(baseUrl);
        res.status(200).json({
            message: 'Personal assistant webhook subscriptions setup complete',
            subscriptions: results
        });
    } catch (error) {
        console.error('❌ Error setting up webhook subscriptions:', error);
        res.status(500).json({
            error: 'Failed to setup webhook subscriptions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Clean up all webhook subscriptions (useful for testing)
 */
webhookRouter.delete('/oura/cleanup-subscriptions', async (req: Request, res: Response) => {
    try {
        await ouraWebhookSubscriptionService.cleanupAllSubscriptions();
        res.status(200).json({ message: 'All webhook subscriptions cleaned up' });
    } catch (error) {
        console.error('❌ Error cleaning up subscriptions:', error);
        res.status(500).json({
            error: 'Failed to cleanup subscriptions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Health check for webhook endpoints
 */
webhookRouter.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            'GET /webhooks/oura': 'Oura webhook verification',
            'POST /webhooks/oura': 'Oura webhook events',
            'POST /webhooks/oura/sleep': 'Oura sleep data webhook (legacy)',
            'POST /webhooks/oura/test': 'Test webhook with sample data',
            'GET /webhooks/oura/setup': 'Webhook setup instructions',
            'POST /webhooks/oura/subscription': 'Create webhook subscription',
            'GET /webhooks/oura/subscription': 'List webhook subscriptions',
            'DELETE /webhooks/oura/subscription/:id': 'Delete webhook subscription',
            'POST /webhooks/oura/setup-subscriptions': 'Setup all PA subscriptions',
            'DELETE /webhooks/oura/cleanup-subscriptions': 'Cleanup all subscriptions',
            'GET /webhooks/health': 'Health check'
        }
    });
});

/**
 * Helper function to verify webhook signature according to Oura's specification
 * Creates HMAC using client secret and compares with received signature
 */
function verifyWebhookSignature(signature: string, timestamp: string, body: any, clientSecret: string): boolean {
    try {
        // Create HMAC using your client secret
        const hmac = crypto.createHmac('sha256', clientSecret);
        hmac.update(timestamp + JSON.stringify(body));
        const calculatedSignature = hmac.digest('hex').toUpperCase();

        // Compare calculated signature with received signature
        return calculatedSignature === signature;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

/**
 * Helper function to handle sleep events
 */
async function handleSleepEvent(eventType: string, objectId: string, userId: string) {
    try {
        console.log(`🌙 Processing sleep ${eventType} event for user ${userId}, object ${objectId}`);

        // Import dynamically to avoid circular dependencies
        const { sendProactiveNotification } = await import('../services/notifications');

        if (eventType === 'update') {
            // Trigger morning routine if this is a wake event
            await sendProactiveNotification({
                userId,
                type: 'sleep_updated',
                title: 'Sleep data updated! 🌙',
                body: 'Your sleep data has been synced. Ready for your morning routine?',
                data: {
                    objectId,
                    action: 'check_sleep_data'
                }
            });
        }

    } catch (error) {
        console.error('Error handling sleep event:', error);
    }
}

/**
 * Helper function to handle activity events
 */
async function handleActivityEvent(eventType: string, objectId: string, userId: string) {
    try {
        console.log(`🏃 Processing activity ${eventType} event for user ${userId}, object ${objectId}`);

        const { sendProactiveNotification } = await import('../services/notifications');

        if (eventType === 'update') {
            await sendProactiveNotification({
                userId,
                type: 'activity_updated',
                title: 'Activity data updated! 🏃',
                body: 'Your activity data has been synced. Great job staying active!',
                data: {
                    objectId,
                    action: 'check_activity_data'
                }
            });
        }

    } catch (error) {
        console.error('Error handling activity event:', error);
    }
}

/**
 * Helper function to handle readiness events
 */
async function handleReadinessEvent(eventType: string, objectId: string, userId: string) {
    try {
        console.log(`💪 Processing readiness ${eventType} event for user ${userId}, object ${objectId}`);

        const { sendProactiveNotification } = await import('../services/notifications');

        if (eventType === 'update') {
            await sendProactiveNotification({
                userId,
                type: 'readiness_updated',
                title: 'Readiness data updated! 💪',
                body: 'Your readiness score has been updated. Ready for your workout?',
                data: {
                    objectId,
                    action: 'check_readiness_data'
                }
            });
        }

    } catch (error) {
        console.error('Error handling readiness event:', error);
    }
}

export default webhookRouter;

