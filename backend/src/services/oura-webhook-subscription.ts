/**
 * Oura Webhook Subscription Service
 * Handles creating, managing, and deleting webhook subscriptions with Oura API
 */

export interface OuraWebhookSubscription {
    id?: string;
    callback_url: string;
    verification_token: string;
    event_type: 'create' | 'update' | 'delete';
    data_type: 'tag' | 'enhanced_tag' | 'workout' | 'session' | 'sleep' | 'daily_sleep' |
    'daily_readiness' | 'daily_activity' | 'daily_spo2' | 'sleep_time' |
    'rest_mode_period' | 'ring_configuration' | 'daily_stress' |
    'daily_cardiovascular_age' | 'daily_resilience' | 'vo2_max';
}

export class OuraWebhookSubscriptionService {
    private baseUrl: string = 'https://api.ouraring.com/v2';
    private clientId: string = '';
    private clientSecret: string = '';

    constructor() {
        // Initialize credentials lazily to ensure env vars are loaded
        this.initializeCredentials();
    }

    private initializeCredentials() {
        // Use the actual environment variable names you have
        this.clientId = process.env.OURA_APP_ID || '';
        this.clientSecret = process.env.OURA_APP_SECRET || '';

        console.log('🔑 Oura Webhook Subscription Service initialized:', {
            hasClientId: !!this.clientId,
            hasClientSecret: !!this.clientSecret,
            clientIdLength: this.clientId.length,
            clientSecretLength: this.clientSecret.length,
            envVars: {
                OURA_APP_ID: process.env.OURA_APP_ID ? 'SET' : 'NOT SET',
                OURA_APP_SECRET: process.env.OURA_APP_SECRET ? 'SET' : 'NOT SET',
                OURA_API_TOKEN: process.env.OURA_API_TOKEN ? 'SET' : 'NOT SET',
                OURA_WEBHOOK_SECRET: process.env.OURA_WEBHOOK_SECRET ? 'SET' : 'NOT SET'
            }
        });

        if (!this.clientId || !this.clientSecret) {
            console.warn('⚠️ Missing Oura credentials. Please set OURA_APP_ID and OURA_APP_SECRET in your .env file');
        }
    }

    /**
     * Create a new webhook subscription
     */
    async createSubscription(subscription: OuraWebhookSubscription): Promise<any> {
        try {
            // Reinitialize credentials if they're missing
            if (!this.clientId || !this.clientSecret) {
                this.initializeCredentials();
            }

            if (!this.clientId || !this.clientSecret) {
                throw new Error('Oura credentials not configured. Please set OURA_APP_ID and OURA_APP_SECRET in your .env file');
            }

            console.log('🔗 Creating Oura webhook subscription:', {
                callback_url: subscription.callback_url,
                event_type: subscription.event_type,
                data_type: subscription.data_type
            });

            const response = await fetch(`${this.baseUrl}/webhook/subscription`, {
                method: 'POST',
                headers: {
                    'x-client-id': this.clientId,
                    'x-client-secret': this.clientSecret,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Webhook subscription created successfully:', result);
            return result;

        } catch (error) {
            console.error('❌ Error creating webhook subscription:', error);
            throw error;
        }
    }

    /**
     * List all webhook subscriptions
     */
    async listSubscriptions(): Promise<any[]> {
        try {
            console.log('📋 Listing Oura webhook subscriptions');

            const response = await fetch(`${this.baseUrl}/webhook/subscription`, {
                method: 'GET',
                headers: {
                    'x-client-id': this.clientId,
                    'x-client-secret': this.clientSecret
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json() as any;
            console.log('✅ Webhook subscriptions retrieved:', result);
            return result.data || [];

        } catch (error) {
            console.error('❌ Error listing webhook subscriptions:', error);
            throw error;
        }
    }

    /**
     * Delete a webhook subscription
     */
    async deleteSubscription(subscriptionId: string): Promise<void> {
        try {
            console.log('🗑️ Deleting Oura webhook subscription:', subscriptionId);

            const response = await fetch(`${this.baseUrl}/webhook/subscription/${subscriptionId}`, {
                method: 'DELETE',
                headers: {
                    'x-client-id': this.clientId,
                    'x-client-secret': this.clientSecret
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            console.log('✅ Webhook subscription deleted successfully');

        } catch (error) {
            console.error('❌ Error deleting webhook subscription:', error);
            throw error;
        }
    }

    /**
     * Set up all recommended webhook subscriptions for the personal assistant
     */
    async setupPersonalAssistantSubscriptions(baseUrl: string): Promise<any[]> {
        try {
            console.log('🚀 Setting up personal assistant webhook subscriptions');

            const subscriptions: OuraWebhookSubscription[] = [
                {
                    callback_url: `${baseUrl}/webhooks/oura`,
                    verification_token: process.env.OURA_WEBHOOK_SECRET || '',
                    event_type: 'update',
                    data_type: 'sleep'
                },
                {
                    callback_url: `${baseUrl}/webhooks/oura`,
                    verification_token: process.env.OURA_WEBHOOK_SECRET || '',
                    event_type: 'update',
                    data_type: 'daily_sleep'
                },
                {
                    callback_url: `${baseUrl}/webhooks/oura`,
                    verification_token: process.env.OURA_WEBHOOK_SECRET || '',
                    event_type: 'update',
                    data_type: 'daily_readiness'
                },
                {
                    callback_url: `${baseUrl}/webhooks/oura`,
                    verification_token: process.env.OURA_WEBHOOK_SECRET || '',
                    event_type: 'update',
                    data_type: 'daily_activity'
                }
            ];

            const results = [];
            for (const subscription of subscriptions) {
                try {
                    const result = await this.createSubscription(subscription);
                    results.push(result);
                } catch (error) {
                    console.error(`❌ Failed to create subscription for ${subscription.data_type}:`, error);
                    // Continue with other subscriptions even if one fails
                }
            }

            console.log('✅ Personal assistant webhook subscriptions setup complete');
            return results;

        } catch (error) {
            console.error('❌ Error setting up personal assistant subscriptions:', error);
            throw error;
        }
    }

    /**
     * Clean up all existing subscriptions (useful for testing)
     */
    async cleanupAllSubscriptions(): Promise<void> {
        try {
            console.log('🧹 Cleaning up all webhook subscriptions');

            const subscriptions = await this.listSubscriptions();

            for (const subscription of subscriptions) {
                if (subscription.id) {
                    await this.deleteSubscription(subscription.id);
                }
            }

            console.log('✅ All webhook subscriptions cleaned up');

        } catch (error) {
            console.error('❌ Error cleaning up subscriptions:', error);
            throw error;
        }
    }
}

export const ouraWebhookSubscriptionService = new OuraWebhookSubscriptionService();
