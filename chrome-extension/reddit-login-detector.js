// Enhanced Reddit login detection and blocking system
// This provides more sophisticated detection of Reddit login status

class RedditLoginDetector {
    constructor() {
        this.loginCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Check if user is logged into Reddit by injecting content script
    async checkRedditLoginStatus(tabId) {
        try {
            // Check cache first
            const cached = this.loginCache.get(tabId);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.isLoggedIn;
            }

            // Inject content script to check login status
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: this.detectRedditLogin
            });

            const isLoggedIn = results[0]?.result || false;

            // Cache the result
            this.loginCache.set(tabId, {
                isLoggedIn,
                timestamp: Date.now()
            });

            return isLoggedIn;
        } catch (error) {
            console.error('Error checking Reddit login status:', error);
            // Conservative approach: assume not logged in if we can't check
            return false;
        }
    }

    // Function to inject into Reddit page to detect login status
    detectRedditLogin() {
        try {
            // Method 1: Check for Reddit's login indicators
            const loginIndicators = [
                // Check for user menu (logged in users have this)
                document.querySelector('[data-testid="user-menu"]'),
                document.querySelector('.user-dropdown'),
                document.querySelector('#USER_DROPDOWN_ID'),

                // Check for username in various places
                document.querySelector('[data-testid="username"]'),
                document.querySelector('.username'),

                // Check for logout button
                document.querySelector('[href*="logout"]'),
                document.querySelector('[data-testid="logout"]'),

                // Check for user avatar
                document.querySelector('.user-avatar'),
                document.querySelector('[data-testid="user-avatar"]'),

                // Check for Reddit Premium indicator
                document.querySelector('[data-testid="premium"]'),
                document.querySelector('.premium-badge')
            ];

            // If any login indicator is found, user is logged in
            const hasLoginIndicators = loginIndicators.some(indicator => indicator !== null);

            // Method 2: Check for Reddit's global user object
            let hasUserObject = false;
            try {
                // Reddit sometimes exposes user data in window.__r
                if (window.__r && window.__r.user) {
                    hasUserObject = true;
                }

                // Check for Reddit's Redux store
                if (window.__REDUX_DEVTOOLS_EXTENSION__) {
                    const store = window.__REDUX_DEVTOOLS_EXTENSION__.getState();
                    if (store && store.user && store.user.name) {
                        hasUserObject = true;
                    }
                }
            } catch (e) {
                // Ignore errors accessing Reddit's internal objects
            }

            // Method 3: Check URL patterns
            const urlPatterns = [
                // Logged in users might have user-specific URLs
                window.location.pathname.includes('/user/'),
                window.location.pathname.includes('/u/'),
                // Check for Reddit's logged-in redirect patterns
                document.cookie.includes('reddit_session'),
                document.cookie.includes('session')
            ];

            const hasUrlPatterns = urlPatterns.some(pattern => pattern);

            // Method 4: Check for "Sign In" button (indicates not logged in)
            const signInButton = document.querySelector('[href*="login"]') ||
                document.querySelector('[data-testid="sign-in"]') ||
                document.querySelector('button[aria-label*="Sign in"]');

            const hasSignInButton = signInButton !== null;

            // Determine login status
            const isLoggedIn = (hasLoginIndicators || hasUserObject || hasUrlPatterns) && !hasSignInButton;

            console.log('Reddit login detection:', {
                hasLoginIndicators,
                hasUserObject,
                hasUrlPatterns,
                hasSignInButton,
                isLoggedIn,
                url: window.location.href
            });

            return isLoggedIn;
        } catch (error) {
            console.error('Error in Reddit login detection:', error);
            return false; // Conservative: assume not logged in
        }
    }

    // Clear cache for a specific tab
    clearCache(tabId) {
        this.loginCache.delete(tabId);
    }

    // Clear all cache
    clearAllCache() {
        this.loginCache.clear();
    }
}

// Global instance
const redditLoginDetector = new RedditLoginDetector();

// Enhanced Reddit blocking with login detection
async function shouldBlockRedditEnhanced(url, domain, tabId) {
    // Nuclear option - block Reddit completely
    if (CONFIG.BLOCK_REDDIT_ALWAYS) {
        return { blocked: true, reason: 'Reddit completely blocked', type: 'reddit_blocked' };
    }

    // Check if we should block Reddit when not logged in
    if (CONFIG.BLOCK_REDDIT_NOT_LOGGED_IN) {
        try {
            const isLoggedIn = await redditLoginDetector.checkRedditLoginStatus(tabId);

            if (!isLoggedIn) {
                return {
                    blocked: true,
                    reason: 'Reddit blocked when not logged in (adult content protection disabled)',
                    type: 'reddit_not_logged_in'
                };
            }
        } catch (error) {
            console.error('Error checking Reddit login status:', error);
            // Conservative: block if we can't determine login status
            return {
                blocked: true,
                reason: 'Reddit blocked (unable to verify login status)',
                type: 'reddit_login_check_failed'
            };
        }
    }

    // If user is logged in, use smart categorization
    const smartBlockResult = shouldBlockSmartSite(url, domain);
    if (smartBlockResult && smartBlockResult.blocked) {
        return smartBlockResult;
    }

    return { blocked: false, reason: 'Reddit access allowed', type: 'allowed' };
}
