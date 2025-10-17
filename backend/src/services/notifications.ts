import { WebSocketServer } from 'ws';

export interface NotificationMessage {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: any;
    timestamp?: string;
}

export interface ProactiveNotification extends NotificationMessage {
    action?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
    private wss: WebSocketServer | null = null;

    /**
     * Set WebSocket server for real-time notifications
     */
    setWebSocketServer(wss: WebSocketServer): void {
        this.wss = wss;
    }

    /**
     * Send proactive notification to user
     */
    async sendProactiveNotification(notification: ProactiveNotification): Promise<void> {
        try {
            console.log('📱 Sending proactive notification:', {
                type: notification.type,
                title: notification.title,
                userId: notification.userId,
                priority: notification.priority || 'medium'
            });

            const message: NotificationMessage = {
                ...notification,
                timestamp: new Date().toISOString()
            };

            // Send via WebSocket to connected clients
            await this.sendWebSocketNotification(message);

            // Log notification for analytics
            await this.logNotification(message);

            console.log('✅ Proactive notification sent successfully');

        } catch (error) {
            console.error('❌ Error sending proactive notification:', error);
            throw error;
        }
    }

    /**
     * Send notification via WebSocket to connected clients
     */
    private async sendWebSocketNotification(message: NotificationMessage): Promise<void> {
        if (!this.wss) {
            console.warn('⚠️ WebSocket server not available for notifications');
            return;
        }

        const notificationPayload = {
            type: 'notification',
            data: message
        };

        let sentCount = 0;
        this.wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                try {
                    client.send(JSON.stringify(notificationPayload));
                    sentCount++;
                } catch (error) {
                    console.error('❌ Error sending WebSocket notification:', error);
                }
            }
        });

        console.log(`📡 WebSocket notification sent to ${sentCount} connected clients`);
    }

    /**
     * Log notification for analytics and debugging
     */
    private async logNotification(message: NotificationMessage): Promise<void> {
        try {
            // Import Supabase client dynamically
            const { createClient } = await import('@supabase/supabase-js');

            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.warn('⚠️ Supabase not configured for notification logging');
                return;
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: message.userId,
                    type: message.type,
                    title: message.title,
                    body: message.body,
                    data: message.data,
                    sent_at: message.timestamp,
                    delivery_method: 'websocket'
                });

            if (error) {
                console.error('❌ Error logging notification:', error);
            } else {
                console.log('📊 Notification logged to database');
            }

        } catch (error) {
            console.error('❌ Error in notification logging:', error);
        }
    }

    /**
     * Send different types of proactive notifications
     */
    async sendWakeDetectionNotification(userId: string, sleepData: any): Promise<void> {
        await this.sendProactiveNotification({
            userId,
            type: 'wake_detected',
            title: 'Good morning! Ready for your transformation day? 🌅',
            body: `You slept ${Math.round(sleepData.duration / 3600)} hours with a ${sleepData.sleep_score}% sleep score.`,
            data: { sleepData },
            action: 'start_morning_routine',
            priority: 'high'
        });
    }

    async sendDistractionAlert(userId: string, appName: string, usageMinutes: number): Promise<void> {
        await this.sendProactiveNotification({
            userId,
            type: 'distraction_alert',
            title: `Time to refocus! 🎯`,
            body: `You've been on ${appName} for ${usageMinutes} minutes. Ready to get back to your priorities?`,
            data: { appName, usageMinutes },
            action: 'redirect_to_focus',
            priority: 'medium'
        });
    }

    async sendHabitReminder(userId: string, habitName: string): Promise<void> {
        await this.sendProactiveNotification({
            userId,
            type: 'habit_reminder',
            title: `Don't forget: ${habitName} 📋`,
            body: `Time to complete your ${habitName} habit for today!`,
            data: { habitName },
            action: 'complete_habit',
            priority: 'medium'
        });
    }

    async sendWorkoutReminder(userId: string, readinessScore: number): Promise<void> {
        let message = '';
        if (readinessScore >= 80) {
            message = 'Your body is ready for an intense workout! 💪';
        } else if (readinessScore >= 60) {
            message = 'Good energy for a moderate workout today! 🏃';
        } else {
            message = 'Consider a light workout or rest day today. 🤗';
        }

        await this.sendProactiveNotification({
            userId,
            type: 'workout_reminder',
            title: `Workout time! ${message}`,
            body: `Your readiness score is ${readinessScore}%. Time for your daily exercise!`,
            data: { readinessScore },
            action: 'start_workout',
            priority: 'medium'
        });
    }

    async sendSpanishStudyReminder(userId: string): Promise<void> {
        await this.sendProactiveNotification({
            userId,
            type: 'spanish_study_reminder',
            title: '¡Hora de estudiar español! 🇪🇸',
            body: 'Time for your daily Spanish study session. Let\'s build that fluency!',
            data: {},
            action: 'start_spanish_study',
            priority: 'medium'
        });
    }

    async sendGreenCardStudyReminder(userId: string, daysUntilInterview: number): Promise<void> {
        const urgency = daysUntilInterview <= 7 ? 'urgent' : daysUntilInterview <= 14 ? 'high' : 'medium';

        await this.sendProactiveNotification({
            userId,
            type: 'green_card_study_reminder',
            title: `Green card interview in ${daysUntilInterview} days! 📋`,
            body: `Time to practice your interview questions. Every day counts!`,
            data: { daysUntilInterview },
            action: 'start_interview_prep',
            priority: urgency
        });
    }
}

export const notificationService = new NotificationService();

// Export individual functions for easier imports
export const sendProactiveNotification = (notification: ProactiveNotification) =>
    notificationService.sendProactiveNotification(notification);

