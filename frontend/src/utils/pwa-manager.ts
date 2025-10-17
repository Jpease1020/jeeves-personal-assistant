// PWA Installation and Management
export class PWAManager {
    private deferredPrompt: any = null;
    private isInstalled = false;

    constructor() {
        this.setupInstallPrompt();
        this.setupServiceWorker();
        this.setupOfflineDetection();
    }

    // Handle install prompt
    private setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA: Install prompt available');

            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            // Stash the event so it can be triggered later
            this.deferredPrompt = e;

            // Show install button
            this.showInstallButton();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.deferredPrompt = null;

            // Show success message
            this.showInstallSuccess();
        });
    }

    // Register service worker
    private async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ PWA: Service Worker registered', registration);

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available, show update prompt
                                this.showUpdatePrompt();
                            }
                        });
                    }
                });

            } catch (error) {
                console.error('❌ PWA: Service Worker registration failed', error);
            }
        }
    }

    // Detect offline/online status
    private setupOfflineDetection() {
        window.addEventListener('online', () => {
            console.log('🌐 PWA: Back online');
            this.showOnlineStatus();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            console.log('🌐 PWA: Gone offline');
            this.showOfflineStatus();
        });
    }

    // Show install button
    private showInstallButton() {
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-btn';
        installButton.innerHTML = '📱 Install App';
        installButton.className = 'pwa-install-button';

        // Style the button
        installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `;

        installButton.addEventListener('click', () => this.installApp());
        document.body.appendChild(installButton);
    }

    // Hide install button
    private hideInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.remove();
        }
    }

    // Install the app
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('❌ PWA: No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ PWA: User accepted install prompt');
            } else {
                console.log('❌ PWA: User dismissed install prompt');
            }

            this.deferredPrompt = null;
            this.hideInstallButton();

        } catch (error) {
            console.error('❌ PWA: Install failed', error);
        }
    }

    // Show install success message
    private showInstallSuccess() {
        this.showToast('🎉 App installed successfully!', 'success');
    }

    // Show update prompt
    private showUpdatePrompt() {
        const updateButton = document.createElement('button');
        updateButton.innerHTML = '🔄 Update Available';
        updateButton.className = 'pwa-update-button';

        updateButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
    `;

        updateButton.addEventListener('click', () => {
            window.location.reload();
        });

        document.body.appendChild(updateButton);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            updateButton.remove();
        }, 10000);
    }

    // Show online status
    private showOnlineStatus() {
        this.showToast('🌐 Back online - syncing data...', 'info');
    }

    // Show offline status
    private showOfflineStatus() {
        this.showToast('🌐 You\'re offline - some features limited', 'warning');
    }

    // Show toast notification
    private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
        const toast = document.createElement('div');
        toast.className = `pwa-toast pwa-toast-${type}`;
        toast.textContent = message;

        toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    `;

        document.body.appendChild(toast);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Get toast color based on type
    private getToastColor(type: string): string {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        return colors[type] || colors.info;
    }

    // Sync offline data when back online
    private async syncOfflineData() {
        try {
            console.log('🔄 PWA: Syncing offline data...');

            // Trigger background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('habit-sync');
                await registration.sync.register('routine-sync');
            }

        } catch (error) {
            console.error('❌ PWA: Offline sync failed', error);
        }
    }

    // Check if app is installed
    isAppInstalled(): boolean {
        return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
    }

    // Get app info
    getAppInfo() {
        return {
            isInstalled: this.isAppInstalled(),
            isOnline: navigator.onLine,
            hasServiceWorker: 'serviceWorker' in navigator,
            canInstall: !!this.deferredPrompt
        };
    }
}

// Initialize PWA manager
export const pwaManager = new PWAManager();
