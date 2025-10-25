// Enhanced Reddit blocking using Reddit's own content ratings
// This would make the system more accurate and self-updating

class RedditContentAnalyzer {
    constructor() {
        this.redditApiBase = 'https://www.reddit.com';
        this.cache = new Map(); // Cache subreddit info
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get subreddit information from Reddit API
    async getSubredditInfo(subreddit) {
        // Check cache first
        const cached = this.cache.get(subreddit);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.redditApiBase}/r/${subreddit}/about.json`);
            const data = await response.json();

            if (data.error) {
                console.log(`Subreddit ${subreddit} not found or private`);
                return null;
            }

            const subredditData = data.data;
            const info = {
                name: subredditData.display_name,
                title: subredditData.title,
                description: subredditData.description,
                over18: subredditData.over18, // NSFW flag
                subscribers: subredditData.subscribers,
                activeUsers: subredditData.active_user_count,
                created: subredditData.created_utc,
                language: subredditData.lang,
                category: subredditData.category,
                // Additional content indicators
                contentTags: this.extractContentTags(subredditData),
                riskLevel: this.calculateRiskLevel(subredditData)
            };

            // Cache the result
            this.cache.set(subreddit, {
                data: info,
                timestamp: Date.now()
            });

            return info;
        } catch (error) {
            console.error(`Error fetching subreddit ${subreddit}:`, error);
            return null;
        }
    }

    // Extract content tags from subreddit data
    extractContentTags(subredditData) {
        const tags = [];
        const text = `${subredditData.title} ${subredditData.description} ${subredditData.public_description}`.toLowerCase();

        // Adult content indicators
        if (subredditData.over18) tags.push('nsfw');
        if (text.includes('porn') || text.includes('adult') || text.includes('sexual')) tags.push('adult');
        if (text.includes('nude') || text.includes('naked')) tags.push('nudity');
        if (text.includes('hentai') || text.includes('anime')) tags.push('anime-adult');

        // Violence indicators
        if (text.includes('violence') || text.includes('gore') || text.includes('blood')) tags.push('violence');
        if (text.includes('fight') || text.includes('combat')) tags.push('combat');

        // Drug indicators
        if (text.includes('drug') || text.includes('weed') || text.includes('cannabis')) tags.push('drugs');
        if (text.includes('alcohol') || text.includes('drinking')) tags.push('alcohol');

        // Gaming indicators
        if (text.includes('game') || text.includes('gaming') || text.includes('play')) tags.push('gaming');

        // Educational indicators
        if (text.includes('learn') || text.includes('education') || text.includes('study')) tags.push('educational');
        if (text.includes('programming') || text.includes('coding') || text.includes('tech')) tags.push('technology');
        if (text.includes('science') || text.includes('research')) tags.push('science');

        return tags;
    }

    // Calculate risk level based on multiple factors
    calculateRiskLevel(subredditData) {
        let riskScore = 0;

        // NSFW flag adds significant risk
        if (subredditData.over18) riskScore += 50;

        // Small subscriber count might indicate niche/adult content
        if (subredditData.subscribers < 1000) riskScore += 10;

        // Check description for adult keywords
        const text = `${subredditData.title} ${subredditData.description}`.toLowerCase();
        const adultKeywords = ['porn', 'sex', 'nude', 'adult', 'nsfw', 'hentai', 'rule34'];
        adultKeywords.forEach(keyword => {
            if (text.includes(keyword)) riskScore += 15;
        });

        // Determine risk level
        if (riskScore >= 50) return 'high';      // Definitely block
        if (riskScore >= 25) return 'medium';   // Block during work hours
        if (riskScore >= 10) return 'low';      // Allow with time limits
        return 'safe';                          // Always allow
    }

    // Enhanced blocking decision using Reddit's own data
    async shouldBlockSubreddit(subreddit, currentTime) {
        const info = await this.getSubredditInfo(subreddit);
        if (!info) {
            // If we can't get info, use conservative approach
            return { blocked: true, reason: 'Unknown subreddit - blocked for safety' };
        }

        // High risk - always block
        if (info.riskLevel === 'high') {
            return {
                blocked: true,
                reason: `NSFW content detected (${info.contentTags.join(', ')})`,
                type: 'porn'
            };
        }

        // Medium risk - block during work hours
        if (info.riskLevel === 'medium') {
            const hour = currentTime.getHours();
            const isWorkHours = hour >= 8 && hour < 18;

            if (isWorkHours) {
                return {
                    blocked: true,
                    reason: `Potentially distracting content during work hours`,
                    type: 'work_hours'
                };
            }
        }

        // Low risk or safe - allow with appropriate limits
        return {
            blocked: false,
            reason: `Content appears safe (${info.contentTags.join(', ')})`,
            type: info.riskLevel === 'low' ? 'distracting' : 'productive'
        };
    }

    // Get time limits based on content analysis
    getTimeLimits(subredditInfo) {
        if (subredditInfo.riskLevel === 'high') return 0;        // No time allowed
        if (subredditInfo.riskLevel === 'medium') return 15;     // 15 minutes
        if (subredditInfo.riskLevel === 'low') return 30;        // 30 minutes
        return 60;                                               // 60 minutes for safe content
    }
}

// Usage example:
const redditAnalyzer = new RedditContentAnalyzer();

// This would replace our hardcoded lists with dynamic analysis
async function enhancedRedditBlocking(url) {
    const subredditMatch = url.match(/\/r\/([^\/]+)/);
    if (!subredditMatch) return false;

    const subreddit = subredditMatch[1];
    const currentTime = new Date();

    const result = await redditAnalyzer.shouldBlockSubreddit(subreddit, currentTime);
    return result;
}
