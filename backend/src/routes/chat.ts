import { Router } from 'express';
import { chatWithAgent } from '../services/ai-agent';
import { formatChatResponse } from '../services/response-formatter';

export const chatRouter = Router();

// Send message to AI agent
chatRouter.post('/', async (req, res) => {
    try {
        const { message, userId } = req.body;
        console.log('📨 Chat route: Received message:', message);

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get response from AI agent
        console.log('📨 Chat route: Calling chatWithAgent...');
        const rawResponse = await chatWithAgent(message, userId || 'default-user');
        console.log('📨 Chat route: Got response, length:', rawResponse.length);

        // Format the response based on message type
        const responseType = determineResponseType(message);
        const formattedResponse = formatChatResponse(rawResponse, responseType);

        res.json({
            response: formattedResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({
            error: 'Failed to process chat message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get morning briefing
chatRouter.get('/briefing', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';

        // Generate morning briefing using AI agent
        const rawBriefing = await chatWithAgent(
            'Generate my morning briefing for today',
            userId
        );

        // Format the briefing response
        const formattedBriefing = formatChatResponse(rawBriefing, 'briefing');

        res.json({
            briefing: formattedBriefing,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating briefing:', error);
        res.status(500).json({
            error: 'Failed to generate morning briefing',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Evening check-in
chatRouter.post('/check-in', async (req, res) => {
    try {
        const { userId } = req.body;

        // Generate evening check-in using AI agent
        const rawCheckIn = await chatWithAgent(
            'Let\'s do my evening check-in. How did I do today with my habits?',
            userId || 'default-user'
        );

        // Format the check-in response
        const formattedCheckIn = formatChatResponse(rawCheckIn, 'check-in');

        res.json({
            checkIn: formattedCheckIn,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in evening check-in:', error);
        res.status(500).json({
            error: 'Failed to perform evening check-in',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get Spanish study plan
chatRouter.get('/spanish-study', async (req, res) => {
    try {
        const { notionService } = await import('../services/notion-service');

        console.log('📚 Fetching Spanish study plan...');
        const studyPlan = await notionService.getSpanishStudyPlan();

        res.json({
            studyPlan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching Spanish study plan:', error);
        res.status(500).json({
            error: 'Failed to fetch Spanish study plan',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Helper function to determine response type based on message
function determineResponseType(message: string): 'briefing' | 'routine' | 'task' | 'general' | 'check-in' {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('briefing') || lowerMessage.includes('morning')) {
        return 'briefing';
    }
    if (lowerMessage.includes('routine')) {
        return 'routine';
    }
    if (lowerMessage.includes('task') || lowerMessage.includes('priority') || lowerMessage.includes('todo')) {
        return 'task';
    }
    if (lowerMessage.includes('check-in') || lowerMessage.includes('evening')) {
        return 'check-in';
    }

    return 'general';
}

