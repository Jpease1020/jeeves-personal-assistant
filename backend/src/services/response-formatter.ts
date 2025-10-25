/**
 * Response Formatter - Ensures consistent, clean formatting for all AI responses
 * Based on ChatGPT best practices: Markdown structure, clear sections, proper lists
 */

export interface FormattedResponse {
    content: string;
    type: 'briefing' | 'routine' | 'task' | 'general' | 'check-in';
    hasData: boolean;
    dataSources: string[];
}

export class ResponseFormatter {

    /**
     * Format any AI response with consistent structure
     */
    static formatResponse(rawResponse: string, type: 'briefing' | 'routine' | 'task' | 'general' | 'check-in' = 'general'): FormattedResponse {
        let formatted = rawResponse;

        // Remove technical brackets and system messages
        formatted = this.removeTechnicalJargon(formatted);

        // Apply type-specific formatting
        switch (type) {
            case 'briefing':
                formatted = this.formatBriefing(formatted);
                break;
            case 'routine':
                formatted = this.formatRoutine(formatted);
                break;
            case 'task':
                formatted = this.formatTask(formatted);
                break;
            case 'check-in':
                formatted = this.formatCheckIn(formatted);
                break;
            default:
                // For general responses, just apply universal formatting
                break;
        }

        // Apply universal formatting improvements
        formatted = this.applyUniversalFormatting(formatted);

        return {
            content: formatted,
            type,
            hasData: this.detectDataAvailability(formatted),
            dataSources: this.extractDataSources(formatted)
        };
    }

    /**
     * Remove technical jargon and system messages
     */
    private static removeTechnicalJargon(text: string): string {
        return text
            // Remove [Checking...] brackets
            .replace(/\[Checking[^\]]*\]/gi, '')
            .replace(/\[Waiting[^\]]*\]/gi, '')
            .replace(/\[System[^\]]*\]/gi, '')
            // Remove "Note:" technical messages
            .replace(/Note:\s*[^\n]*\n?/gi, '')
            // Clean up multiple spaces
            .replace(/\s{2,}/g, ' ')
            // Clean up multiple newlines
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /**
     * Format morning briefing responses
     */
    private static formatBriefing(text: string): string {
        // Ensure proper greeting
        if (!text.toLowerCase().includes('good morning') && !text.toLowerCase().includes('morning')) {
            text = `🌅 **Good Morning!**\n\n${text}`;
        }

        // Structure with clear sections
        text = text.replace(/\*\*(.*?)\*\*/g, '## $1');

        // Convert bullet points to proper markdown
        text = text.replace(/^•\s+/gm, '- ');
        text = text.replace(/^-\s+/gm, '- ');

        return text;
    }

    /**
     * Format routine-related responses
     */
    private static formatRoutine(text: string): string {
        // Add routine-specific structure
        if (!text.toLowerCase().includes('routine')) {
            text = `## Morning Routine\n\n${text}`;
        }

        // Format options as clear lists
        text = text.replace(/([a-c])\)/g, '$1. ');
        text = text.replace(/(\d+)\./g, '$1. ');

        return text;
    }

    /**
     * Format task-related responses
     */
    private static formatTask(text: string): string {
        // Ensure task focus
        if (!text.toLowerCase().includes('task') && !text.toLowerCase().includes('priority')) {
            text = `## Today's Focus\n\n${text}`;
        }

        return text;
    }

    /**
     * Format evening check-in responses
     */
    private static formatCheckIn(text: string): string {
        // Add evening structure
        if (!text.toLowerCase().includes('evening') && !text.toLowerCase().includes('check-in')) {
            text = `## Evening Check-in\n\n${text}`;
        }

        return text;
    }

    /**
     * Apply universal formatting improvements
     */
    private static applyUniversalFormatting(text: string): string {
        // Ensure proper markdown headers
        text = text.replace(/^#\s+/gm, '## ');

        // Convert numbered lists to proper markdown
        text = text.replace(/^(\d+)\.\s+/gm, '$1. ');

        // Ensure bullet lists are consistent
        text = text.replace(/^[-•]\s+/gm, '- ');

        // Add proper spacing around headers
        text = text.replace(/^(#{1,6}\s+.*)$/gm, '\n$1\n');

        // Clean up extra spacing
        text = text.replace(/\n{3,}/g, '\n\n');

        return text.trim();
    }

    /**
     * Detect if response contains real data or just "unavailable" messages
     */
    private static detectDataAvailability(text: string): boolean {
        const unavailablePhrases = [
            'unavailable',
            'not available',
            'don\'t have access',
            'no data',
            'empty',
            'not connected'
        ];

        const hasUnavailable = unavailablePhrases.some(phrase =>
            text.toLowerCase().includes(phrase)
        );

        return !hasUnavailable;
    }

    /**
     * Extract data sources mentioned in response
     */
    private static extractDataSources(text: string): string[] {
        const sources: string[] = [];

        if (text.toLowerCase().includes('notion')) sources.push('notion');
        if (text.toLowerCase().includes('calendar')) sources.push('calendar');
        if (text.toLowerCase().includes('oura') || text.toLowerCase().includes('sleep')) sources.push('oura');
        if (text.toLowerCase().includes('workout') || text.toLowerCase().includes('exercise')) sources.push('workout');
        if (text.toLowerCase().includes('habit')) sources.push('habits');
        if (text.toLowerCase().includes('screen time')) sources.push('screen-time');

        return sources;
    }

    /**
     * Format data unavailability messages in a friendly way
     */
    static formatDataUnavailable(source: string, context: string = ''): string {
        const messages: Record<string, string> = {
            'notion': 'I don\'t have access to your task lists right now, but I can help you organize your priorities.',
            'calendar': 'I can\'t see your calendar events at the moment, but I can help you plan your day.',
            'oura': 'I don\'t have your sleep and recovery data today, but I can still help you plan based on how you feel.',
            'workout': 'I don\'t have your workout history available, but I\'d be happy to help you plan today\'s exercise.',
            'habits': 'I can\'t see your habit tracking data right now, but I can help you set up your daily routines.',
            'screen-time': 'I don\'t have your screen time data available, but I can help you plan focused work sessions.'
        };

        return messages[source] || `I don't have access to ${source} data right now, but I can still help you.`;
    }
}

/**
 * Apply formatting to all chat responses
 */
export function formatChatResponse(rawResponse: string, type: 'briefing' | 'routine' | 'task' | 'general' | 'check-in' = 'general'): string {
    const formatted = ResponseFormatter.formatResponse(rawResponse, type);
    return formatted.content;
}
