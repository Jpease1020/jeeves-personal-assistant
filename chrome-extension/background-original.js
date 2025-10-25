// Import search monitoring, Reddit login detection, and advanced analyzers
importScripts('search-monitor.js');
importScripts('reddit-login-detector.js');
importScripts('text-analyzer.js');
importScripts('behavioral-detector.js');
importScripts('image-analyzer.js');
importScripts('accountability-manager.js');

// Background service worker for Personal Assistant Chrome Extension

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://personal-assistant-backend-production.up.railway.app', // Production backend
    USER_ID: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4',
    SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    TRACKING_INTERVAL: 1000, // 1 second
    // Reddit blocking options
    BLOCK_REDDIT_INCOGNITO: true,    // Block Reddit entirely in incognito mode
    BLOCK_REDDIT_NOT_LOGGED_IN: true, // Block Reddit when not logged in
    BLOCK_REDDIT_ALWAYS: false,        // Block Reddit completely (nuclear option)
    
    // Advanced blocking features
    ENABLE_TEXT_ANALYSIS: true,        // Enable text content analysis
    ENABLE_IMAGE_ANALYSIS: true,       // Enable image content analysis
    ENABLE_BEHAVIORAL_DETECTION: true, // Enable behavioral pattern detection
    ENABLE_ACCOUNTABILITY: true,       // Enable advanced accountability features
    
    // Analysis thresholds
    TEXT_ANALYSIS_THRESHOLD: 0.3,      // Text analysis blocking threshold
    IMAGE_ANALYSIS_THRESHOLD: 0.7,     // Image analysis blocking threshold
    BEHAVIORAL_RISK_THRESHOLD: 0.6     // Behavioral risk blocking threshold
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

// Social media sites with daily time limits (in minutes)
const SOCIAL_MEDIA_LIMITS = {
    'facebook.com': 30,      // 30 minutes per day
    'instagram.com': 15,    // 15 minutes per day
    'twitter.com': 20,      // 20 minutes per day
    'threads.net': 10,      // 10 minutes per day
    'tiktok.com': 20,       // 20 minutes per day
    'youtube.com': 60,      // 60 minutes per day
    'reddit.com': 30,       // 30 minutes per day
    'snapchat.com': 15,     // 15 minutes per day
    'discord.com': 45,      // 45 minutes per day
    'twitch.tv': 30,        // 30 minutes per day
    'pinterest.com': 20,    // 20 minutes per day
    'linkedin.com': 15      // 15 minutes per day
};

// Smart categorization for complex sites like Reddit
const SMART_SITE_RULES = {
    'reddit.com': {
        // Always block these subreddits (pornographic)
        alwaysBlock: [
            'nsfw', 'gonewild', 'porn', 'hentai', 'rule34', 'realgirls', 'milf',
            'teen', 'barelylegal', 'incest', 'stepmom', 'stepsis', 'family',
            'cuckold', 'hotwife', 'cheating', 'affair', 'betrayal', 'threesome',
            'orgy', 'swinger', 'wife', 'swap', 'bdsm', 'bondage', 'domination',
            'submission', 'fetish', 'leather', 'latex', 'rubber', 'foot',
            'feet', 'spanking', 'whip', 'collar', 'chain', 'rope', 'handcuff',
            'roleplay', 'cosplay', 'uniform', 'nurse', 'teacher', 'student',
            'escort', 'prostitute', 'hooker', 'massage', 'brothel', 'strip',
            'club', 'cam', 'girl', 'webcam', 'show', 'onlyfans', 'leak',
            'sugar', 'daddy', 'mommy', 'adult', 'friend', 'finder'
        ],

        // Block these subreddits during work hours (8 AM - 6 PM)
        workHoursBlock: [
            'funny', 'memes', 'gaming', 'dankmemes', 'wholesomememes',
            'comedy', 'jokes', 'humor', 'meme', 'pewdiepie', 'fortnite',
            'minecraft', 'gta', 'callofduty', 'leagueoflegends', 'dota',
            'csgo', 'valorant', 'overwatch', 'wow', 'destiny', 'apex',
            'amongus', 'fallguys', 'among', 'us', 'fall', 'guys'
        ],

        // Always allow these subreddits (productive/educational)
        alwaysAllow: [
            'programming', 'learnprogramming', 'webdev', 'javascript', 'python',
            'reactjs', 'nodejs', 'typescript', 'css', 'html', 'sql',
            'datascience', 'machinelearning', 'artificial', 'ai', 'science',
            'askscience', 'explainlikeimfive', 'todayilearned', 'youshouldknow',
            'lifeprotips', 'personalfinance', 'investing', 'stocks', 'crypto',
            'bitcoin', 'ethereum', 'entrepreneur', 'startups', 'business',
            'productivity', 'getmotivated', 'getdisciplined', 'selfimprovement',
            'meditation', 'mindfulness', 'fitness', 'nutrition', 'health',
            'mentalhealth', 'depression', 'anxiety', 'therapy', 'counseling',
            'education', 'college', 'university', 'studying', 'homework',
            'math', 'physics', 'chemistry', 'biology', 'history', 'geography',
            'politics', 'worldnews', 'news', 'technology', 'gadgets',
            'apple', 'android', 'windows', 'linux', 'macos', 'ubuntu'
        ],

        // Time limits for different categories
        timeLimits: {
            productive: 60,    // 60 minutes for productive subreddits
            distracting: 15,   // 15 minutes for distracting subreddits
            pornographic: 0    // 0 minutes for pornographic subreddits
        }
    },

    'youtube.com': {
        // Block these channels/categories during work hours
        workHoursBlock: [
            'gaming', 'entertainment', 'comedy', 'music', 'sports',
            'reaction', 'prank', 'challenge', 'vlog', 'lifestyle'
        ],

        // Always allow these categories
        alwaysAllow: [
            'education', 'tutorial', 'course', 'lecture', 'documentary',
            'science', 'technology', 'programming', 'business', 'finance',
            'productivity', 'self-improvement', 'health', 'fitness'
        ],

        timeLimits: {
            educational: 90,    // 90 minutes for educational content
            entertaining: 30,  // 30 minutes for entertainment
            distracting: 15     // 15 minutes for distracting content
        }
    }
};

// Daily time tracking for social media
let dailySocialMediaTime = {};
let socialMediaBlocked = new Set();

// Enhanced blocking system - will be loaded from blocklist
let BLOCKLIST_DATA = null;
let BLOCKED_DOMAINS = new Set();
let MODERATE_DOMAINS = new Set();
let TEMPORARY_WHITELIST = new Set();

// Legacy adult sites (fallback)
const LEGACY_ADULT_SITES = [
    'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
    'tube8.com', 'beeg.com', 'xhamster.com', 'xtube.com', 'chaturbate.com',
    'livejasmin.com', 'myfreecams.com'
];

// Global state
let currentTab = null;
let startTime = null;
let isTracking = true;
let dailyStats = {};

// Load blocklist data
async function loadBlocklist() {
    try {
        const response = await fetch(chrome.runtime.getURL('blocklists/adult-sites.json'));
        BLOCKLIST_DATA = await response.json();

        // Build domain sets for fast lookup
        BLOCKED_DOMAINS = new Set(BLOCKLIST_DATA.categories.porn || []);
        MODERATE_DOMAINS = new Set([
            ...(BLOCKLIST_DATA.categories.adult || []),
            ...(BLOCKLIST_DATA.categories.dating || []),
            ...(BLOCKLIST_DATA.categories.gambling || [])
        ]);

        // Add legacy sites as fallback
        LEGACY_ADULT_SITES.forEach(site => BLOCKED_DOMAINS.add(site));

        console.log(`✅ Loaded blocklist: ${BLOCKED_DOMAINS.size} porn sites, ${MODERATE_DOMAINS.size} moderate sites`);

        // Load temporary whitelist from session storage
        const sessionData = await chrome.storage.session.get(['temporaryWhitelist']);
        if (sessionData.temporaryWhitelist) {
            TEMPORARY_WHITELIST = new Set(sessionData.temporaryWhitelist);
        }

    } catch (error) {
        console.error('❌ Failed to load blocklist:', error);
        // Fallback to legacy sites
        BLOCKED_DOMAINS = new Set(LEGACY_ADULT_SITES);
    }
}

// Initialize advanced analyzers
let textAnalyzer, behavioralDetector, imageAnalyzer, accountabilityManager;

// Initialize analyzers on startup
async function initializeAdvancedAnalyzers() {
    try {
        if (CONFIG.ENABLE_TEXT_ANALYSIS) {
            textAnalyzer = new TextContentAnalyzer();
            console.log('Text analyzer initialized');
        }
        
        if (CONFIG.ENABLE_BEHAVIORAL_DETECTION) {
            behavioralDetector = new BehavioralPatternDetector();
            console.log('Behavioral detector initialized');
        }
        
        if (CONFIG.ENABLE_IMAGE_ANALYSIS) {
            imageAnalyzer = new ImageContentAnalyzer();
            console.log('Image analyzer initialized');
        }
        
        if (CONFIG.ENABLE_ACCOUNTABILITY) {
            accountabilityManager = new AccountabilityManager();
            await accountabilityManager.initializeAccountability();
            console.log('Accountability manager initialized');
        }
    } catch (error) {
        console.error('Error initializing advanced analyzers:', error);
    }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Personal Assistant extension installed');

    // Load blocklist first
    await loadBlocklist();

    // Load existing data
    const result = await chrome.storage.local.get(['dailyStats', 'isTracking']);
    dailyStats = result.dailyStats || {};
    isTracking = result.isTracking !== false;

    // Load social media tracking data
    await loadSocialMediaData();

    // Initialize advanced analyzers
    await initializeAdvancedAnalyzers();

    // Set up tracking alarm
    chrome.alarms.create('tracking', { periodInMinutes: 1 });

    // Set up sync alarm
    chrome.alarms.create('sync', { periodInMinutes: 5 });

    // Set up daily reset alarm for social media limits (runs at midnight)
    chrome.alarms.create('dailyReset', { when: getNextMidnight() });

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
            const domain = new URL(tab.url).hostname.toLowerCase();
            const cleanDomain = domain.replace(/^www\./, '');

            // Special handling for Reddit
            if (cleanDomain.includes('reddit.com')) {
                try {
                    const redditBlockResult = await shouldBlockRedditEnhanced(tab.url, cleanDomain, tabId);
                    if (redditBlockResult.blocked) {
                        await blockSite(tabId, tab.url, redditBlockResult.type);
                        return;
                    }
                } catch (error) {
                    console.error('Error in Reddit blocking:', error);
                    // Fall back to regular blocking
                }
            }

            // Determine block type for other sites
            let blockType = 'porn';
            if (isSocialMediaBlocked(cleanDomain)) {
                blockType = 'social_media';
            } else {
                // Check smart categorization
                const smartBlockResult = shouldBlockSmartSite(tab.url, cleanDomain);
                if (smartBlockResult && smartBlockResult.blocked) {
                    blockType = smartBlockResult.type;
                }
            }

            await blockSite(tabId, tab.url, blockType);
        }

    } catch (error) {
        console.error('Error handling tab change:', error);
    }
}

// Enhanced site blocking check with multiple layers
function shouldBlockSite(url) {
    if (!url || !isTracking) return false;

    try {
        const domain = new URL(url).hostname.toLowerCase();
        const cleanDomain = domain.replace(/^www\./, '');

        // Check temporary whitelist first
        if (TEMPORARY_WHITELIST.has(cleanDomain)) {
            return false;
        }

        // Special Reddit blocking logic
        if (cleanDomain.includes('reddit.com')) {
            return shouldBlockReddit(url, cleanDomain);
        }

        // Check if social media site is blocked due to time limit
        if (isSocialMediaBlocked(cleanDomain)) {
            return true;
        }

        // Check smart categorization for complex sites like Reddit
        const smartBlockResult = shouldBlockSmartSite(url, cleanDomain);
        if (smartBlockResult && smartBlockResult.blocked) {
            return true;
        }

        // Layer 1: Check against comprehensive porn blocklist
        if (BLOCKED_DOMAINS.has(cleanDomain)) {
            return true;
        }

        // Layer 2: Check subdomains (e.g., subdomain.pornhub.com)
        for (const blockedDomain of BLOCKED_DOMAINS) {
            if (cleanDomain.endsWith('.' + blockedDomain)) {
                return true;
            }
        }

        // Layer 3: Check moderate mode domains
        const settings = chrome.storage.local.get(['blockingMode']);
        settings.then(result => {
            const mode = result.blockingMode || 'strict';
            if (mode === 'moderate' && MODERATE_DOMAINS.has(cleanDomain)) {
                return true;
            }
        });

        return false;

    } catch (error) {
        console.error('Error checking site:', error);
        return false;
    }
}

// Enhanced site blocking with accountability logging
async function blockSite(tabId, url, blockType = 'porn') {
    try {
        const domain = new URL(url).hostname;
        const cleanDomain = domain.replace(/^www\./, '');

        // Redirect to blocked page with domain info
        await chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL('blocked.html') +
                '?site=' + encodeURIComponent(cleanDomain) +
                '&url=' + encodeURIComponent(url) +
                '&type=' + encodeURIComponent(blockType)
        });

        // Log the block attempt with detailed info
        console.log(`🚫 Blocked access to: ${cleanDomain}`);

        // Send detailed block event to backend for accountability
        await sendBlockEvent({
            domain: cleanDomain,
            fullUrl: url,
            action: 'blocked',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });

        // Update local stats
        await updateBlockStats(cleanDomain);

    } catch (error) {
        console.error('Error blocking site:', error);
    }
}

// Update local blocking statistics
async function updateBlockStats(domain) {
    try {
        const today = new Date().toISOString().split('T')[0];

        if (!dailyStats[today]) {
            dailyStats[today] = {
                totalTime: 0,
                sites: {},
                distractingTime: 0,
                productiveTime: 0,
                blockedSites: {},
                blockCount: 0
            };
        }

        if (!dailyStats[today].blockedSites[domain]) {
            dailyStats[today].blockedSites[domain] = 0;
        }

        dailyStats[today].blockedSites[domain]++;
        dailyStats[today].blockCount++;

        await chrome.storage.local.set({ dailyStats });

    } catch (error) {
        console.error('Error updating block stats:', error);
    }
}

// Track social media time and enforce daily limits
async function trackSocialMediaTime(domain, timeSpent) {
    try {
        // Check if this is a social media site with a limit
        const socialMediaSite = Object.keys(SOCIAL_MEDIA_LIMITS).find(site => domain.includes(site));
        if (!socialMediaSite) return;

        const today = new Date().toISOString().split('T')[0];

        // Initialize daily social media time tracking
        if (!dailySocialMediaTime[today]) {
            dailySocialMediaTime[today] = {};
        }

        if (!dailySocialMediaTime[today][socialMediaSite]) {
            dailySocialMediaTime[today][socialMediaSite] = 0;
        }

        // Add time spent (convert from milliseconds to minutes)
        const timeSpentMinutes = timeSpent / (1000 * 60);
        dailySocialMediaTime[today][socialMediaSite] += timeSpentMinutes;

        // Check if limit exceeded
        const limit = SOCIAL_MEDIA_LIMITS[socialMediaSite];
        const timeUsed = dailySocialMediaTime[today][socialMediaSite];

        if (timeUsed > limit && !socialMediaBlocked.has(socialMediaSite)) {
            // Block this social media site for the rest of the day
            socialMediaBlocked.add(socialMediaSite);

            // Show notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.svg',
                title: '⏰ Daily Limit Reached',
                message: `You've used ${Math.round(timeUsed)} minutes on ${socialMediaSite} today. Limit: ${limit} minutes.`
            });

            // Log to backend
            await sendSocialMediaLimitEvent({
                site: socialMediaSite,
                timeUsed: Math.round(timeUsed),
                limit: limit,
                action: 'limit_reached'
            });

            console.log(`🚫 Daily limit reached for ${socialMediaSite}: ${Math.round(timeUsed)}/${limit} minutes`);
        }

        // Save to storage
        await chrome.storage.local.set({
            dailySocialMediaTime: dailySocialMediaTime,
            socialMediaBlocked: Array.from(socialMediaBlocked)
        });

    } catch (error) {
        console.error('Error tracking social media time:', error);
    }
}

// Send social media limit event to backend
async function sendSocialMediaLimitEvent(eventData) {
    try {
        const payload = {
            userId: CONFIG.USER_ID,
            ...eventData,
            timestamp: new Date().toISOString(),
            extensionVersion: chrome.runtime.getManifest().version
        };

        const response = await fetch(`${CONFIG.API_BASE_URL}/api/social-media-limits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Social media limit event logged to backend');
        } else {
            console.error('❌ Failed to log social media limit event to backend');
        }
    } catch (error) {
        console.error('Error sending social media limit event:', error);
    }
}

// Check if a social media site is blocked due to time limit
function isSocialMediaBlocked(domain) {
    const socialMediaSite = Object.keys(SOCIAL_MEDIA_LIMITS).find(site => domain.includes(site));
    return socialMediaSite ? socialMediaBlocked.has(socialMediaSite) : false;
}

// Special Reddit blocking logic
function shouldBlockReddit(url, domain) {
    // Nuclear option - block Reddit completely
    if (CONFIG.BLOCK_REDDIT_ALWAYS) {
        return true;
    }

    // Check if we're in incognito mode
    if (CONFIG.BLOCK_REDDIT_INCOGNITO) {
        // Note: Chrome extensions can't directly detect incognito mode in content scripts
        // But we can check if the extension is running in incognito context
        // For now, we'll use a different approach - check if user is logged in

        // If user is not logged in, Reddit's adult content blocking doesn't work
        // So we should block Reddit entirely
        if (CONFIG.BLOCK_REDDIT_NOT_LOGGED_IN) {
            // We'll need to check this via content script injection
            return checkRedditLoginStatus(url);
        }
    }

    // Fall back to smart categorization for logged-in users
    const smartBlockResult = shouldBlockSmartSite(url, domain);
    if (smartBlockResult && smartBlockResult.blocked) {
        return true;
    }

    return false;
}

// Check if user is logged into Reddit
async function checkRedditLoginStatus(url) {
    try {
        // This is a simplified check - in practice, you'd inject a content script
        // to check for Reddit's login indicators

        // For now, we'll assume users are not logged in if they're visiting
        // Reddit without being in a logged-in session
        // This is a conservative approach that errs on the side of blocking

        // You could enhance this by:
        // 1. Injecting a content script to check for login indicators
        // 2. Checking for Reddit cookies
        // 3. Looking for specific DOM elements that indicate logged-in state

        return true; // Conservative: block if we can't determine login status
    } catch (error) {
        console.error('Error checking Reddit login status:', error);
        return true; // Conservative: block on error
    }
}

// Smart categorization for complex sites like Reddit
function getSmartSiteCategory(url, domain) {
    const smartRules = SMART_SITE_RULES[domain];
    if (!smartRules) return null;

    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.toLowerCase();

        // Extract subreddit from Reddit URL
        if (domain === 'reddit.com') {
            const subredditMatch = path.match(/\/r\/([^\/]+)/);
            if (subredditMatch) {
                const subreddit = subredditMatch[1];

                // Check if subreddit is always blocked (pornographic)
                if (smartRules.alwaysBlock.some(blocked =>
                    subreddit.includes(blocked) || blocked.includes(subreddit))) {
                    return { category: 'pornographic', subreddit, reason: 'NSFW content' };
                }

                // Check if subreddit is always allowed (productive)
                if (smartRules.alwaysAllow.some(allowed =>
                    subreddit.includes(allowed) || allowed.includes(allowed))) {
                    return { category: 'productive', subreddit, reason: 'Educational content' };
                }

                // Check if subreddit is blocked during work hours
                if (smartRules.workHoursBlock.some(blocked =>
                    subreddit.includes(blocked) || blocked.includes(subreddit))) {
                    const now = new Date();
                    const hour = now.getHours();
                    const isWorkHours = hour >= 8 && hour < 18; // 8 AM - 6 PM

                    if (isWorkHours) {
                        return { category: 'work_hours_blocked', subreddit, reason: 'Distracting during work hours' };
                    } else {
                        return { category: 'distracting', subreddit, reason: 'Entertainment content' };
                    }
                }

                // Default to distracting for unknown subreddits
                return { category: 'distracting', subreddit, reason: 'Unknown subreddit' };
            }
        }

        return null;
    } catch (error) {
        console.error('Error parsing URL for smart categorization:', error);
        return null;
    }
}

// Check if a URL should be blocked based on smart categorization
function shouldBlockSmartSite(url, domain) {
    const category = getSmartSiteCategory(url, domain);
    if (!category) return false;

    // Always block pornographic content
    if (category.category === 'pornographic') {
        return { blocked: true, reason: category.reason, type: 'porn' };
    }

    // Block distracting content during work hours
    if (category.category === 'work_hours_blocked') {
        return { blocked: true, reason: category.reason, type: 'work_hours' };
    }

    return { blocked: false, reason: category.reason, type: category.category };
}

// Reset daily social media limits at midnight
function resetDailySocialMediaLimits() {
    const today = new Date().toISOString().split('T')[0];
    if (!dailySocialMediaTime[today]) {
        dailySocialMediaTime[today] = {};
    }
    socialMediaBlocked.clear();

    // Save reset state
    chrome.storage.local.set({
        dailySocialMediaTime: dailySocialMediaTime,
        socialMediaBlocked: []
    });

    console.log('🔄 Daily social media limits reset');
}

// Load social media tracking data on startup
async function loadSocialMediaData() {
    try {
        const result = await chrome.storage.local.get(['dailySocialMediaTime', 'socialMediaBlocked']);
        if (result.dailySocialMediaTime) {
            dailySocialMediaTime = result.dailySocialMediaTime;
        }
        if (result.socialMediaBlocked) {
            socialMediaBlocked = new Set(result.socialMediaBlocked);
        }
    } catch (error) {
        console.error('Error loading social media data:', error);
    }
}

// Get next midnight timestamp
function getNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    return midnight.getTime();
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

        // Track social media time and check limits
        await trackSocialMediaTime(domain, timeSpent);

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
    } else if (alarm.name === 'dailyReset') {
        resetDailySocialMediaLimits();
        // Schedule next daily reset
        chrome.alarms.create('dailyReset', { when: getNextMidnight() });
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

// Enhanced search event logging
async function sendSearchEvent(eventData) {
    try {
        const payload = {
            userId: CONFIG.USER_ID,
            ...eventData,
            extensionVersion: chrome.runtime.getManifest().version,
            timestamp: eventData.timestamp || new Date().toISOString()
        };

        const response = await fetch(`${CONFIG.API_BASE_URL}/api/search-events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Search event logged to backend');
        } else {
            console.error('❌ Failed to log search event to backend');
        }
    } catch (error) {
        console.error('Error sending search event:', error);
    }
}

// Enhanced block event logging with detailed accountability data
async function sendBlockEvent(eventData) {
    try {
        const payload = {
            userId: CONFIG.USER_ID,
            ...eventData,
            extensionVersion: chrome.runtime.getManifest().version,
            timestamp: eventData.timestamp || new Date().toISOString()
        };

        const response = await fetch(`${CONFIG.API_BASE_URL}/api/blocked-site`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Block event logged to backend');
        } else {
            console.error('❌ Failed to log block event to backend');
        }
    } catch (error) {
        console.error('Error sending block event:', error);
    }
}

// Handle temporary unlock requests
async function handleTemporaryUnlock(domain, reason) {
    try {
        // Add to temporary whitelist
        TEMPORARY_WHITELIST.add(domain);
        await chrome.storage.session.set({
            temporaryWhitelist: Array.from(TEMPORARY_WHITELIST)
        });

        // Log unlock event
        await sendBlockEvent({
            domain,
            action: 'unlocked',
            reason,
            timestamp: new Date().toISOString()
        });

        // Set timer to remove from whitelist after 5 minutes
        setTimeout(async () => {
            TEMPORARY_WHITELIST.delete(domain);
            await chrome.storage.session.set({
                temporaryWhitelist: Array.from(TEMPORARY_WHITELIST)
            });
            console.log(`⏰ Temporary access expired for ${domain}`);
        }, 5 * 60 * 1000); // 5 minutes

        console.log(`🔓 Temporary access granted to ${domain} for 5 minutes`);

    } catch (error) {
        console.error('Error handling temporary unlock:', error);
    }
}

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getStats':
            const today = new Date().toISOString().split('T')[0];
            const todaySocialTime = dailySocialMediaTime[today] || {};

            sendResponse({
                dailyStats,
                isTracking,
                currentTab: currentTab?.url,
                blocklistStats: {
                    totalBlocked: BLOCKED_DOMAINS.size,
                    totalModerate: MODERATE_DOMAINS.size,
                    temporaryWhitelist: Array.from(TEMPORARY_WHITELIST)
                },
                socialMediaTime: todaySocialTime,
                socialMediaBlocked: Array.from(socialMediaBlocked)
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

        case 'temporaryUnlock':
            handleTemporaryUnlock(request.domain, request.reason).then(() => {
                sendResponse({ success: true });
            });
            return true; // Keep message channel open for async response

        case 'reloadBlocklist':
            loadBlocklist().then(() => {
                sendResponse({ success: true });
            });
            return true; // Keep message channel open for async response

        case 'getBlocklistData':
            sendResponse({
                success: true,
                blockedDomains: Array.from(BLOCKED_DOMAINS),
                moderateDomains: Array.from(MODERATE_DOMAINS),
                temporaryWhitelist: Array.from(TEMPORARY_WHITELIST)
            });
            break;

        case 'contentScriptBlock':
            // Handle block event from content script
            sendBlockEvent({
                domain: request.domain,
                fullUrl: request.url,
                action: 'blocked',
                source: 'content_script',
                timestamp: request.timestamp
            });
            break;

        case 'logSearchEvent':
            // Handle search query logging
            sendSearchEvent({
                query: request.query,
                source: request.source,
                url: request.url,
                severity: request.severity,
                matchedKeywords: request.matchedKeywords,
                timestamp: request.timestamp
            });
            break;
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('Personal Assistant extension started');
    await updateBlockedSitesRules();
});
