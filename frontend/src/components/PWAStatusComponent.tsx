// PWA Integration Component
import React, { useEffect, useState } from 'react';
import { pwaManager } from '../utils/pwa-manager';
import { pushNotificationManager } from '../utils/push-notifications';
import { offlineStorage } from '../utils/offline-storage';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  canInstall: boolean;
  notificationPermission: string;
  isSubscribed: boolean;
  offlineDataCount: number;
}

export const PWAStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    hasServiceWorker: false,
    canInstall: false,
    notificationPermission: 'default',
    isSubscribed: false,
    offlineDataCount: 0
  });

  useEffect(() => {
    updateStatus();
    setupEventListeners();
  }, []);

  const updateStatus = async () => {
    const appInfo = pwaManager.getAppInfo();
    const notificationStatus = await pushNotificationManager.getSubscriptionStatus();
    const storageUsage = await offlineStorage.getStorageUsage();

    setStatus({
      isInstalled: appInfo.isInstalled,
      isOnline: appInfo.isOnline,
      hasServiceWorker: appInfo.hasServiceWorker,
      canInstall: appInfo.canInstall,
      notificationPermission: notificationStatus.permission || 'default',
      isSubscribed: notificationStatus.subscribed,
      offlineDataCount: storageUsage.habits + storageUsage.routines + storageUsage.actions
    });
  };

  const setupEventListeners = () => {
    // Listen for online/offline changes
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Listen for app installation
    window.addEventListener('appinstalled', updateStatus);
  };

  const handleInstall = async () => {
    await pwaManager.installApp();
    updateStatus();
  };

  const handleSubscribe = async () => {
    const permission = await pushNotificationManager.requestPermission();
    if (permission) {
      await pushNotificationManager.subscribe();
      updateStatus();
    }
  };

  const handleTestNotification = async () => {
    await pushNotificationManager.testNotification();
  };

  const handleSyncOfflineData = async () => {
    if (status.isOnline) {
      // Trigger background sync
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('habit-sync');
      await (registration as any).sync.register('routine-sync');

      // Update status after sync
      setTimeout(updateStatus, 2000);
    }
  };

  return (
    <div className="pwa-status-component">
      <h3>📱 PWA Status</h3>

      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">App Installed:</span>
          <span className={`status-value ${status.isInstalled ? 'success' : 'warning'}`}>
            {status.isInstalled ? '✅ Yes' : '❌ No'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Online Status:</span>
          <span className={`status-value ${status.isOnline ? 'success' : 'error'}`}>
            {status.isOnline ? '🌐 Online' : '🌐 Offline'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Service Worker:</span>
          <span className={`status-value ${status.hasServiceWorker ? 'success' : 'error'}`}>
            {status.hasServiceWorker ? '✅ Active' : '❌ Inactive'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Notifications:</span>
          <span className={`status-value ${status.isSubscribed ? 'success' : 'warning'}`}>
            {status.isSubscribed ? '🔔 Enabled' : '🔕 Disabled'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Offline Data:</span>
          <span className="status-value">
            📦 {status.offlineDataCount} items
          </span>
        </div>
      </div>

      <div className="pwa-actions">
        {status.canInstall && !status.isInstalled && (
          <button
            className="pwa-action-btn install-btn"
            onClick={handleInstall}
          >
            📱 Install App
          </button>
        )}

        {!status.isSubscribed && (
          <button
            className="pwa-action-btn subscribe-btn"
            onClick={handleSubscribe}
          >
            🔔 Enable Notifications
          </button>
        )}

        {status.isSubscribed && (
          <button
            className="pwa-action-btn test-btn"
            onClick={handleTestNotification}
          >
            🧪 Test Notification
          </button>
        )}

        {status.offlineDataCount > 0 && status.isOnline && (
          <button
            className="pwa-action-btn sync-btn"
            onClick={handleSyncOfflineData}
          >
            🔄 Sync Offline Data
          </button>
        )}
      </div>

      <style>{`
        .pwa-status-component {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #333;
        }

        .pwa-status-component h3 {
          margin: 0 0 16px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #2a2a2a;
          border-radius: 8px;
        }

        .status-label {
          color: #ccc;
          font-size: 14px;
        }

        .status-value {
          font-size: 14px;
          font-weight: 500;
        }

        .status-value.success {
          color: #10b981;
        }

        .status-value.warning {
          color: #f59e0b;
        }

        .status-value.error {
          color: #ef4444;
        }

        .pwa-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pwa-action-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-action-btn:hover {
          background: #5856eb;
          transform: translateY(-1px);
        }

        .pwa-action-btn:active {
          transform: translateY(0);
        }

        .install-btn {
          background: #10b981;
        }

        .install-btn:hover {
          background: #059669;
        }

        .subscribe-btn {
          background: #f59e0b;
        }

        .subscribe-btn:hover {
          background: #d97706;
        }

        .test-btn {
          background: #8b5cf6;
        }

        .test-btn:hover {
          background: #7c3aed;
        }

        .sync-btn {
          background: #06b6d4;
        }

        .sync-btn:hover {
          background: #0891b2;
        }
      `}</style>
    </div>
  );
};
