// Behavioral pattern detection for porn usage
// Tracks user behavior patterns that indicate porn-seeking behavior

class BehavioralPatternDetector {
    constructor() {
        this.behaviorPatterns = {
            // Rapid navigation patterns
            rapidNavigation: {
                threshold: 5, // 5 sites in 30 seconds
                timeWindow: 30000, // 30 seconds
                weight: 0.3
            },

            // Search pattern analysis
            searchPatterns: {
                explicitSearches: 0.4,
                moderateSearches: 0.2,
                suspiciousSearches: 0.1
            },

            // Time-based patterns
            timePatterns: {
                lateNight: { start: 22, end: 6, weight: 0.2 },
                workHours: { start: 9, end: 17, weight: 0.3 },
                weekend: { weight: 0.1 }
            },

            // Site interaction patterns
            sitePatterns: {
                quickBounces: { threshold: 3, timeWindow: 10000, weight: 0.2 },
                repeatedVisits: { threshold: 3, timeWindow: 300000, weight: 0.3 },
                incognitoUsage: { weight: 0.4 }
            }
        };

        this.userBehavior = {
            recentSites: [],
            searchHistory: [],
            navigationPatterns: [],
            timeSpent: {},
            riskScore: 0
        };

        this.riskThresholds = {
            low: 0.3,
            medium: 0.6,
            high: 0.8,
            critical: 1.0
        };
    }

    // Track user behavior
    trackBehavior(action, data) {
        const timestamp = Date.now();

        switch (action) {
            case 'site_visit':
                this.trackSiteVisit(data.url, data.domain, timestamp);
                break;
            case 'search':
                this.trackSearch(data.query, data.engine, timestamp);
                break;
            case 'navigation':
                this.trackNavigation(data.from, data.to, timestamp);
                break;
            case 'time_spent':
                this.trackTimeSpent(data.domain, data.duration, timestamp);
                break;
        }

        // Update risk score
        this.updateRiskScore();

        // Check for concerning patterns
        return this.checkBehavioralPatterns();
    }

    trackSiteVisit(url, domain, timestamp) {
        this.userBehavior.recentSites.push({
            url,
            domain,
            timestamp,
            type: this.classifySite(domain)
        });

        // Keep only last 50 sites
        if (this.userBehavior.recentSites.length > 50) {
            this.userBehavior.recentSites = this.userBehavior.recentSites.slice(-50);
        }
    }

    trackSearch(query, engine, timestamp) {
        const analysis = this.analyzeSearchQuery(query);

        this.userBehavior.searchHistory.push({
            query,
            engine,
            timestamp,
            analysis
        });

        // Keep only last 100 searches
        if (this.userBehavior.searchHistory.length > 100) {
            this.userBehavior.searchHistory = this.userBehavior.searchHistory.slice(-100);
        }
    }

    trackNavigation(from, to, timestamp) {
        this.userBehavior.navigationPatterns.push({
            from,
            to,
            timestamp,
            duration: timestamp - (this.userBehavior.navigationPatterns[this.userBehavior.navigationPatterns.length - 1]?.timestamp || timestamp)
        });

        // Keep only last 200 navigations
        if (this.userBehavior.navigationPatterns.length > 200) {
            this.userBehavior.navigationPatterns = this.userBehavior.navigationPatterns.slice(-200);
        }
    }

    trackTimeSpent(domain, duration, timestamp) {
        if (!this.userBehavior.timeSpent[domain]) {
            this.userBehavior.timeSpent[domain] = 0;
        }
        this.userBehavior.timeSpent[domain] += duration;
    }

    // Analyze search query for adult content
    analyzeSearchQuery(query) {
        const lowerQuery = query.toLowerCase();
        let score = 0;
        let category = 'safe';

        // Check for explicit terms
        const explicitTerms = ['porn', 'xxx', 'adult', 'nsfw', 'sex', 'nude', 'naked'];
        if (explicitTerms.some(term => lowerQuery.includes(term))) {
            score = 0.8;
            category = 'explicit';
        }
        // Check for moderate terms
        else if (['sexy', 'hot', 'attractive', 'beautiful', 'lingerie', 'bikini'].some(term => lowerQuery.includes(term))) {
            score = 0.4;
            category = 'moderate';
        }
        // Check for suspicious patterns
        else if (this.detectSuspiciousPatterns(lowerQuery)) {
            score = 0.2;
            category = 'suspicious';
        }

        return { score, category };
    }

    detectSuspiciousPatterns(query) {
        const suspiciousPatterns = [
            // Age-related searches
            /\d+\s*(year|yr)s?\s*old/i,
            /age\s*\d+/i,
            /\d+\s*yo/i,

            // Size-related searches
            /\d+\s*(inch|in|cm)/i,
            /big\s*(dick|cock|breast|boob|ass)/i,

            // Action-related searches
            /(fuck|suck|lick|touch|feel|grab|squeeze|rub|stroke)/i,
            /(hard|rough|gentle|slow|fast|quick|deep|shallow)/i,

            // Location-related searches
            /(bedroom|bed|shower|bathroom|kitchen|office|car|public)/i,
            /(outdoor|indoor|beach|pool|gym|hotel|motel)/i,

            // Relationship-related searches
            /(stepmom|stepsis|stepbro|family|incest|cheating|affair)/i,
            /(threesome|orgy|gangbang|swinger|wife swap)/i,

            // Fetish-related searches
            /(bdsm|bondage|domination|submission|fetish|leather|latex)/i,
            /(spanking|whip|collar|chain|rope|handcuff)/i,

            // Roleplay-related searches
            /(roleplay|cosplay|uniform|nurse|teacher|escort|prostitute)/i,
            /(strip|club|cam|girl|webcam|show|onlyfans)/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(query));
    }

    // Classify site type
    classifySite(domain) {
        const adultDomains = ['pornhub', 'xvideos', 'redtube', 'youporn', 'xhamster', 'tube8'];
        const moderateDomains = ['reddit', 'tumblr', 'imgur', 'deviantart', 'flickr'];
        const socialDomains = ['facebook', 'instagram', 'twitter', 'tiktok', 'snapchat'];

        if (adultDomains.some(d => domain.includes(d))) return 'adult';
        if (moderateDomains.some(d => domain.includes(d))) return 'moderate';
        if (socialDomains.some(d => domain.includes(d))) return 'social';
        return 'unknown';
    }

    // Update risk score based on behavior
    updateRiskScore() {
        let riskScore = 0;

        // Check recent site visits
        const recentSites = this.userBehavior.recentSites.slice(-10);
        const adultSites = recentSites.filter(site => site.type === 'adult').length;
        riskScore += (adultSites / 10) * 0.4;

        // Check search patterns
        const recentSearches = this.userBehavior.searchHistory.slice(-20);
        const explicitSearches = recentSearches.filter(search => search.analysis.category === 'explicit').length;
        const moderateSearches = recentSearches.filter(search => search.analysis.category === 'moderate').length;
        riskScore += (explicitSearches / 20) * 0.3;
        riskScore += (moderateSearches / 20) * 0.1;

        // Check navigation patterns
        const rapidNavigations = this.checkRapidNavigation();
        riskScore += rapidNavigations * 0.2;

        // Check time patterns
        const timeRisk = this.checkTimePatterns();
        riskScore += timeRisk * 0.1;

        this.userBehavior.riskScore = Math.min(riskScore, 1.0);
    }

    checkRapidNavigation() {
        const now = Date.now();
        const recentNavigations = this.userBehavior.navigationPatterns.filter(
            nav => now - nav.timestamp < 30000 // Last 30 seconds
        );

        return recentNavigations.length > 5 ? 0.5 : 0;
    }

    checkTimePatterns() {
        const hour = new Date().getHours();
        const day = new Date().getDay();

        // Late night usage
        if (hour >= 22 || hour <= 6) {
            return 0.3;
        }

        // Work hours usage
        if (hour >= 9 && hour <= 17) {
            return 0.2;
        }

        // Weekend usage
        if (day === 0 || day === 6) {
            return 0.1;
        }

        return 0;
    }

    // Check for concerning behavioral patterns
    checkBehavioralPatterns() {
        const riskLevel = this.getRiskLevel();

        if (riskLevel === 'critical') {
            return {
                action: 'block_all',
                reason: 'Critical risk level detected - blocking all adult content',
                riskScore: this.userBehavior.riskScore
            };
        } else if (riskLevel === 'high') {
            return {
                action: 'enhanced_blocking',
                reason: 'High risk level detected - enhanced blocking enabled',
                riskScore: this.userBehavior.riskScore
            };
        } else if (riskLevel === 'medium') {
            return {
                action: 'monitor',
                reason: 'Medium risk level detected - increased monitoring',
                riskScore: this.userBehavior.riskScore
            };
        }

        return {
            action: 'normal',
            reason: 'Normal risk level',
            riskScore: this.userBehavior.riskScore
        };
    }

    getRiskLevel() {
        const score = this.userBehavior.riskScore;

        if (score >= this.riskThresholds.critical) return 'critical';
        if (score >= this.riskThresholds.high) return 'high';
        if (score >= this.riskThresholds.medium) return 'medium';
        return 'low';
    }

    // Get behavior summary
    getBehaviorSummary() {
        return {
            riskScore: this.userBehavior.riskScore,
            riskLevel: this.getRiskLevel(),
            recentSites: this.userBehavior.recentSites.slice(-5),
            recentSearches: this.userBehavior.searchHistory.slice(-5),
            timeSpent: this.userBehavior.timeSpent
        };
    }
}

// Usage in blocking logic
const behaviorDetector = new BehavioralPatternDetector();

// Enhanced blocking with behavioral analysis
function enhancedBehavioralBlocking(url, domain) {
    const behaviorResult = behaviorDetector.trackBehavior('site_visit', { url, domain });

    if (behaviorResult.action === 'block_all') {
        return {
            blocked: true,
            reason: behaviorResult.reason,
            type: 'behavioral_block'
        };
    }

    return { blocked: false, behavior: behaviorResult };
}
