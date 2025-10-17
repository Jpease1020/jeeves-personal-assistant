import crypto from 'crypto';

export interface OuraSleepData {
    bedtime_start: string;
    bedtime_end: string;
    duration: number;
    total_sleep_duration: number;
    awake_time: number;
    light_sleep_duration: number;
    deep_sleep_duration: number;
    rem_sleep_duration: number;
    hr_average: number;
    hr_lowest: number;
    temperature_delta: number;
    temperature_trend_deviation: number;
    respiratory_rate_average: number;
    spo2_average: number;
    spo2_minimum: number;
    sleep_score: number;
    sleep_consistency: number;
    sleep_efficiency: number;
}

export interface OuraWebhookPayload {
    user_id: string;
    subscription_id: string;
    event_type: string;
    data: {
        sleep: OuraSleepData[];
    };
}

export class OuraWebhookService {
    private webhookSecret: string;

    constructor() {
        this.webhookSecret = process.env.OURA_WEBHOOK_SECRET || '';
    }

    /**
     * Verify webhook signature from Oura
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        if (!this.webhookSecret) {
            console.warn('⚠️ Oura webhook secret not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Process sleep data and detect wake events (real-time processing, no storage)
     */
    async processSleepData(payload: OuraWebhookPayload): Promise<void> {
        try {
            console.log('🔄 Processing Oura sleep data:', {
                eventType: payload.event_type,
                userId: payload.user_id,
                sleepRecords: payload.data.sleep?.length || 0
            });

            if (!payload.data.sleep || payload.data.sleep.length === 0) {
                console.log('📊 No sleep data in webhook payload');
                return;
            }

            // Get the most recent sleep record
            const latestSleep = payload.data.sleep[0];

            // Process wake detection in real-time (no storage needed)
            if (latestSleep.bedtime_end) {
                await this.detectWakeEvent(payload.user_id, latestSleep);
            }

            // Log sleep insights for debugging
            console.log('💤 Sleep insights:', {
                sleepScore: latestSleep.sleep_score,
                sleepDuration: Math.round(latestSleep.duration / 3600) + ' hours',
                sleepEfficiency: latestSleep.sleep_efficiency + '%',
                deepSleep: Math.round(latestSleep.deep_sleep_duration / 3600) + ' hours',
                remSleep: Math.round(latestSleep.rem_sleep_duration / 3600) + ' hours'
            });

        } catch (error) {
            console.error('❌ Error processing Oura sleep data:', error);
            throw error;
        }
    }


    /**
     * Detect if user just woke up and trigger morning routine
     */
    private async detectWakeEvent(userId: string, sleepData: OuraSleepData): Promise<void> {
        const wakeTime = new Date(sleepData.bedtime_end);
        const now = new Date();
        const timeSinceWake = now.getTime() - wakeTime.getTime();
        const wakeWindowMinutes = 30; // Consider wake events within 30 minutes

        console.log('🌅 Wake detection analysis:', {
            wakeTime: wakeTime.toISOString(),
            currentTime: now.toISOString(),
            timeSinceWakeMinutes: Math.round(timeSinceWake / (1000 * 60)),
            sleepScore: sleepData.sleep_score,
            sleepDuration: sleepData.duration
        });

        // Check if wake was recent
        if (timeSinceWake <= wakeWindowMinutes * 60 * 1000) {
            console.log('✅ Wake event detected within window, triggering morning routine');
            await this.triggerMorningRoutine(userId, sleepData);
        } else {
            console.log('⏰ Wake event too old, not triggering morning routine');
        }
    }

    /**
     * Trigger morning routine for user
     */
    private async triggerMorningRoutine(userId: string, sleepData: OuraSleepData): Promise<void> {
        try {
            console.log('🌅 Triggering morning routine for user:', userId);

            // Import dynamically to avoid circular dependencies
            const { sendProactiveNotification } = await import('./notifications');
            const { logWakeTime } = await import('./morning-routine');

            // Send wake detection notification
            await sendProactiveNotification({
                userId,
                type: 'wake_detected',
                title: 'Good morning! Ready for your transformation day? 🌅',
                body: this.generateMorningMessage(sleepData),
                data: {
                    wakeTime: sleepData.bedtime_end,
                    sleepScore: sleepData.sleep_score,
                    sleepDuration: sleepData.duration,
                    action: 'start_morning_routine'
                }
            });

            // Log wake time for analytics
            await logWakeTime(userId, new Date(sleepData.bedtime_end), {
                sleepScore: sleepData.sleep_score,
                sleepDuration: sleepData.duration,
                sleepEfficiency: sleepData.sleep_efficiency,
                deepSleep: sleepData.deep_sleep_duration,
                remSleep: sleepData.rem_sleep_duration
            });

            console.log('✅ Morning routine triggered successfully');

        } catch (error) {
            console.error('❌ Error triggering morning routine:', error);
            throw error;
        }
    }

    /**
     * Generate personalized morning message based on sleep data
     */
    private generateMorningMessage(sleepData: OuraSleepData): string {
        const sleepScore = sleepData.sleep_score;
        const sleepHours = Math.round(sleepData.duration / 3600);
        const sleepEfficiency = sleepData.sleep_efficiency;

        let message = `You slept ${sleepHours} hours with a ${sleepScore}% sleep score. `;

        if (sleepScore >= 85) {
            message += 'Excellent sleep! Perfect energy for your workout today! 💪';
        } else if (sleepScore >= 70) {
            message += 'Good sleep! Ready to tackle your goals today! 🎯';
        } else if (sleepScore >= 50) {
            message += 'Decent rest. Let\'s start with lighter tasks today. 🌅';
        } else {
            message += 'Tough night. Focus on recovery and gentle activities today. 🤗';
        }

        return message;
    }

    /**
     * Set up webhook with Oura API (manual setup required)
     */
    async setupWebhook(): Promise<void> {
        console.log('🔧 Oura webhook setup instructions:');
        console.log('1. Go to Oura Cloud API settings');
        console.log('2. Add webhook URL:', `${process.env.BACKEND_URL}/webhooks/oura/sleep`);
        console.log('3. Select events: sleep.updated, sleep.completed');
        console.log('4. Set webhook secret in .env as OURA_WEBHOOK_SECRET');
        console.log('5. Test webhook with sample data');
    }
}

export const ouraWebhookService = new OuraWebhookService();

