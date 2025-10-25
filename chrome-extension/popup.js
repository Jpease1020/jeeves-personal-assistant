// Popup script for Personal Assistant Chrome Extension

let currentStats = null;
let isTracking = true;

// DOM elements
const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('content');
const trackingToggle = document.getElementById('trackingToggle');
const syncBtn = document.getElementById('syncBtn');
const settingsBtn = document.getElementById('settingsBtn');
const totalTimeEl = document.getElementById('totalTime');
const productiveTimeEl = document.getElementById('productiveTime');
const distractingTimeEl = document.getElementById('distractingTime');
const focusScoreEl = document.getElementById('focusScore');
const siteListEl = document.getElementById('siteList');
const currentTabEl = document.getElementById('currentTab');
const blockedTodayEl = document.getElementById('blockedToday');
const protectedSitesEl = document.getElementById('protectedSites');
const emergencyUnlocksEl = document.getElementById('emergencyUnlocks');
const facebookTimeEl = document.getElementById('facebookTime');
const instagramTimeEl = document.getElementById('instagramTime');
const twitterTimeEl = document.getElementById('twitterTime');
const youtubeTimeEl = document.getElementById('youtubeTime');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
});

// Load data from background script
async function loadData() {
    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const responsePromise = chrome.runtime.sendMessage({ action: 'getStats' });
        const response = await Promise.race([responsePromise, timeoutPromise]);

        if (!response) {
            throw new Error('No response from background script');
        }

        currentStats = response.dailyStats;
        isTracking = response.isTracking;

        // Update blocking stats
        if (response.blocklistStats) {
            const stats = response.blocklistStats;
            blockedTodayEl.textContent = stats.totalBlocked || 0;
            protectedSitesEl.textContent = stats.totalBlocked || 0;
            emergencyUnlocksEl.textContent = stats.temporaryWhitelist?.length || 0;
        }

        // Update social media time limits
        if (response.socialMediaTime) {
            const socialTime = response.socialMediaTime;
            facebookTimeEl.textContent = `${Math.round(socialTime['facebook.com'] || 0)}/15m`;
            instagramTimeEl.textContent = `${Math.round(socialTime['instagram.com'] || 0)}/20m`;
            twitterTimeEl.textContent = `${Math.round(socialTime['twitter.com'] || 0)}/10m`;
            youtubeTimeEl.textContent = `${Math.round(socialTime['youtube.com'] || 0)}/30m`;
        }

        updateUI();
        hideLoading();

    } catch (error) {
        console.error('Error loading data:', error);

        // Show specific error messages based on error type
        if (error.message === 'Request timeout') {
            showError('Extension is taking too long to respond. Try refreshing the extension.');
        } else if (error.message === 'No response from background script') {
            showError('Background script not responding. Check if extension is enabled.');
        } else if (error.message.includes('Extension context invalidated')) {
            showError('Extension needs to be reloaded. Please refresh the extension.');
        } else {
            showError(`Failed to load data: ${error.message}`);
        }

        // Show basic UI even with errors
        showBasicUI();
    }
}

// Setup event listeners
function setupEventListeners() {
    trackingToggle.addEventListener('click', toggleTracking);
    syncBtn.addEventListener('click', syncData);
    settingsBtn.addEventListener('click', openSettings);
}

// Toggle tracking
async function toggleTracking() {
    try {
        isTracking = !isTracking;
        trackingToggle.classList.toggle('active', isTracking);

        await chrome.runtime.sendMessage({
            action: 'toggleTracking',
            enabled: isTracking
        });

        // Show feedback
        const status = isTracking ? 'enabled' : 'disabled';
        showNotification(`Tracking ${status}`);

    } catch (error) {
        console.error('Error toggling tracking:', error);
        showError('Failed to toggle tracking');
    }
}

// Open settings page
function openSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}

// Sync data to backend
async function syncData() {
    try {
        syncBtn.textContent = 'Syncing...';
        syncBtn.disabled = true;

        await chrome.runtime.sendMessage({ action: 'syncNow' });

        showNotification('Data synced successfully!');

        // Reload data
        await loadData();

    } catch (error) {
        console.error('Error syncing data:', error);
        showError('Failed to sync data');
    } finally {
        syncBtn.textContent = 'Sync Now';
        syncBtn.disabled = false;
    }
}

// Open settings (placeholder)
function openSettings() {
    showNotification('Settings coming soon!');
}

// Update UI with current data
function updateUI() {
    if (!currentStats) return;

    const today = new Date().toISOString().split('T')[0];
    const todayStats = currentStats[today];

    if (!todayStats) {
        showNoData();
        return;
    }

    // Update time displays
    totalTimeEl.textContent = formatTime(todayStats.totalTime);
    productiveTimeEl.textContent = formatTime(todayStats.productiveTime);
    distractingTimeEl.textContent = formatTime(todayStats.distractingTime);

    // Update focus score
    const focusScore = calculateFocusScore(todayStats);
    focusScoreEl.textContent = `${focusScore}%`;
    focusScoreEl.className = `focus-score ${getFocusClass(focusScore)}`;

    // Update site list
    updateSiteList(todayStats.sites);

    // Update current tab
    updateCurrentTab();
}

// Show no data state
function showNoData() {
    totalTimeEl.textContent = '0h 0m';
    productiveTimeEl.textContent = '0h 0m';
    distractingTimeEl.textContent = '0h 0m';
    focusScoreEl.textContent = '100%';
    focusScoreEl.className = 'focus-score focus-good';

    siteListEl.innerHTML = `
    <div style="text-align: center; color: #6c757d; padding: 20px;">
      No data yet today
    </div>
  `;
}

// Update site list
function updateSiteList(sites) {
    if (!sites || Object.keys(sites).length === 0) {
        siteListEl.innerHTML = `
      <div style="text-align: center; color: #6c757d; padding: 20px;">
        No sites visited yet
      </div>
    `;
        return;
    }

    const sortedSites = Object.entries(sites)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Top 10 sites

    siteListEl.innerHTML = sortedSites.map(([site, time]) => `
    <div class="site-item">
      <span class="site-name">${site}</span>
      <span class="site-time">${formatTime(time)}</span>
    </div>
  `).join('');
}

// Update current tab display
async function updateCurrentTab() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getCurrentTab' });

        if (response.url) {
            const domain = new URL(response.url).hostname;
            const timeSpent = Math.round(response.timeSpent / 1000);

            currentTabEl.innerHTML = `
        <div style="margin-bottom: 4px;">
          <strong>${domain}</strong>
        </div>
        <div style="color: #6c757d;">
          ${timeSpent}s on this tab
        </div>
      `;
        } else {
            currentTabEl.textContent = 'No active tab';
        }
    } catch (error) {
        currentTabEl.textContent = 'Error loading tab info';
    }
}

// Calculate focus score
function calculateFocusScore(stats) {
    if (stats.totalTime === 0) return 100;

    const productiveRatio = stats.productiveTime / stats.totalTime;
    return Math.round(productiveRatio * 100);
}

// Get focus score CSS class
function getFocusClass(score) {
    if (score >= 70) return 'focus-good';
    if (score >= 50) return 'focus-warning';
    return 'focus-danger';
}

// Format time in milliseconds to readable format
function formatTime(milliseconds) {
    const totalSeconds = Math.round(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Show notification
function showNotification(message) {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Show error message
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;

    contentEl.insertBefore(errorEl, contentEl.firstChild);

    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

// Show basic UI when there are errors
function showBasicUI() {
    hideLoading();

    // Show basic stats with default values
    totalTimeEl.textContent = '0h 0m';
    productiveTimeEl.textContent = '0h 0m';
    distractingTimeEl.textContent = '0h 0m';
    focusScoreEl.textContent = '100%';
    focusScoreEl.className = 'focus-score focus-good';

    // Show basic blocking stats
    blockedTodayEl.textContent = '0';
    protectedSitesEl.textContent = '0';
    emergencyUnlocksEl.textContent = '0';

    // Show basic social media stats
    facebookTimeEl.textContent = '0/15m';
    instagramTimeEl.textContent = '0/20m';
    twitterTimeEl.textContent = '0/10m';
    youtubeTimeEl.textContent = '0/30m';

    // Show error message in site list
    siteListEl.innerHTML = `
        <div style="text-align: center; color: #dc3545; padding: 20px;">
            <div style="margin-bottom: 10px;">⚠️ Extension Error</div>
            <div style="font-size: 12px; color: #6c757d;">
                Unable to load data from background script
            </div>
        </div>
    `;

    // Show error in current tab
    currentTabEl.innerHTML = `
        <div style="color: #dc3545; text-align: center;">
            Error loading tab info
        </div>
    `;
}

// Hide loading state
function hideLoading() {
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
}

// Update tracking toggle state
trackingToggle.classList.toggle('active', isTracking);
