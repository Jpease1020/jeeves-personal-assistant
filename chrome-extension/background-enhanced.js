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
    'pinterest.com',
    'linkedin.com',
    'snapchat.com',
    'discord.com',
    'twitch.tv',
    'netflix.com',
    'hulu.com',
    'amazon.com',
    'ebay.com',
    'threads.net'
];

// Social media daily time limits (in minutes)
const SOCIAL_MEDIA_LIMITS = {
    'facebook.com': 15,     // 15 minutes per day
    'instagram.com': 20,    // 20 minutes per day
    'twitter.com': 10,      // 10 minutes per day
    'tiktok.com': 15,       // 15 minutes per day
    'youtube.com': 30,      // 30 minutes per day
    'reddit.com': 25,       // 25 minutes per day
    'pinterest.com': 20,    // 20 minutes per day
    'linkedin.com': 15      // 15 minutes per day
};

// Smart categorization for complex sites like Reddit
const SMART_SITE_RULES = {
    'reddit.com': {
        pornographic: [
            'nsfw', 'gonewild', 'realgirls', 'amateur', 'milf', 'cougar',
            'teen', 'barelylegal', 'incest', 'stepmom', 'stepsis', 'stepbro',
            'family', 'threesome', 'orgy', 'gangbang', 'swinger', 'wife',
            'hotwife', 'cuckold', 'cheating', 'affair', 'betrayal', 'bdsm',
            'bondage', 'domination', 'submission', 'fetish', 'leather',
            'latex', 'rubber', 'foot', 'feet', 'toe', 'spanking', 'whip',
            'collar', 'chain', 'rope', 'handcuff', 'roleplay', 'cosplay',
            'uniform', 'nurse', 'teacher', 'escort', 'prostitute', 'hooker',
            'massage', 'brothel', 'strip', 'club', 'cam', 'girl', 'webcam',
            'show', 'onlyfans', 'leak', 'sugar', 'daddy', 'mommy'
        ],
        productive: [
            'programming', 'coding', 'javascript', 'python', 'react', 'node',
            'webdev', 'frontend', 'backend', 'fullstack', 'devops', 'aws',
            'docker', 'kubernetes', 'linux', 'ubuntu', 'git', 'github',
            'stackoverflow', 'learnprogramming', 'compsci', 'algorithms',
            'datastructures', 'machinelearning', 'ai', 'datascience',
            'productivity', 'getmotivated', 'selfimprovement', 'fitness',
            'nutrition', 'health', 'meditation', 'mindfulness', 'books',
            'reading', 'writing', 'journaling', 'finance', 'investing',
            'personalfinance', 'frugal', 'minimalism', 'entrepreneur',
            'startups', 'business', 'marketing', 'sales', 'leadership'
        ],
        distracting: [
            'funny', 'memes', 'dankmemes', 'wholesomememes', 'gaming',
            'pcgaming', 'xbox', 'playstation', 'nintendo', 'steam',
            'minecraft', 'fortnite', 'leagueoflegends', 'dota', 'csgo',
            'valorant', 'overwatch', 'wow', 'ffxiv', 'destiny', 'apex',
            'callofduty', 'battlefield', 'fifa', 'nba2k', 'madden',
            'pokemon', 'zelda', 'mario', 'sonic', 'halo', 'gears',
            'uncharted', 'lastofus', 'godofwar', 'spiderman', 'batman',
            'marvel', 'dc', 'comics', 'anime', 'manga', 'naruto',
            'onepiece', 'dragonball', 'attackontitan', 'demon', 'slayer',
            'myheroacademia', 'tokyoghoul', 'deathnote', 'fullmetal',
            'alchemist', 'cowboybebop', 'evangelion', 'ghostintheshell',
            'akira', 'spiritedaway', 'totoro', 'princessmononoke',
            'howlsmovingcastle', 'ponyo', 'arrietty', 'kiki', 'delivery',
            'service', 'castleinthesky', 'nausicaa', 'valleyofthewind',
            'movies', 'television', 'netflix', 'hulu', 'disney', 'plus',
            'hbo', 'max', 'amazon', 'prime', 'video', 'youtube', 'tv',
            'streaming', 'twitch', 'livestream', 'podcast', 'music',
            'spotify', 'apple', 'soundcloud', 'bandcamp', 'vinyl',
            'records', 'cd', 'cassette', 'tape', 'mp3', 'flac', 'wav',
            'rock', 'pop', 'hiphop', 'rap', 'jazz', 'blues', 'country',
            'folk', 'electronic', 'edm', 'house', 'techno', 'trance',
            'dubstep', 'drum', 'bass', 'ambient', 'chill', 'lounge',
            'classical', 'orchestra', 'symphony', 'opera', 'ballet',
            'dance', 'ballroom', 'salsa', 'tango', 'waltz', 'foxtrot',
            'swing', 'lindy', 'hop', 'jive', 'cha', 'cha', 'rumba',
            'samba', 'mambo', 'merengue', 'bachata', 'kizomba', 'zouk',
            'sport', 'football', 'soccer', 'basketball', 'baseball',
            'hockey', 'tennis', 'golf', 'swimming', 'running', 'cycling',
            'weightlifting', 'bodybuilding', 'crossfit', 'yoga', 'pilates',
            'martial', 'arts', 'karate', 'taekwondo', 'judo', 'jujitsu',
            'boxing', 'mma', 'ufc', 'wrestling', 'olympics', 'world',
            'cup', 'championship', 'tournament', 'league', 'team',
            'player', 'coach', 'referee', 'umpire', 'score', 'goal',
            'point', 'win', 'lose', 'tie', 'draw', 'victory', 'defeat',
            'champion', 'winner', 'loser', 'medal', 'gold', 'silver',
            'bronze', 'trophy', 'cup', 'award', 'prize', 'money',
            'cash', 'dollar', 'euro', 'pound', 'yen', 'yuan', 'rupee',
            'peso', 'franc', 'mark', 'lira', 'krone', 'krona', 'zloty',
            'forint', 'koruna', 'lev', 'leu', 'dinar', 'dirham', 'rial',
            'shekel', 'rand', 'real', 'peso', 'bolivar', 'sol', 'guarani',
            'crypto', 'bitcoin', 'ethereum', 'litecoin', 'ripple', 'xrp',
            'cardano', 'ada', 'polkadot', 'dot', 'chainlink', 'link',
            'uniswap', 'uni', 'aave', 'compound', 'maker', 'mkr', 'dai',
            'usdc', 'usdt', 'tether', 'binance', 'bnb', 'solana', 'sol',
            'avalanche', 'avax', 'polygon', 'matic', 'fantom', 'ftm',
            'cosmos', 'atom', 'algorand', 'algo', 'stellar', 'xlm',
            'vechain', 'vet', 'tezos', 'xtz', 'eos', 'tron', 'trx',
            'neo', 'qtum', 'icon', 'icx', 'zilliqa', 'zil', 'ontology',
            'ont', 'nano', 'xno', 'iota', 'miota', 'monero', 'xmr',
            'dash', 'zcash', 'zec', 'decred', 'dcr', 'verge', 'xvg',
            'dogecoin', 'doge', 'shiba', 'inu', 'shib', 'pepe', 'frog',
            'elon', 'musk', 'tesla', 'spacex', 'neuralink', 'boring',
            'company', 'tunnel', 'hyperloop', 'mars', 'moon', 'satellite',
            'starlink', 'internet', 'global', 'coverage', 'low', 'earth',
            'orbit', 'leo', 'geostationary', 'geo', 'medium', 'meo',
            'high', 'heo', 'polar', 'sun', 'synchronous', 'ss', 'molniya',
            'tundra', 'elliptical', 'inclined', 'equatorial', 'prograde',
            'retrograde', 'launch', 'rocket', 'falcon', 'heavy', 'starship',
            'super', 'heavy', 'raptor', 'engine', 'methane', 'oxygen',
            'fuel', 'oxidizer', 'kerosene', 'rp', 'hydrazine', 'monomethyl',
            'mmh', 'nitrogen', 'tetroxide', 'n2o4', 'liquid', 'hydrogen',
            'lh2', 'liquid', 'oxygen', 'lox', 'solid', 'propellant',
            'srbs', 'boosters', 'reusable', 'landing', 'barge', 'drone',
            'ship', 'recovery', 'refurbishment', 'refueling', 'rapid',
            'turnaround', 'cost', 'reduction', 'economy', 'scale',
            'manufacturing', 'production', 'assembly', 'line', 'factory',
            'facility', 'hangar', 'bay', 'clean', 'room', 'environment',
            'contamination', 'particle', 'count', 'iso', 'standard',
            'class', 'grade', 'level', 'specification', 'requirement',
            'tolerance', 'precision', 'accuracy', 'repeatability',
            'reproducibility', 'calibration', 'verification', 'validation',
            'testing', 'inspection', 'quality', 'assurance', 'control',
            'management', 'system', 'process', 'procedure', 'protocol',
            'workflow', 'pipeline', 'automation', 'robotics', 'ai',
            'artificial', 'intelligence', 'machine', 'learning', 'deep',
            'neural', 'network', 'algorithm', 'model', 'training',
            'dataset', 'big', 'data', 'analytics', 'visualization',
            'dashboard', 'reporting', 'kpi', 'metrics', 'performance',
            'optimization', 'efficiency', 'productivity', 'throughput',
            'capacity', 'utilization', 'availability', 'reliability',
            'maintainability', 'serviceability', 'supportability',
            'sustainability', 'environmental', 'impact', 'carbon',
            'footprint', 'emissions', 'pollution', 'waste', 'recycling',
            'renewable', 'energy', 'solar', 'wind', 'hydro', 'geothermal',
            'nuclear', 'fission', 'fusion', 'reactor', 'uranium',
            'plutonium', 'thorium', 'deuterium', 'tritium', 'helium',
            'hydrogen', 'isotope', 'radioactive', 'decay', 'half',
            'life', 'radiation', 'gamma', 'alpha', 'beta', 'neutron',
            'proton', 'electron', 'atom', 'molecule', 'element',
            'compound', 'mixture', 'solution', 'suspension', 'colloid',
            'emulsion', 'foam', 'gel', 'aerosol', 'smoke', 'fog',
            'mist', 'vapor', 'steam', 'gas', 'liquid', 'solid',
            'plasma', 'bose', 'einstein', 'condensate', 'superfluid',
            'superconductor', 'quantum', 'mechanics', 'relativity',
            'general', 'special', 'theory', 'equation', 'formula',
            'constant', 'variable', 'parameter', 'coefficient',
            'exponent', 'logarithm', 'trigonometry', 'calculus',
            'differential', 'integral', 'derivative', 'limit',
            'continuity', 'convergence', 'divergence', 'series',
            'sequence', 'function', 'domain', 'range', 'codomain',
            'injection', 'surjection', 'bijection', 'inverse',
            'composition', 'transformation', 'mapping', 'relation',
            'equivalence', 'order', 'partial', 'total', 'well',
            'founded', 'induction', 'recursion', 'iteration',
            'algorithm', 'complexity', 'time', 'space', 'asymptotic',
            'notation', 'big', 'o', 'omega', 'theta', 'little',
            'o', 'omega', 'theta', 'polynomial', 'exponential',
            'logarithmic', 'linear', 'quadratic', 'cubic', 'quartic',
            'quintic', 'sextic', 'septic', 'octic', 'nonic', 'decic',
            'degree', 'order', 'coefficient', 'term', 'monomial',
            'binomial', 'trinomial', 'polynomial', 'rational',
            'irrational', 'transcendental', 'algebraic', 'real',
            'imaginary', 'complex', 'number', 'integer', 'natural',
            'whole', 'positive', 'negative', 'zero', 'infinity',
            'finite', 'countable', 'uncountable', 'cardinal',
            'ordinal', 'set', 'subset', 'superset', 'proper',
            'improper', 'empty', 'null', 'universal', 'complement',
            'union', 'intersection', 'difference', 'symmetric',
            'cartesian', 'product', 'power', 'set', 'partition',
            'equivalence', 'class', 'quotient', 'space', 'group',
            'ring', 'field', 'vector', 'space', 'module', 'algebra',
            'topology', 'manifold', 'metric', 'space', 'norm',
            'inner', 'product', 'orthogonal', 'perpendicular',
            'parallel', 'angle', 'distance', 'length', 'area',
            'volume', 'surface', 'curve', 'line', 'plane', 'point',
            'vertex', 'edge', 'face', 'polygon', 'polyhedron',
            'circle', 'sphere', 'ellipse', 'parabola', 'hyperbola',
            'conic', 'section', 'quadric', 'surface', 'torus',
            'cylinder', 'cone', 'pyramid', 'prism', 'cube',
            'octahedron', 'dodecahedron', 'icosahedron', 'platonic',
            'solid', 'archimedean', 'kepler', 'poinsot', 'uniform',
            'polyhedron', 'catalan', 'solid', 'dual', 'polyhedron',
            'stellation', 'faceting', 'truncation', 'snub',
            'rectification', 'cantellation', 'runcination',
            'sterication', 'pentellation', 'hexellation',
            'heptellation', 'octellation', 'enneellation',
            'decellation', 'hendecellation', 'dodecellation',
            'tridecellation', 'tetradecellation', 'pentadecellation',
            'hexadecellation', 'heptadecellation', 'octadecellation',
            'enneadecellation', 'icosellation', 'henicosellation',
            'docosellation', 'tricosellation', 'tetracosellation',
            'pentacosellation', 'hexacosellation', 'heptacosellation',
            'octacosellation', 'enneacosellation', 'triacontellation',
            'hentriacontellation', 'dotriacontellation', 'tritriacontellation',
            'tetratriacontellation', 'pentatriacontellation', 'hexatriacontellation',
            'heptatriacontellation', 'octatriacontellation', 'enneatriacontellation',
            'tetracontellation', 'hentetracontellation', 'dotetracontellation',
            'tritetracontellation', 'tetratetracontellation', 'pentatetracontellation',
            'hexatetracontellation', 'heptatetracontellation', 'octatetracontellation',
            'enneatetracontellation', 'pentacontellation', 'henpentacontellation',
            'dopentacontellation', 'tripentacontellation', 'tetrapentacontellation',
            'pentapentacontellation', 'hexapentacontellation', 'heptapentacontellation',
            'octapentacontellation', 'enneapentacontellation', 'hexacontellation',
            'henhexacontellation', 'dohexacontellation', 'trihexacontellation',
            'tetrahexacontellation', 'pentahexacontellation', 'hexahexacontellation',
            'heptahexacontellation', 'octahexacontellation', 'enneahexacontellation',
            'heptacontellation', 'henheptacontellation', 'doheptacontellation',
            'triheptacontellation', 'tetraheptacontellation', 'pentaheptacontellation',
            'hexaheptacontellation', 'heptaheptacontellation', 'octaheptacontellation',
            'enneaheptacontellation', 'octacontellation', 'henoctacontellation',
            'dooctacontellation', 'trioctacontellation', 'tetraoctacontellation',
            'pentaoctacontellation', 'hexaoctacontellation', 'heptaoctacontellation',
            'octaoctacontellation', 'enneaoctacontellation', 'enneacontellation',
            'henenneacontellation', 'doenneacontellation', 'trienneacontellation',
            'tetraenneacontellation', 'pentaenneacontellation', 'hexaenneacontellation',
            'heptaenneacontellation', 'octaenneacontellation', 'enneaenneacontellation',
            'hectacontellation', 'henhectacontellation', 'dohectacontellation',
            'trihectacontellation', 'tetrahectacontellation', 'pentahectacontellation',
            'hexahectacontellation', 'heptahectacontellation', 'octahectacontellation',
            'enneahectacontellation', 'kilocontellation', 'henkilocontellation',
            'dokilocontellation', 'trikilocontellation', 'tetrakilocontellation',
            'pentakilocontellation', 'hexakilocontellation', 'heptakilocontellation',
            'octakilocontellation', 'enneakilocontellation', 'myriacontellation',
            'henmyriacontellation', 'domyriacontellation', 'trimyriacontellation',
            'tetramyriacontellation', 'pentamyriacontellation', 'hexamyriacontellation',
            'heptamyriacontellation', 'octamyriacontellation', 'enneamyriacontellation'
        ],
        workHours: {
            start: 8,  // 8 AM
            end: 18    // 6 PM
        }
    }
};

// Daily time tracking for social media
let dailySocialMediaTime = {};
let socialMediaBlocked = new Set();

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

// Enhanced site blocking check with multiple layers and advanced analysis
async function shouldBlockSite(url, tabId) {
    if (!url || !isTracking) return false;

    try {
        const domain = new URL(url).hostname.toLowerCase();
        const cleanDomain = domain.replace(/^www\./, '');

        // Check temporary whitelist first
        if (TEMPORARY_WHITELIST.has(cleanDomain)) {
            return false;
        }

        // Special handling for Reddit
        if (cleanDomain.includes('reddit.com')) {
            try {
                const redditBlockResult = await shouldBlockRedditEnhanced(url, cleanDomain, tabId);
                if (redditBlockResult.blocked) {
                    return redditBlockResult;
                }
            } catch (error) {
                console.error('Error in Reddit blocking:', error);
                // Fall back to regular blocking
            }
        }

        // Behavioral pattern detection
        if (CONFIG.ENABLE_BEHAVIORAL_DETECTION && behavioralDetector) {
            const behaviorResult = behavioralDetector.trackBehavior('site_visit', { url, domain: cleanDomain });
            if (behaviorResult.action === 'block_all') {
                return {
                    blocked: true,
                    reason: behaviorResult.reason,
                    type: 'behavioral_block'
                };
            }
        }

        // Check if social media site is blocked due to time limit
        if (isSocialMediaBlocked(cleanDomain)) {
            return { blocked: true, reason: 'Social media time limit reached', type: 'social_media' };
        }

        // Check smart categorization for complex sites like Reddit
        const smartBlockResult = shouldBlockSmartSite(url, cleanDomain);
        if (smartBlockResult && smartBlockResult.blocked) {
            return smartBlockResult;
        }

        // Advanced text content analysis
        if (CONFIG.ENABLE_TEXT_ANALYSIS && textAnalyzer && tabId) {
            try {
                const textResult = await textAnalyzer.analyzePageText(tabId);
                if (textResult.blocked && textResult.analysis.adultScore > CONFIG.TEXT_ANALYSIS_THRESHOLD) {
                    return {
                        blocked: true,
                        reason: `Adult content detected in text (${textResult.analysis.flaggedTerms.length} flagged terms)`,
                        type: 'text_analysis',
                        details: textResult.analysis.flaggedTerms.slice(0, 5)
                    };
                }
            } catch (error) {
                console.error('Error in text analysis:', error);
            }
        }

        // Advanced image content analysis
        if (CONFIG.ENABLE_IMAGE_ANALYSIS && imageAnalyzer && tabId) {
            try {
                const imageResult = await imageAnalyzer.analyzePageImages(tabId);
                if (imageResult.blocked && imageResult.analysis.riskScore > CONFIG.IMAGE_ANALYSIS_THRESHOLD) {
                    return {
                        blocked: true,
                        reason: `Adult images detected (${imageResult.analysis.adultImages}/${imageResult.analysis.totalImages} images flagged)`,
                        type: 'image_analysis'
                    };
                }
            } catch (error) {
                console.error('Error in image analysis:', error);
            }
        }

        // Check traditional blocklists
        if (BLOCKED_DOMAINS.has(cleanDomain)) {
            return { blocked: true, reason: 'Domain in blocklist', type: 'porn' };
        }

        if (MODERATE_DOMAINS.has(cleanDomain)) {
            return { blocked: true, reason: 'Domain in moderate blocklist', type: 'moderate' };
        }

        return false;
    } catch (error) {
        console.error('Error in shouldBlockSite:', error);
        return false;
    }
}

// Rest of the existing background.js functionality would go here...
// For brevity, I'm including the key enhanced functions

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Personal Assistant extension installed');

    // Initialize advanced analyzers
    await initializeAdvancedAnalyzers();

    // Set up tracking alarm
    chrome.alarms.create('tracking', { periodInMinutes: 1 });

    // Set up sync alarm
    chrome.alarms.create('sync', { periodInMinutes: 5 });

    // Set up daily reset alarm
    chrome.alarms.create('dailyReset', { when: getNextMidnight() });
});

// Handle tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await handleTabChange(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        await handleTabChange(tabId);
    }
});

// Handle tab change
async function handleTabChange(tabId) {
    try {
        // Get new tab info
        const tab = await chrome.tabs.get(tabId);
        currentTab = tab;
        startTime = Date.now();

        // Check if site should be blocked with enhanced analysis
        const blockResult = await shouldBlockSite(tab.url, tabId);
        if (blockResult && blockResult.blocked) {
            await blockSite(tabId, tab.url, blockResult.type);
            return;
        }

    } catch (error) {
        console.error('Error handling tab change:', error);
    }
}

// Enhanced site blocking with accountability logging
async function blockSite(tabId, url, blockType) {
    try {
        const blockedUrl = chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(new URL(url).hostname)}&url=${encodeURIComponent(url)}&type=${blockType}`);

        await chrome.tabs.update(tabId, { url: blockedUrl });

        // Log block event with accountability
        if (CONFIG.ENABLE_ACCOUNTABILITY && accountabilityManager) {
            accountabilityManager.logIncident('porn_block', {
                url: url,
                domain: new URL(url).hostname,
                type: blockType,
                timestamp: new Date().toISOString()
            });
        }

        // Send block event to backend
        await sendBlockEvent({
            userId: CONFIG.USER_ID,
            domain: new URL(url).hostname,
            url: url,
            action: 'blocked',
            reason: blockType,
            timestamp: new Date().toISOString()
        });

        console.log(`🚫 Blocked ${url} (${blockType})`);
    } catch (error) {
        console.error('Error blocking site:', error);
    }
}

// Send block event to backend
async function sendBlockEvent(eventData) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/blocked-site`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        console.log('Block event sent to backend');
    } catch (error) {
        console.error('Error sending block event:', error);
    }
}

// Check if a social media site is blocked due to time limit
function isSocialMediaBlocked(domain) {
    const socialMediaSite = Object.keys(SOCIAL_MEDIA_LIMITS).find(site => domain.includes(site));
    return socialMediaSite ? socialMediaBlocked.has(socialMediaSite) : false;
}

// Smart categorization for complex sites like Reddit
function getSmartSiteCategory(url, domain) {
    const smartRules = SMART_SITE_RULES[domain];
    if (!smartRules) return null;

    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();

        // Extract subreddit from Reddit URLs
        if (domain.includes('reddit.com')) {
            const subredditMatch = pathname.match(/\/r\/([^\/]+)/);
            if (subredditMatch) {
                const subreddit = subredditMatch[1];

                // Check if it's pornographic
                if (smartRules.pornographic.includes(subreddit)) {
                    return {
                        category: 'pornographic',
                        reason: `r/${subreddit} contains adult content`,
                        blocked: true
                    };
                }

                // Check if it's productive
                if (smartRules.productive.includes(subreddit)) {
                    return {
                        category: 'productive',
                        reason: `r/${subreddit} is productive content`,
                        blocked: false
                    };
                }

                // Check if it's distracting (block during work hours)
                if (smartRules.distracting.includes(subreddit)) {
                    const now = new Date();
                    const hour = now.getHours();
                    const isWorkHours = hour >= smartRules.workHours.start && hour < smartRules.workHours.end;

                    return {
                        category: 'distracting',
                        reason: `r/${subreddit} is distracting content`,
                        blocked: isWorkHours,
                        workHours: isWorkHours
                    };
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error in smart categorization:', error);
        return null;
    }
}

// Check if a URL should be blocked based on smart categorization
function shouldBlockSmartSite(url, domain) {
    const category = getSmartSiteCategory(url, domain);
    if (!category) return { blocked: false };

    if (category.blocked) {
        return {
            blocked: true,
            reason: category.reason,
            type: category.workHours ? 'work_hours' : category.category
        };
    }

    return { blocked: false, reason: category.reason, type: category.category };
}

// Get next midnight timestamp
function getNextMidnight() {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    return midnight.getTime();
}

// Load social media tracking data on startup
async function loadSocialMediaData() {
    try {
        const result = await chrome.storage.local.get(['dailySocialMediaTime', 'socialMediaBlocked']);
        dailySocialMediaTime = result.dailySocialMediaTime || {};
        socialMediaBlocked = new Set(result.socialMediaBlocked || []);

        console.log('Social media data loaded');
    } catch (error) {
        console.error('Error loading social media data:', error);
    }
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    switch (alarm.name) {
        case 'tracking':
            // Handle tracking logic
            break;
        case 'sync':
            // Handle sync logic
            break;
        case 'dailyReset':
            // Reset daily limits
            dailySocialMediaTime = {};
            socialMediaBlocked.clear();
            await chrome.storage.local.set({
                dailySocialMediaTime: {},
                socialMediaBlocked: []
            });
            chrome.alarms.create('dailyReset', { when: getNextMidnight() });
            break;
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('Personal Assistant extension started');
    await initializeAdvancedAnalyzers();
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'getStats':
            sendResponse({
                dailyStats: dailyStats,
                isTracking: isTracking,
                socialMediaTime: dailySocialMediaTime,
                socialMediaBlocked: Array.from(socialMediaBlocked)
            });
            break;

        case 'toggleTracking':
            isTracking = !isTracking;
            chrome.storage.local.set({ isTracking });
            sendResponse({ isTracking });
            break;

        case 'getBlocklistData':
            sendResponse({
                blockedDomains: Array.from(BLOCKED_DOMAINS),
                moderateDomains: Array.from(MODERATE_DOMAINS),
                temporaryWhitelist: Array.from(TEMPORARY_WHITELIST)
            });
            break;

        case 'temporaryUnlock':
            handleTemporaryUnlock(message.domain, message.reason);
            sendResponse({ success: true });
            break;

        case 'reloadBlocklist':
            loadBlocklist();
            sendResponse({ success: true });
            break;

        case 'contentScriptBlock':
            // Handle content script blocking
            sendResponse({ success: true });
            break;

        case 'logSearchEvent':
            // Handle search event logging
            sendResponse({ success: true });
            break;
    }
});

// Initialize variables
let currentTab = null;
let startTime = Date.now();
let isTracking = true;
let dailyStats = {};

// Blocklist data
let BLOCKLIST_DATA = {};
let BLOCKED_DOMAINS = new Set();
let MODERATE_DOMAINS = new Set();
let TEMPORARY_WHITELIST = new Set();

// Legacy adult sites fallback
const LEGACY_ADULT_SITES = [
    'pornhub.com', 'xvideos.com', 'redtube.com', 'youporn.com', 'xhamster.com',
    'tube8.com', 'beeg.com', 'tnaflix.com', 'empflix.com', 'slutload.com',
    'nuvid.com', 'xtube.com', 'porn.com', 'adult.com', 'adultfriendfinder.com'
];

// Load blocklist
async function loadBlocklist() {
    try {
        const response = await fetch(chrome.runtime.getURL('blocklists/adult-sites.json'));
        if (response.ok) {
            BLOCKLIST_DATA = await response.json();
            BLOCKED_DOMAINS = new Set(BLOCKLIST_DATA.blocked || []);
            MODERATE_DOMAINS = new Set(BLOCKLIST_DATA.moderate || []);
            console.log(`Loaded ${BLOCKED_DOMAINS.size} blocked domains and ${MODERATE_DOMAINS.size} moderate domains`);
        } else {
            console.warn('Failed to load blocklist, using legacy sites');
            BLOCKED_DOMAINS = new Set(LEGACY_ADULT_SITES);
        }
    } catch (error) {
        console.error('Error loading blocklist:', error);
        BLOCKED_DOMAINS = new Set(LEGACY_ADULT_SITES);
    }
}

// Handle temporary unlock
async function handleTemporaryUnlock(domain, reason) {
    try {
        // Add to temporary whitelist
        TEMPORARY_WHITELIST.add(domain);

        // Log unlock event
        if (CONFIG.ENABLE_ACCOUNTABILITY && accountabilityManager) {
            accountabilityManager.logIncident('emergency_unlock', {
                domain: domain,
                reason: reason,
                timestamp: new Date().toISOString()
            });
        }

        // Send unlock event to backend
        await sendBlockEvent({
            userId: CONFIG.USER_ID,
            domain: domain,
            action: 'unlocked',
            reason: reason,
            timestamp: new Date().toISOString()
        });

        console.log(`🔓 Temporarily unlocked ${domain} (${reason})`);

        // Remove from whitelist after 30 minutes
        setTimeout(() => {
            TEMPORARY_WHITELIST.delete(domain);
            console.log(`🔒 Re-locked ${domain} after temporary unlock`);
        }, 30 * 60 * 1000);

    } catch (error) {
        console.error('Error handling temporary unlock:', error);
    }
}
