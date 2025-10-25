// Enhanced content script with third-layer blocking fallback
// This runs on document_start to catch any sites that slip through declarativeNetRequest

// Blocklist data (will be loaded from background script)
let BLOCKED_DOMAINS = new Set();
let MODERATE_DOMAINS = new Set();
let TEMPORARY_WHITELIST = new Set();

// Check if current domain should be blocked
function checkDomainBlocking() {
    try {
        const domain = window.location.hostname.toLowerCase();
        const cleanDomain = domain.replace(/^www\./, '');
        
        // Check temporary whitelist first
        if (TEMPORARY_WHITELIST.has(cleanDomain)) {
            return false;
        }
        
        // Check against blocked domains
        if (BLOCKED_DOMAINS.has(cleanDomain)) {
            return true;
        }
        
        // Check subdomains
        for (const blockedDomain of BLOCKED_DOMAINS) {
            if (cleanDomain.endsWith('.' + blockedDomain)) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking domain blocking:', error);
        return false;
    }
}

// Show blocking overlay if domain should be blocked
function showBlockingOverlay() {
    if (checkDomainBlocking()) {
        // Hide all page content
        document.documentElement.style.display = 'none';
        
        // Create blocking overlay
        const overlay = document.createElement('div');
        overlay.id = 'personal-assistant-block-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: white;
            ">
                <div style="text-align: center; max-width: 500px; padding: 40px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
                    <h1 style="font-size: 28px; margin-bottom: 16px; font-weight: 600;">Site Blocked</h1>
                    <div style="font-size: 18px; margin-bottom: 24px; opacity: 0.9;">
                        Your Personal Assistant is protecting your focus
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 32px; font-weight: 500;">
                        ${window.location.hostname}
                    </div>
                    <div style="font-size: 16px; line-height: 1.6; margin-bottom: 32px; opacity: 0.9;">
                        This site has been blocked to help you stay focused and productive.
                    </div>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.history.back()" style="
                            padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; 
                            cursor: pointer; background: rgba(255, 255, 255, 0.2); color: white; 
                            border: 2px solid rgba(255, 255, 255, 0.3);
                        ">Go Back</button>
                        <button onclick="window.location.href='https://www.google.com'" style="
                            padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; 
                            cursor: pointer; background: transparent; color: white; 
                            border: 2px solid rgba(255, 255, 255, 0.5);
                        ">Search Google</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Log the block to background script
        chrome.runtime.sendMessage({
            action: 'contentScriptBlock',
            domain: window.location.hostname,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
        
        return true;
    }
    return false;
}

// Load blocklist data from background script
chrome.runtime.sendMessage({ action: 'getBlocklistData' }, (response) => {
    if (response && response.success) {
        BLOCKED_DOMAINS = new Set(response.blockedDomains || []);
        MODERATE_DOMAINS = new Set(response.moderateDomains || []);
        TEMPORARY_WHITELIST = new Set(response.temporaryWhitelist || []);
        
        // Check if current page should be blocked
        showBlockingOverlay();
    }
});

// Track page visibility and focus
let isPageVisible = true;
let pageFocusStart = Date.now();

// Track when page becomes visible/hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page hidden - record time spent
        if (isPageVisible) {
            const timeSpent = Date.now() - pageFocusStart;
            sendTimeData(timeSpent);
            isPageVisible = false;
        }
    } else {
        // Page visible - start tracking
        pageFocusStart = Date.now();
        isPageVisible = true;
    }
});

// Track when page loses/gains focus
window.addEventListener('focus', () => {
    pageFocusStart = Date.now();
    isPageVisible = true;
});

window.addEventListener('blur', () => {
    if (isPageVisible) {
        const timeSpent = Date.now() - pageFocusStart;
        sendTimeData(timeSpent);
        isPageVisible = false;
    }
});

// Track scroll behavior (distraction indicator)
let scrollStart = Date.now();
let scrollCount = 0;

window.addEventListener('scroll', () => {
    scrollCount++;

    // If scrolling frequently, it might indicate distraction
    if (scrollCount > 10) {
        const scrollDuration = Date.now() - scrollStart;
        if (scrollDuration < 5000) { // Scrolling for less than 5 seconds
            sendDistractionEvent('excessive_scrolling', scrollDuration);
        }
        scrollCount = 0;
        scrollStart = Date.now();
    }
});

// Track rapid tab switching (if multiple tabs)
let lastTabSwitch = Date.now();
let tabSwitchCount = 0;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'trackTabSwitch') {
        const now = Date.now();
        const timeSinceLastSwitch = now - lastTabSwitch;

        if (timeSinceLastSwitch < 2000) { // Less than 2 seconds
            tabSwitchCount++;

            if (tabSwitchCount > 3) {
                sendDistractionEvent('rapid_tab_switching', timeSinceLastSwitch);
                tabSwitchCount = 0;
            }
        } else {
            tabSwitchCount = 0;
        }

        lastTabSwitch = now;
    }
});

// Send time data to background script
function sendTimeData(timeSpent) {
    chrome.runtime.sendMessage({
        action: 'recordTime',
        timeSpent: timeSpent,
        url: window.location.href,
        title: document.title
    });
}

// Send distraction event
function sendDistractionEvent(type, duration) {
    chrome.runtime.sendMessage({
        action: 'distractionEvent',
        type: type,
        duration: duration,
        url: window.location.href
    });
}

// Track form interactions (productivity indicator)
let formInteractions = 0;
document.addEventListener('input', () => {
    formInteractions++;

    // Send productivity event every 10 interactions
    if (formInteractions % 10 === 0) {
        chrome.runtime.sendMessage({
            action: 'productivityEvent',
            type: 'form_interaction',
            count: formInteractions,
            url: window.location.href
        });
    }
});

// Track copy/paste actions (productivity indicator)
document.addEventListener('copy', () => {
    chrome.runtime.sendMessage({
        action: 'productivityEvent',
        type: 'copy_action',
        url: window.location.href
    });
});

document.addEventListener('paste', () => {
    chrome.runtime.sendMessage({
        action: 'productivityEvent',
        type: 'paste_action',
        url: window.location.href
    });
});

// Track keyboard shortcuts (productivity indicator)
document.addEventListener('keydown', (e) => {
    // Common productivity shortcuts
    const productivityShortcuts = [
        'ctrl+c', 'ctrl+v', 'ctrl+x', 'ctrl+z', 'ctrl+y',
        'ctrl+s', 'ctrl+a', 'ctrl+f', 'ctrl+h', 'ctrl+g',
        'ctrl+shift+n', 'ctrl+shift+t', 'ctrl+tab', 'ctrl+shift+tab'
    ];

    const shortcut = `${e.ctrlKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;

    if (productivityShortcuts.includes(shortcut)) {
        chrome.runtime.sendMessage({
            action: 'productivityEvent',
            type: 'keyboard_shortcut',
            shortcut: shortcut,
            url: window.location.href
        });
    }
});

// Initialize tracking
console.log('Personal Assistant content script loaded');
