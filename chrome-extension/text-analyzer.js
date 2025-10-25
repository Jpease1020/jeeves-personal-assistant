// Advanced text content analysis for porn detection
// Analyzes page text, titles, and descriptions for adult content

class TextContentAnalyzer {
    constructor() {
        this.adultKeywords = {
            // Explicit terms (high weight)
            explicit: [
                'porn', 'pornography', 'xxx', 'adult', 'nsfw', 'sex', 'sexual',
                'nude', 'naked', 'nudity', 'nakedness', 'bare', 'exposed',
                'breast', 'boob', 'boobs', 'tits', 'titties', 'nipple',
                'ass', 'butt', 'buttock', 'buttocks', 'anus', 'anal',
                'pussy', 'vagina', 'clitoris', 'penis', 'dick', 'cock',
                'fuck', 'fucking', 'fucked', 'fucker', 'fuckable',
                'masturbat', 'masturbation', 'masturbating', 'masturbate',
                'orgasm', 'cum', 'cumming', 'sperm', 'ejaculat',
                'hentai', 'rule34', 'yiff', 'furry', 'futanari',
                'milf', 'cougar', 'teen', 'barely legal', 'young',
                'incest', 'stepmom', 'stepsis', 'stepbro', 'family',
                'threesome', 'orgy', 'gangbang', 'swinger', 'wife swap',
                'cuckold', 'hotwife', 'cheating', 'affair', 'betrayal',
                'bdsm', 'bondage', 'domination', 'submission', 'fetish',
                'leather', 'latex', 'rubber', 'foot', 'feet', 'toe',
                'spanking', 'whip', 'collar', 'chain', 'rope', 'handcuff',
                'roleplay', 'cosplay', 'uniform', 'nurse', 'teacher',
                'escort', 'prostitute', 'hooker', 'massage', 'brothel',
                'strip', 'club', 'cam', 'girl', 'webcam', 'show',
                'onlyfans', 'leak', 'sugar daddy', 'sugar mommy'
            ],

            // Moderate terms (medium weight)
            moderate: [
                'sexy', 'hot', 'attractive', 'beautiful', 'gorgeous',
                'seductive', 'provocative', 'alluring', 'tempting',
                'lingerie', 'underwear', 'bra', 'panties', 'thong',
                'bikini', 'swimsuit', 'beachwear', 'intimate',
                'romantic', 'passionate', 'sensual', 'erotic',
                'dating', 'hookup', 'one night stand', 'casual sex',
                'friends with benefits', 'fwb', 'booty call'
            ],

            // Soft terms (low weight)
            soft: [
                'model', 'fashion', 'beauty', 'glamour', 'style',
                'photography', 'art', 'artistic', 'creative',
                'fitness', 'workout', 'gym', 'exercise', 'yoga',
                'health', 'wellness', 'self-care', 'spa', 'massage'
            ]
        };

        this.contextPatterns = [
            // Age-related patterns
            /(\d+)\s*(year|yr)s?\s*old/i,
            /age\s*(\d+)/i,
            /(\d+)\s*yo/i,

            // Size-related patterns
            /(\d+)\s*(inch|in|cm|mm)/i,
            /size\s*(\d+)/i,
            /big\s*(dick|cock|penis|breast|boob|ass)/i,

            // Action patterns
            /(fuck|suck|lick|touch|feel|grab|squeeze|rub|stroke)/i,
            /(hard|rough|gentle|slow|fast|quick|deep|shallow)/i,

            // Location patterns
            /(bedroom|bed|shower|bathroom|kitchen|office|car|public)/i,
            /(outdoor|indoor|beach|pool|gym|hotel|motel)/i
        ];
    }

    // Analyze page text for adult content
    async analyzePageText(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: this.scanTextForAdultContent
            });

            const analysis = results[0]?.result || { adultScore: 0, totalWords: 0, flaggedTerms: [] };

            // Block page if adult content detected
            if (analysis.adultScore > 0.3) {
                return {
                    blocked: true,
                    reason: `Adult content detected in text (${analysis.flaggedTerms.length} flagged terms)`,
                    type: 'text_analysis',
                    details: analysis.flaggedTerms.slice(0, 5) // Show first 5 terms
                };
            }

            return { blocked: false, analysis };
        } catch (error) {
            console.error('Error analyzing page text:', error);
            return { blocked: false, error: error.message };
        }
    }

    // Function to inject into page to analyze text
    scanTextForAdultContent() {
        const textContent = document.body.textContent || '';
        const title = document.title || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const allText = `${title} ${metaDescription} ${textContent}`.toLowerCase();

        const words = allText.split(/\s+/);
        const totalWords = words.length;

        let adultScore = 0;
        const flaggedTerms = [];

        // Check for explicit terms (high weight)
        this.adultKeywords.explicit.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = allText.match(regex);
            if (matches) {
                adultScore += matches.length * 0.1; // High weight
                flaggedTerms.push(...matches.slice(0, 3)); // Limit duplicates
            }
        });

        // Check for moderate terms (medium weight)
        this.adultKeywords.moderate.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = allText.match(regex);
            if (matches) {
                adultScore += matches.length * 0.05; // Medium weight
                flaggedTerms.push(...matches.slice(0, 2));
            }
        });

        // Check for soft terms (low weight)
        this.adultKeywords.soft.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = allText.match(regex);
            if (matches) {
                adultScore += matches.length * 0.02; // Low weight
                flaggedTerms.push(...matches.slice(0, 1));
            }
        });

        // Check for context patterns
        this.contextPatterns.forEach(pattern => {
            const matches = allText.match(pattern);
            if (matches) {
                adultScore += matches.length * 0.03; // Context weight
                flaggedTerms.push(...matches.slice(0, 2));
            }
        });

        // Normalize score by total words
        const normalizedScore = totalWords > 0 ? adultScore / (totalWords / 100) : 0;

        return {
            adultScore: normalizedScore,
            totalWords: totalWords,
            flaggedTerms: [...new Set(flaggedTerms)] // Remove duplicates
        };
    }

    // Analyze specific text content
    analyzeText(text) {
        const lowerText = text.toLowerCase();
        let score = 0;
        const flaggedTerms = [];

        // Check each category
        Object.entries(this.adultKeywords).forEach(([category, terms]) => {
            const weight = category === 'explicit' ? 0.1 :
                category === 'moderate' ? 0.05 : 0.02;

            terms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                const matches = lowerText.match(regex);
                if (matches) {
                    score += matches.length * weight;
                    flaggedTerms.push(...matches.slice(0, 2));
                }
            });
        });

        return {
            score: score,
            flaggedTerms: [...new Set(flaggedTerms)],
            isAdult: score > 0.2
        };
    }
}

// Usage in blocking logic
const textAnalyzer = new TextContentAnalyzer();

// Enhanced blocking with text analysis
async function enhancedTextBlocking(url, tabId) {
    const result = await textAnalyzer.analyzePageText(tabId);
    if (result.blocked) {
        return result;
    }

    return { blocked: false };
}
