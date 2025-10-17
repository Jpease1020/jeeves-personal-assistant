// PWA Push Notification Manager
export class PushNotificationManager {
    private registration: ServiceWorkerRegistration | null = null;
    private isSupported = false;

    constructor() {
        this.checkSupport();
    }

    // Check if push notifications are supported
    private checkSupport() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        console.log('📱 Push Notifications:', this.isSupported ? 'Supported' : 'Not supported');
    }

    // Request notification permission
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported) {
            console.log('❌ Push Notifications: Not supported');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('📱 Push Notifications: Permission status:', permission);
            return permission === 'granted';
        } catch (error) {
            console.error('❌ Push Notifications: Permission request failed', error);
            return false;
        }
    }

    // Subscribe to push notifications
    async subscribe(): Promise<PushSubscription | null> {
        if (!this.isSupported) {
            console.log('❌ Push Notifications: Not supported');
            return null;
        }

        try {
            // Get service worker registration
            this.registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            const existingSubscription = await this.registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('✅ Push Notifications: Already subscribed');
                return existingSubscription;
            }

            // Create new subscription
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
            });

            console.log('✅ Push Notifications: Subscribed successfully');

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('❌ Push Notifications: Subscription failed', error);
            return null;
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe(): Promise<boolean> {
        if (!this.isSupported || !this.registration) {
            return false;
        }

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('✅ Push Notifications: Unsubscribed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Push Notifications: Unsubscribe failed', error);
            return false;
        }
    }

    // Send subscription to server
    private async sendSubscriptionToServer(subscription: PushSubscription) {
        try {
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: 'default-user' // Replace with actual user ID
                })
            });

            if (response.ok) {
                console.log('✅ Push Notifications: Subscription sent to server');
            } else {
                console.error('❌ Push Notifications: Failed to send subscription to server');
            }
        } catch (error) {
            console.error('❌ Push Notifications: Error sending subscription to server', error);
        }
    }

    // Show local notification
    async showLocalNotification(title: string, options: NotificationOptions = {}) {
        if (!this.isSupported || !this.registration) {
            console.log('❌ Push Notifications: Cannot show local notification');
            return;
        }

        try {
            await this.registration.showNotification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                ...options
            });
            console.log('✅ Push Notifications: Local notification shown');
        } catch (error) {
            console.error('❌ Push Notifications: Failed to show local notification', error);
        }
    }

    // Test notification
    async testNotification() {
        await this.showLocalNotification('Test Notification', {
            body: 'This is a test notification from your Personal Assistant!',
            tag: 'test-notification'
        });
    }

    // Convert VAPID key
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Get subscription status
    async getSubscriptionStatus() {
        if (!this.isSupported) {
            return { supported: false, subscribed: false };
        }

        try {
            this.registration = await navigator.serviceWorker.ready;
            const subscription = await this.registration.pushManager.getSubscription();

            return {
                supported: true,
                subscribed: !!subscription,
                permission: Notification.permission
            };
        } catch (error) {
            console.error('❌ Push Notifications: Error getting subscription status', error);
            return { supported: false, subscribed: false };
        }
    }

    // Setup notification click handlers
    setupNotificationHandlers() {
        if (!this.isSupported) return;

        // Handle notification clicks
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
                console.log('📱 Push Notifications: Notification clicked');
                // Handle notification click (e.g., navigate to specific page)
                this.handleNotificationClick(event.data);
            }
        });
    }

    // Handle notification click
    private handleNotificationClick(data: any) {
        // Navigate to specific page based on notification type
        if (data.action === 'morning_routine') {
            window.location.href = '/morning-routine';
        } else if (data.action === 'habits') {
            window.location.href = '/habits';
        } else if (data.action === 'chat') {
            window.location.href = '/chat';
        } else {
            window.location.href = '/';
        }
    }
}

// Initialize push notification manager
export const pushNotificationManager = new PushNotificationManager();
