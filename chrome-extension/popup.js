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

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
});

// Load data from background script
async function loadData() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getStats' });
        currentStats = response.dailyStats;
        isTracking = response.isTracking;

        updateUI();
        hideLoading();

    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
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

// Hide loading state
function hideLoading() {
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
}

// Update tracking toggle state
trackingToggle.classList.toggle('active', isTracking);
