// Settings page JavaScript for Personal Assistant Chrome Extension

class SettingsManager {
    constructor() {
        this.settings = {
            blockingMode: 'strict',
            trackingEnabled: true,
            emergencyUnlockEnabled: true
        };
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            await this.loadStats();
            this.setupEventListeners();
            this.showContent();
        } catch (error) {
            console.error('Error initializing settings:', error);
            this.showError('Failed to load settings');
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get([
                'blockingMode',
                'isTracking',
                'emergencyUnlockEnabled'
            ]);

            this.settings.blockingMode = result.blockingMode || 'strict';
            this.settings.trackingEnabled = result.isTracking !== false;
            this.settings.emergencyUnlockEnabled = result.emergencyUnlockEnabled !== false;

            // Update UI
            document.getElementById('blockingMode').value = this.settings.blockingMode;
            this.updateToggle('trackingToggle', this.settings.trackingEnabled);
            this.updateToggle('emergencyUnlockToggle', this.settings.emergencyUnlockEnabled);

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadStats() {
        try {
            // Get stats from background script
            const response = await chrome.runtime.sendMessage({ action: 'getStats' });

            if (response && response.blocklistStats) {
                const stats = response.blocklistStats;
                document.getElementById('totalBlocked').textContent = stats.totalBlocked || 0;
                document.getElementById('totalUnlocks').textContent = stats.temporaryWhitelist?.length || 0;
                document.getElementById('streakDays').textContent = '0'; // Will be updated from backend
                document.getElementById('blocklistSize').textContent = stats.totalBlocked || 0;
            }

            // Load blocklist info
            await this.loadBlocklistInfo();

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadBlocklistInfo() {
        try {
            const response = await fetch(chrome.runtime.getURL('blocklists/adult-sites.json'));
            const blocklist = await response.json();

            document.getElementById('lastUpdated').textContent =
                new Date(blocklist.lastUpdated).toLocaleDateString();
            document.getElementById('totalDomains').textContent =
                blocklist.total?.toLocaleString() || '0';

            const categories = Object.keys(blocklist.categories || {});
            document.getElementById('categories').textContent =
                categories.join(', ') || 'None';

        } catch (error) {
            console.error('Error loading blocklist info:', error);
            document.getElementById('lastUpdated').textContent = 'Unknown';
            document.getElementById('totalDomains').textContent = 'Unknown';
            document.getElementById('categories').textContent = 'Unknown';
        }
    }

    setupEventListeners() {
        // Blocking mode change
        document.getElementById('blockingMode').addEventListener('change', (e) => {
            this.updateSetting('blockingMode', e.target.value);
        });

        // Toggle switches
        document.getElementById('trackingToggle').addEventListener('click', () => {
            this.toggleSetting('trackingEnabled', 'trackingToggle');
        });

        document.getElementById('emergencyUnlockToggle').addEventListener('click', () => {
            this.toggleSetting('emergencyUnlockEnabled', 'emergencyUnlockToggle');
        });

        // Action buttons
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncData();
        });

        document.getElementById('reloadBlocklistBtn').addEventListener('click', () => {
            this.reloadBlocklist();
        });

        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        document.getElementById('resetStatsBtn').addEventListener('click', () => {
            this.resetStats();
        });
    }

    async updateSetting(key, value) {
        try {
            this.settings[key] = value;
            await chrome.storage.local.set({ [key]: value });
            this.showSuccess(`Setting updated: ${key}`);
        } catch (error) {
            console.error('Error updating setting:', error);
            this.showError('Failed to update setting');
        }
    }

    async toggleSetting(key, toggleId) {
        try {
            this.settings[key] = !this.settings[key];
            this.updateToggle(toggleId, this.settings[key]);

            const storageKey = key === 'trackingEnabled' ? 'isTracking' : key;
            await chrome.storage.local.set({ [storageKey]: this.settings[key] });

            this.showSuccess(`Setting updated: ${key}`);
        } catch (error) {
            console.error('Error toggling setting:', error);
            this.showError('Failed to update setting');
        }
    }

    updateToggle(toggleId, isActive) {
        const toggle = document.getElementById(toggleId);
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }

    async syncData() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'syncNow' });
            if (response && response.success) {
                this.showSuccess('Data synced successfully');
                await this.loadStats();
            } else {
                this.showError('Failed to sync data');
            }
        } catch (error) {
            console.error('Error syncing data:', error);
            this.showError('Failed to sync data');
        }
    }

    async reloadBlocklist() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'reloadBlocklist' });
            if (response && response.success) {
                this.showSuccess('Blocklist reloaded successfully');
                await this.loadBlocklistInfo();
            } else {
                this.showError('Failed to reload blocklist');
            }
        } catch (error) {
            console.error('Error reloading blocklist:', error);
            this.showError('Failed to reload blocklist');
        }
    }

    async exportReport() {
        try {
            // Get user ID from background script
            const response = await chrome.runtime.sendMessage({ action: 'getStats' });
            const userId = response?.userId || 'unknown';

            // Generate report URL
            const reportUrl = `https://personal-assistant-backend-production.up.railway.app/api/blocked-site/${userId}/report?format=csv&days=30`;

            // Open report in new tab
            chrome.tabs.create({ url: reportUrl });

            this.showSuccess('Report export started');
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showError('Failed to export report');
        }
    }

    async resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            try {
                await chrome.storage.local.clear();
                this.showSuccess('Statistics reset successfully');
                await this.loadSettings();
                await this.loadStats();
            } catch (error) {
                console.error('Error resetting stats:', error);
                this.showError('Failed to reset statistics');
            }
        }
    }

    showContent() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('settings-content').style.display = 'block';
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success, .error');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;

        // Insert at top of content
        const content = document.getElementById('settings-content');
        content.insertBefore(messageDiv, content.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize settings manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
