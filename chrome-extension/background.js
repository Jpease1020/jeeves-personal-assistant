// Simplified background script for Personal Assistant Chrome Extension

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://personal-assistant-backend-production.up.railway.app',
    USER_ID: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4',
    SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    TRACKING_INTERVAL: 1000, // 1 second
};

// Basic blocking data
let BLOCKED_DOMAINS = new Set();
let MODERATE_DOMAINS = new Set();
let TEMPORARY_WHITELIST = new Set();

// Social media time limits (in minutes)
const SOCIAL_MEDIA_LIMITS = {
    'facebook.com': 15,
    'instagram.com': 20,
    'twitter.com': 10,
    'youtube.com': 30,
    'tiktok.com': 10,
    'reddit.com': 20
};

// Track social media time
let socialMediaTime = {};

// Initialize
chrome.runtime.onInstalled.addListener(() => {
    console.log('Personal Assistant extension installed');
    loadBlocklist();
    resetDailySocialMediaLimits();
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Personal Assistant extension started');
    loadBlocklist();
    resetDailySocialMediaLimits();
});

// Load blocklist
async function loadBlocklist() {
    try {
        const response = await fetch(chrome.runtime.getURL('rules.json'));
        const data = await response.json();
        
        BLOCKED_DOMAINS.clear();
        MODERATE_DOMAINS.clear();
        
        // Load blocked domains
        if (data.blocked) {
            data.blocked.forEach(domain => BLOCKED_DOMAINS.add(domain));
        }
        
        // Load moderate domains
        if (data.moderate) {
            data.moderate.forEach(domain => MODERATE_DOMAINS.add(domain));
        }
        
        console.log(`Loaded ${BLOCKED_DOMAINS.size} blocked domains and ${MODERATE_DOMAINS.size} moderate domains`);
    } catch (error) {
        console.error('Error loading blocklist:', error);
    }
}

// Check if site should be blocked
function shouldBlockSite(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        
        // Check temporary whitelist first
        if (TEMPORARY_WHITELIST.has(hostname)) {
            return false;
        }
        
        // Check blocked domains
        if (BLOCKED_DOMAINS.has(hostname)) {
            return { blocked: true, reason: 'Blocked domain', type: 'blocked' };
        }
        
        // Check moderate domains
        if (MODERATE_DOMAINS.has(hostname)) {
            return { blocked: true, reason: 'Moderate content', type: 'moderate' };
        }
        
        return false;
    } catch (error) {
        console.error('Error checking site:', error);
        return false;
    }
}

// Block site
function blockSite(url, blockType = 'blocked', details = '') {
    const blockedUrl = chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(url)}&type=${blockType}&details=${encodeURIComponent(details)}`);
    chrome.tabs.update({ url: blockedUrl });
}

// Handle tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const blockResult = shouldBlockSite(tab.url);
        if (blockResult) {
            blockSite(tab.url, blockResult.type, blockResult.reason);
        }
    }
});

// Handle navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
        const blockResult = shouldBlockSite(details.url);
        if (blockResult) {
            blockSite(details.url, blockResult.type, blockResult.reason);
        }
    }
});

// Social media time tracking
function trackSocialMediaTime(url) {
    const hostname = new URL(url).hostname.toLowerCase();
    if (SOCIAL_MEDIA_LIMITS[hostname]) {
        const now = Date.now();
        if (!socialMediaTime[hostname]) {
            socialMediaTime[hostname] = { startTime: now, totalTime: 0 };
        }
        
        const timeSpent = now - socialMediaTime[hostname].startTime;
        socialMediaTime[hostname].totalTime += timeSpent;
        socialMediaTime[hostname].startTime = now;
        
        // Check if limit exceeded
        const limitMs = SOCIAL_MEDIA_LIMITS[hostname] * 60 * 1000;
        if (socialMediaTime[hostname].totalTime > limitMs) {
            blockSite(url, 'timeLimit', `Daily limit of ${SOCIAL_MEDIA_LIMITS[hostname]} minutes exceeded`);
        }
    }
}

// Reset daily limits
function resetDailySocialMediaLimits() {
    socialMediaTime = {};
    chrome.alarms.create('dailyReset', { when: getNextMidnight() });
}

function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
}

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyReset') {
        resetDailySocialMediaLimits();
    }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getStats':
            const stats = {
                blockedToday: 0, // This would need to be tracked
                protectedSites: BLOCKED_DOMAINS.size + MODERATE_DOMAINS.size,
                emergencyUnlocks: 0, // This would need to be tracked
                socialMediaTime: socialMediaTime
            };
            sendResponse(stats);
            break;
            
        case 'toggleTracking':
            // Toggle tracking state
            sendResponse({ success: true });
            break;
            
        case 'temporaryUnlock':
            const { domain, reason } = request;
            TEMPORARY_WHITELIST.add(domain);
            // Remove from whitelist after 1 hour
            setTimeout(() => {
                TEMPORARY_WHITELIST.delete(domain);
            }, 60 * 60 * 1000);
            sendResponse({ success: true });
            break;
            
        case 'reloadBlocklist':
            loadBlocklist();
            sendResponse({ success: true });
            break;
    }
    
    return true; // Keep message channel open for async response
});

// Track active tab time
let activeTabId = null;
let tabStartTime = Date.now();

chrome.tabs.onActivated.addListener((activeInfo) => {
    if (activeTabId) {
        const timeSpent = Date.now() - tabStartTime;
        // Track time for previous tab
    }
    
    activeTabId = activeInfo.tabId;
    tabStartTime = Date.now();
});

// Track tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.status === 'complete' && tab.url) {
        trackSocialMediaTime(tab.url);
    }
});
