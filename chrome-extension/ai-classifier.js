// AI-powered content classification using local models
// This would use lightweight AI models to classify content

class AIContentClassifier {
    constructor() {
        this.models = {
            // Text classification model
            textClassifier: null,

            // Image classification model
            imageClassifier: null,

            // URL classification model
            urlClassifier: null
        };

        this.classificationCache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    // Initialize AI models (would load actual models in production)
    async initializeModels() {
        try {
            // In a real implementation, you'd load TensorFlow.js models here
            // For now, we'll use rule-based classification

            console.log('AI models initialized (rule-based fallback)');
            return true;
        } catch (error) {
            console.error('Error initializing AI models:', error);
            return false;
        }
    }

    // Classify URL using AI
    async classifyURL(url) {
        try {
            // Check cache first
            const cached = this.classificationCache.get(url);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }

            // Extract features from URL
            const features = this.extractURLFeatures(url);

            // Use AI model to classify
            const classification = await this.runURLClassification(features);

            // Cache result
            this.classificationCache.set(url, {
                result: classification,
                timestamp: Date.now()
            });

            return classification;
        } catch (error) {
            console.error('Error classifying URL:', error);
            return { category: 'unknown', confidence: 0 };
        }
    }

    // Extract features from URL for classification
    extractURLFeatures(url) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        const path = urlObj.pathname.toLowerCase();
        const query = urlObj.search.toLowerCase();

        return {
            domain: domain,
            path: path,
            query: query,
            subdomain: domain.split('.')[0],
            tld: domain.split('.').pop(),
            pathLength: path.length,
            queryLength: query.length,
            hasNumbers: /\d/.test(path + query),
            hasSpecialChars: /[^a-z0-9\/\-\.]/.test(path + query),
            pathSegments: path.split('/').filter(s => s.length > 0),
            queryParams: new URLSearchParams(urlObj.search)
        };
    }

    // Run URL classification using AI model
    async runURLClassification(features) {
        // In a real implementation, this would use a trained model
        // For now, we'll use rule-based classification

        let score = 0;
        let category = 'safe';
        let confidence = 0;

        // Domain-based classification
        const adultDomains = [
            'pornhub', 'xvideos', 'redtube', 'youporn', 'xhamster', 'tube8',
            'porn', 'xxx', 'adult', 'nsfw', 'sex', 'nude', 'naked'
        ];

        if (adultDomains.some(d => features.domain.includes(d))) {
            score = 0.9;
            category = 'adult';
            confidence = 0.95;
        }
        // Path-based classification
        else if (features.path.includes('porn') || features.path.includes('xxx')) {
            score = 0.8;
            category = 'adult';
            confidence = 0.85;
        }
        // Query-based classification
        else if (features.query.includes('porn') || features.query.includes('xxx')) {
            score = 0.7;
            category = 'adult';
            confidence = 0.75;
        }
        // Subdomain-based classification
        else if (features.subdomain.includes('porn') || features.subdomain.includes('xxx')) {
            score = 0.6;
            category = 'adult';
            confidence = 0.65;
        }

        return {
            category: category,
            confidence: confidence,
            score: score,
            features: features
        };
    }

    // Classify text content using AI
    async classifyText(text) {
        try {
            // Check cache first
            const textHash = this.hashText(text);
            const cached = this.classificationCache.get(textHash);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.result;
            }

            // Extract features from text
            const features = this.extractTextFeatures(text);

            // Use AI model to classify
            const classification = await this.runTextClassification(features);

            // Cache result
            this.classificationCache.set(textHash, {
                result: classification,
                timestamp: Date.now()
            });

            return classification;
        } catch (error) {
            console.error('Error classifying text:', error);
            return { category: 'unknown', confidence: 0 };
        }
    }

    // Extract features from text for classification
    extractTextFeatures(text) {
        const words = text.toLowerCase().split(/\s+/);
        const sentences = text.split(/[.!?]+/);

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
            uniqueWords: new Set(words).size,
            wordFrequency: this.getWordFrequency(words),
            sentiment: this.analyzeSentiment(text),
            readability: this.calculateReadability(text)
        };
    }

    // Get word frequency analysis
    getWordFrequency(words) {
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        return frequency;
    }

    // Analyze sentiment (simplified)
    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting'];

        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            positiveCount += (text.match(regex) || []).length;
        });

        negativeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            negativeCount += (text.match(regex) || []).length;
        });

        return {
            positive: positiveCount,
            negative: negativeCount,
            score: (positiveCount - negativeCount) / (positiveCount + negativeCount + 1)
        };
    }

    // Calculate readability score (simplified)
    calculateReadability(text) {
        const words = text.split(/\s+/);
        const sentences = text.split(/[.!?]+/);
        const syllables = this.countSyllables(text);

        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;

        // Simplified Flesch Reading Ease
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

        return {
            score: score,
            level: score > 80 ? 'easy' : score > 60 ? 'medium' : 'difficult'
        };
    }

    // Count syllables in text (simplified)
    countSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        let totalSyllables = 0;

        words.forEach(word => {
            // Remove punctuation
            word = word.replace(/[^a-z]/g, '');

            // Count vowel groups
            const vowelGroups = word.match(/[aeiouy]+/g);
            if (vowelGroups) {
                totalSyllables += vowelGroups.length;
            }

            // Handle silent 'e'
            if (word.endsWith('e') && word.length > 1) {
                totalSyllables--;
            }

            // Minimum 1 syllable per word
            if (totalSyllables < 1) totalSyllables = 1;
        });

        return totalSyllables;
    }

    // Run text classification using AI model
    async runTextClassification(features) {
        // In a real implementation, this would use a trained model
        // For now, we'll use rule-based classification

        let score = 0;
        let category = 'safe';
        let confidence = 0;

        // Check for adult keywords
        const adultKeywords = ['porn', 'xxx', 'adult', 'nsfw', 'sex', 'nude', 'naked'];
        const text = features.wordFrequency;

        adultKeywords.forEach(keyword => {
            if (text[keyword]) {
                score += text[keyword] * 0.1;
            }
        });

        if (score > 0.3) {
            category = 'adult';
            confidence = Math.min(score, 0.9);
        } else if (score > 0.1) {
            category = 'moderate';
            confidence = score * 0.5;
        }

        return {
            category: category,
            confidence: confidence,
            score: score,
            features: features
        };
    }

    // Hash text for caching
    hashText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Clear cache
    clearCache() {
        this.classificationCache.clear();
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.classificationCache.size,
            entries: Array.from(this.classificationCache.keys())
        };
    }
}

// Usage in blocking logic
const aiClassifier = new AIContentClassifier();

// Enhanced blocking with AI classification
async function enhancedAIClassification(url, text) {
    const urlClassification = await aiClassifier.classifyURL(url);
    const textClassification = text ? await aiClassifier.classifyText(text) : null;

    // Combine classifications
    let finalScore = urlClassification.score;
    let finalCategory = urlClassification.category;
    let finalConfidence = urlClassification.confidence;

    if (textClassification && textClassification.score > 0) {
        finalScore = Math.max(finalScore, textClassification.score);
        if (textClassification.category === 'adult' && finalCategory !== 'adult') {
            finalCategory = textClassification.category;
            finalConfidence = textClassification.confidence;
        }
    }

    if (finalCategory === 'adult' && finalConfidence > 0.7) {
        return {
            blocked: true,
            reason: `AI detected adult content (confidence: ${(finalConfidence * 100).toFixed(1)}%)`,
            type: 'ai_classification',
            details: {
                urlClassification,
                textClassification,
                finalScore,
                finalConfidence
            }
        };
    }

    return { blocked: false, classification: { finalCategory, finalConfidence } };
}
