// Content script for Personal Assistant Chrome Extension

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
