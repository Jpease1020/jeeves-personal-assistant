// Advanced image content analysis for porn detection
// This would analyze images on web pages to detect adult content

class ImageContentAnalyzer {
    constructor() {
        this.adultImagePatterns = [
            // Skin tone detection patterns
            'skin-tone-ratio',
            'exposed-skin-percentage',
            'nude-detection',

            // Body part detection
            'breast-detection',
            'genital-detection',
            'buttock-detection',

            // Pose analysis
            'sexual-poses',
            'intimate-positions',
            'suggestive-poses'
        ];

        this.safeImagePatterns = [
            'face-only',
            'clothing-present',
            'professional-photo',
            'artistic-nude',
            'medical-image'
        ];
    }

    // Analyze images on a webpage for adult content
    async analyzePageImages(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: this.scanImagesForAdultContent
            });

            const analysis = results[0]?.result || { adultImages: 0, totalImages: 0, riskScore: 0 };

            // Block page if adult content detected
            if (analysis.riskScore > 0.7) {
                return {
                    blocked: true,
                    reason: `Adult images detected (${analysis.adultImages}/${analysis.totalImages} images flagged)`,
                    type: 'image_analysis'
                };
            }

            return { blocked: false, analysis };
        } catch (error) {
            console.error('Error analyzing page images:', error);
            return { blocked: false, error: error.message };
        }
    }

    // Function to inject into page to analyze images
    scanImagesForAdultContent() {
        const images = Array.from(document.querySelectorAll('img'));
        let adultImageCount = 0;
        let totalImages = images.length;

        images.forEach(img => {
            try {
                // Check image dimensions (porn images often have specific ratios)
                const aspectRatio = img.naturalWidth / img.naturalHeight;

                // Check for common porn image characteristics
                const isLikelyAdult = this.analyzeImageCharacteristics(img, aspectRatio);

                if (isLikelyAdult) {
                    adultImageCount++;
                    // Hide the image
                    img.style.display = 'none';
                    img.style.visibility = 'hidden';
                }
            } catch (error) {
                // Ignore errors for individual images
            }
        });

        const riskScore = totalImages > 0 ? adultImageCount / totalImages : 0;

        return {
            adultImages: adultImageCount,
            totalImages: totalImages,
            riskScore: riskScore
        };
    }

    analyzeImageCharacteristics(img, aspectRatio) {
        // Check image dimensions
        const isPortrait = aspectRatio < 0.8; // Common for porn images
        const isSquare = aspectRatio > 0.9 && aspectRatio < 1.1;

        // Check image source patterns
        const src = img.src.toLowerCase();
        const adultKeywords = [
            'porn', 'nude', 'naked', 'sex', 'adult', 'nsfw',
            'breast', 'boob', 'ass', 'butt', 'pussy', 'dick',
            'cock', 'penis', 'vagina', 'hentai', 'rule34'
        ];

        const hasAdultKeywords = adultKeywords.some(keyword => src.includes(keyword));

        // Check alt text
        const alt = (img.alt || '').toLowerCase();
        const hasAdultAlt = adultKeywords.some(keyword => alt.includes(keyword));

        // Check surrounding text context
        const context = this.getImageContext(img);
        const hasAdultContext = adultKeywords.some(keyword => context.includes(keyword));

        // Scoring system
        let score = 0;
        if (hasAdultKeywords) score += 0.4;
        if (hasAdultAlt) score += 0.3;
        if (hasAdultContext) score += 0.2;
        if (isPortrait) score += 0.1;

        return score > 0.5; // Threshold for adult content
    }

    getImageContext(img) {
        // Get text around the image
        const parent = img.parentElement;
        if (!parent) return '';

        const text = parent.textContent || '';
        return text.toLowerCase();
    }
}

// Usage in blocking logic
const imageAnalyzer = new ImageContentAnalyzer();

// Enhanced blocking with image analysis
async function enhancedImageBlocking(url, tabId) {
    // Only analyze images on suspicious sites
    const suspiciousDomains = ['imgur.com', 'reddit.com', 'tumblr.com', 'deviantart.com'];
    const domain = new URL(url).hostname.toLowerCase();

    if (suspiciousDomains.some(d => domain.includes(d))) {
        const result = await imageAnalyzer.analyzePageImages(tabId);
        if (result.blocked) {
            return result;
        }
    }

    return { blocked: false };
}
