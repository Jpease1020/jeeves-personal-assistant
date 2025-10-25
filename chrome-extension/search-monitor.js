// Search monitoring system for Personal Assistant Chrome Extension
// Detects porn-related search queries and blocks/logs them

class SearchMonitor {
    constructor() {
        this.pornKeywords = new Set([
            // Explicit terms
            'porn', 'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'tube8',
            'beeg', 'xhamster', 'xtube', 'chaturbate', 'livejasmin', 'myfreecams',
            'onlyfans', 'camgirl', 'webcam', 'strip', 'nude', 'naked', 'sex',
            'fuck', 'fucking', 'pussy', 'dick', 'cock', 'boobs', 'tits', 'ass',
            'anal', 'blowjob', 'masturbat', 'orgasm', 'cum', 'sperm', 'penis',
            'vagina', 'breast', 'nipple', 'clitoris', 'erotic', 'fetish',
            
            // Softcore/adult themes
            'lingerie', 'bikini', 'underwear', 'bra', 'panties', 'thong',
            'sexy', 'hot', 'beautiful', 'attractive', 'seductive', 'provocative',
            'adult', 'mature', '18+', 'nsfw', 'explicit', 'xxx', 'pornstar',
            'model', 'escort', 'prostitute', 'hooker', 'massage', 'brothel',
            
            // Dating/hookup sites
            'tinder', 'bumble', 'grindr', 'match', 'okcupid', 'plentyoffish',
            'adultfriendfinder', 'ashleymadison', 'seeking', 'sugar daddy',
            'hookup', 'one night stand', 'casual sex', 'friends with benefits',
            
            // Specific fetishes/kinks
            'bdsm', 'bondage', 'domination', 'submission', 'sadism', 'masochism',
            'fetish', 'leather', 'latex', 'rubber', 'foot', 'feet', 'toe',
            'spanking', 'whip', 'collar', 'chain', 'rope', 'handcuff',
            'roleplay', 'cosplay', 'uniform', 'nurse', 'teacher', 'student',
            'milf', 'cougar', 'teen', 'young', 'barely legal', 'schoolgirl',
            'incest', 'stepmom', 'stepsis', 'stepbro', 'family', 'taboo',
            'threesome', 'orgy', 'gangbang', 'swinger', 'wife swap',
            'cuckold', 'bull', 'hotwife', 'cheating', 'affair', 'betrayal',
            
            // Body parts/descriptions
            'big', 'huge', 'massive', 'tiny', 'small', 'tight', 'loose',
            'thick', 'thin', 'curvy', 'skinny', 'fat', 'chubby', 'bbw',
            'muscle', 'ripped', 'jacked', 'strong', 'weak', 'submissive',
            'dominant', 'alpha', 'beta', 'virgin', 'experienced', 'slut',
            'whore', 'bitch', 'daddy', 'mommy', 'baby', 'honey', 'sweetie',
            
            // Actions/behaviors
            'suck', 'lick', 'kiss', 'touch', 'feel', 'grab', 'squeeze',
            'rub', 'stroke', 'finger', 'fist', 'deep', 'hard', 'rough',
            'gentle', 'slow', 'fast', 'quick', 'long', 'short', 'big',
            'small', 'tight', 'wet', 'dry', 'hot', 'cold', 'warm',
            'smooth', 'rough', 'soft', 'hard', 'firm', 'loose',
            
            // Locations/situations
            'shower', 'bathroom', 'bedroom', 'kitchen', 'office', 'car',
            'public', 'private', 'outdoor', 'indoor', 'beach', 'pool',
            'gym', 'workout', 'yoga', 'dance', 'party', 'club', 'bar',
            'hotel', 'motel', 'vacation', 'travel', 'business trip',
            
            // Ethnicity/age descriptors (problematic but commonly searched)
            'asian', 'latina', 'black', 'white', 'ebony', 'blonde', 'brunette',
            'redhead', 'ginger', 'curly', 'straight', 'long hair', 'short hair',
            'tall', 'short', 'petite', 'tall', 'average', 'plus size',
            
            // Common misspellings/variations
            'p0rn', 'pr0n', 'p*rn', 'p0rn0', 'porn0', 'xxx', 'xXx',
            'sexe', 'sexy', 'seks', 's3x', 's*x', 'f*ck', 'fuck',
            'nude', 'nud3', 'n*d3', 'nak3d', 'naked', 'n*k*d'
        ]);
        
        this.moderateKeywords = new Set([
            // Dating/relationship terms
            'dating', 'relationship', 'love', 'romance', 'marriage', 'wedding',
            'boyfriend', 'girlfriend', 'husband', 'wife', 'partner', 'crush',
            'flirt', 'attraction', 'chemistry', 'compatibility', 'commitment',
            
            // Beauty/fashion (can be innocent or adult)
            'beauty', 'makeup', 'cosmetics', 'fashion', 'style', 'outfit',
            'dress', 'clothes', 'shopping', 'lingerie', 'underwear', 'bra',
            'panties', 'thong', 'bikini', 'swimsuit', 'beachwear',
            
            // Health/fitness (can be innocent or adult)
            'fitness', 'workout', 'gym', 'exercise', 'yoga', 'pilates',
            'diet', 'weight loss', 'muscle', 'bodybuilding', 'strength',
            'flexibility', 'endurance', 'cardio', 'strength training',
            
            // Entertainment/adult themes
            'movie', 'film', 'cinema', 'entertainment', 'celebrity', 'actor',
            'actress', 'model', 'fashion', 'magazine', 'photography',
            'art', 'sculpture', 'painting', 'drawing', 'sketch'
        ]);
        
        this.setupSearchMonitoring();
    }
    
    setupSearchMonitoring() {
        // Monitor Google searches
        this.monitorGoogleSearch();
        
        // Monitor other search engines
        this.monitorBingSearch();
        this.monitorDuckDuckGoSearch();
        
        // Monitor YouTube searches
        this.monitorYouTubeSearch();
        
        // Monitor Reddit searches
        this.monitorRedditSearch();
        
        // Monitor any site with search functionality
        this.monitorGenericSearch();
    }
    
    monitorGoogleSearch() {
        // Google search URL pattern: google.com/search?q=query
        chrome.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.url.includes('google.com/search')) {
                const url = new URL(details.url);
                const query = url.searchParams.get('q');
                if (query) {
                    this.checkSearchQuery(query, 'google', details.url);
                }
            }
        });
    }
    
    monitorBingSearch() {
        chrome.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.url.includes('bing.com/search')) {
                const url = new URL(details.url);
                const query = url.searchParams.get('q');
                if (query) {
                    this.checkSearchQuery(query, 'bing', details.url);
                }
            }
        });
    }
    
    monitorDuckDuckGoSearch() {
        chrome.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.url.includes('duckduckgo.com/?q=')) {
                const url = new URL(details.url);
                const query = url.searchParams.get('q');
                if (query) {
                    this.checkSearchQuery(query, 'duckduckgo', details.url);
                }
            }
        });
    }
    
    monitorYouTubeSearch() {
        chrome.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.url.includes('youtube.com/results')) {
                const url = new URL(details.url);
                const query = url.searchParams.get('search_query');
                if (query) {
                    this.checkSearchQuery(query, 'youtube', details.url);
                }
            }
        });
    }
    
    monitorRedditSearch() {
        chrome.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.url.includes('reddit.com/search')) {
                const url = new URL(details.url);
                const query = url.searchParams.get('q');
                if (query) {
                    this.checkSearchQuery(query, 'reddit', details.url);
                }
            }
        });
    }
    
    monitorGenericSearch() {
        // Monitor search inputs on any page
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                chrome.scripting.executeScript({
                    target: { tabId },
                    func: this.injectSearchMonitor
                }).catch(() => {
                    // Ignore errors for pages that can't be scripted
                });
            }
        });
    }
    
    injectSearchMonitor() {
        // Monitor search input fields
        const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[id*="search"], input[placeholder*="search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = input.value.trim().toLowerCase();
                    if (query) {
                        // Send search query to background script
                        chrome.runtime.sendMessage({
                            action: 'searchQuery',
                            query: query,
                            source: window.location.hostname,
                            url: window.location.href
                        });
                    }
                }
            });
        });
    }
    
    checkSearchQuery(query, source, url) {
        const lowerQuery = query.toLowerCase();
        const words = lowerQuery.split(/\s+/);
        
        // Check for explicit porn keywords
        const explicitMatches = words.filter(word => this.pornKeywords.has(word));
        if (explicitMatches.length > 0) {
            this.handlePornSearch(query, source, url, 'explicit', explicitMatches);
            return;
        }
        
        // Check for moderate keywords
        const moderateMatches = words.filter(word => this.moderateKeywords.has(word));
        if (moderateMatches.length > 0) {
            this.handlePornSearch(query, source, url, 'moderate', moderateMatches);
            return;
        }
        
        // Check for suspicious patterns
        if (this.hasSuspiciousPattern(lowerQuery)) {
            this.handlePornSearch(query, source, url, 'suspicious', []);
        }
    }
    
    hasSuspiciousPattern(query) {
        const suspiciousPatterns = [
            /nude.*pic/i,
            /naked.*photo/i,
            /sex.*video/i,
            /porn.*free/i,
            /adult.*content/i,
            /explicit.*material/i,
            /nsfw.*subreddit/i,
            /onlyfans.*leak/i,
            /cam.*girl/i,
            /webcam.*show/i,
            /strip.*club/i,
            /massage.*parlor/i,
            /escort.*service/i,
            /hookup.*app/i,
            /dating.*site/i,
            /adult.*friend/i,
            /sugar.*daddy/i,
            /sugar.*mommy/i,
            /fetish.*video/i,
            /bdsm.*content/i,
            /bondage.*pic/i,
            /domination.*video/i,
            /submission.*photo/i,
            /milf.*video/i,
            /teen.*pic/i,
            /young.*nude/i,
            /barely.*legal/i,
            /stepmom.*video/i,
            /stepsis.*pic/i,
            /family.*taboo/i,
            /incest.*video/i,
            /threesome.*video/i,
            /orgy.*pic/i,
            /swinger.*party/i,
            /wife.*swap/i,
            /cuckold.*video/i,
            /hotwife.*pic/i,
            /cheating.*wife/i,
            /affair.*video/i,
            /betrayal.*pic/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(query));
    }
    
    async handlePornSearch(query, source, url, severity, matchedKeywords) {
        console.log(`🚨 Porn search detected: "${query}" on ${source} (${severity})`);
        
        // Send to backend for logging
        await chrome.runtime.sendMessage({
            action: 'logSearchEvent',
            query: query,
            source: source,
            url: url,
            severity: severity,
            matchedKeywords: matchedKeywords,
            timestamp: new Date().toISOString()
        });
        
        // Block the search if it's explicit
        if (severity === 'explicit') {
            // Redirect to blocked page
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, {
                        url: chrome.runtime.getURL('blocked.html') + 
                             '?site=' + encodeURIComponent(source) + 
                             '&query=' + encodeURIComponent(query) +
                             '&type=search'
                    });
                }
            });
        }
        
        // Show warning notification for moderate/suspicious searches
        if (severity === 'moderate' || severity === 'suspicious') {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.svg',
                title: 'Personal Assistant Alert',
                message: `Search detected: "${query}" - Consider your goals`
            });
        }
    }
}

// Initialize search monitoring
const searchMonitor = new SearchMonitor();
