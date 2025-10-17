// Background service worker for Personal Assistant Chrome Extension

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:4001',
    USER_ID: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4',
    SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    TRACKING_INTERVAL: 1000, // 1 second
};

// Distracting websites to track
const DISTRACTING_SITES = [
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'tiktok.com',
    'youtube.com',
    'reddit.com',
    'netflix.com',
    'hulu.com',
    'disneyplus.com'
];

// Adult sites to block
const ADULT_SITES = [
    'pornhub.com',
    'xvideos.com',
    'xnxx.com',
    'redtube.com',
    'youporn.com',
    'tube8.com',
    'beeg.com',
    'xhamster.com',
    'xtube.com',
    'chaturbate.com',
    'livejasmin.com',
    'myfreecams.com'
];

// Global state
let currentTab = null;
let startTime = null;
let isTracking = true;
let dailyStats = {};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Personal Assistant extension installed');

    // Load existing data
    const result = await chrome.storage.local.get(['dailyStats', 'isTracking']);
    dailyStats = result.dailyStats || {};
    isTracking = result.isTracking !== false;

    // Set up tracking alarm
    chrome.alarms.create('tracking', { periodInMinutes: 1 });

    // Set up sync alarm
    chrome.alarms.create('sync', { periodInMinutes: 5 });

    // Update blocked sites rules
    await updateBlockedSitesRules();
});

// Handle tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await handleTabChange(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        await handleTabChange(tabId);
    }
});

// Handle tab change
async function handleTabChange(tabId) {
    try {
        // Stop tracking previous tab
        if (currentTab && startTime) {
            await recordTimeSpent(currentTab, Date.now() - startTime);
        }

        // Get new tab info
        const tab = await chrome.tabs.get(tabId);
        currentTab = tab;
        startTime = Date.now();

        // Check if site should be blocked
        if (isTracking && shouldBlockSite(tab.url)) {
            await blockSite(tabId, tab.url);
        }

    } catch (error) {
        console.error('Error handling tab change:', error);
    }
}

// Check if site should be blocked
function shouldBlockSite(url) {
    if (!url) return false;

    try {
        const domain = new URL(url).hostname.toLowerCase();
        return ADULT_SITES.some(site => domain.includes(site));
    } catch {
        return false;
    }
}

// Block a site
async function blockSite(tabId, url) {
    try {
        const domain = new URL(url).hostname;

        // Redirect to blocked page
        await chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(domain)
        });

        // Log the block attempt
        console.log(`Blocked access to: ${domain}`);

        // Send notification to backend
        await sendBlockEvent(domain);

    } catch (error) {
        console.error('Error blocking site:', error);
    }
}

// Record time spent on a site
async function recordTimeSpent(tab, timeSpent) {
    if (!tab.url || timeSpent < 1000) return; // Ignore very short visits

    try {
        const domain = new URL(tab.url).hostname.toLowerCase();
        const today = new Date().toISOString().split('T')[0];

        // Initialize daily stats if needed
        if (!dailyStats[today]) {
            dailyStats[today] = {
                totalTime: 0,
                sites: {},
                distractingTime: 0,
                productiveTime: 0
            };
        }

        // Update stats
        dailyStats[today].totalTime += timeSpent;

        if (!dailyStats[today].sites[domain]) {
            dailyStats[today].sites[domain] = 0;
        }
        dailyStats[today].sites[domain] += timeSpent;

        // Categorize time
        if (DISTRACTING_SITES.some(site => domain.includes(site))) {
            dailyStats[today].distractingTime += timeSpent;
        } else {
            dailyStats[today].productiveTime += timeSpent;
        }

        // Save to storage
        await chrome.storage.local.set({ dailyStats });

        console.log(`Recorded ${Math.round(timeSpent / 1000)}s on ${domain}`);

    } catch (error) {
        console.error('Error recording time:', error);
    }
}

// Update blocked sites rules
async function updateBlockedSitesRules() {
    try {
        const rules = ADULT_SITES.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: {
                    url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(site)
                }
            },
            condition: {
                urlFilter: `*://${site}/*`,
                resourceTypes: ["main_frame"]
            }
        }));

        // Clear existing rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);

        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }

        // Add new rules
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules
        });

        console.log(`Updated ${rules.length} blocking rules`);

    } catch (error) {
        console.error('Error updating blocking rules:', error);
    }
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'tracking') {
        // Update current tab time
        if (currentTab && startTime) {
            await recordTimeSpent(currentTab, Date.now() - startTime);
            startTime = Date.now(); // Reset timer
        }
    } else if (alarm.name === 'sync') {
        await syncDataToBackend();
    }
});

// Sync data to backend
async function syncDataToBackend() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = dailyStats[today];

        if (!todayStats) return;

        const payload = {
            userId: CONFIG.USER_ID,
            date: today,
            totalScreenTime: Math.round(todayStats.totalTime / 1000 / 60), // Convert to minutes
            appUsage: Object.entries(todayStats.sites).map(([site, time]) => ({
                appName: site,
                category: DISTRACTING_SITES.some(s => site.includes(s)) ? 'Distraction' : 'Productive',
                timeSpent: Math.round(time / 1000 / 60), // Convert to minutes
                pickups: 1 // Simplified for now
            })),
            distractionPatterns: Object.entries(todayStats.sites)
                .filter(([site, time]) => DISTRACTING_SITES.some(s => site.includes(s)))
                .map(([site, time]) => ({
                    timeRange: 'All Day',
                    appName: site,
                    duration: Math.round(time / 1000 / 60),
                    distractionLevel: 'high'
                })),
            focusScore: calculateFocusScore(todayStats),
            breakReminders: 0
        };

        const response = await fetch(`${CONFIG.API_BASE_URL}/api/screen-time`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Data synced to backend successfully');
        } else {
            console.error('Failed to sync data to backend');
        }

    } catch (error) {
        console.error('Error syncing data:', error);
    }
}

// Calculate focus score
function calculateFocusScore(stats) {
    if (stats.totalTime === 0) return 100;

    const productiveRatio = stats.productiveTime / stats.totalTime;
    return Math.round(productiveRatio * 100);
}

// Send block event to backend
async function sendBlockEvent(domain) {
    try {
        await fetch(`${CONFIG.API_BASE_URL}/api/blocked-site`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: CONFIG.USER_ID,
                domain,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error sending block event:', error);
    }
}

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getStats':
            sendResponse({
                dailyStats,
                isTracking,
                currentTab: currentTab?.url
            });
            break;

        case 'toggleTracking':
            isTracking = request.enabled;
            chrome.storage.local.set({ isTracking });
            sendResponse({ success: true });
            break;

        case 'syncNow':
            syncDataToBackend().then(() => {
                sendResponse({ success: true });
            });
            return true; // Keep message channel open for async response

        case 'getCurrentTab':
            sendResponse({
                url: currentTab?.url,
                timeSpent: currentTab && startTime ? Date.now() - startTime : 0
            });
            break;
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('Personal Assistant extension started');
    await updateBlockedSitesRules();
});
