import { Router } from 'express';
import { chatWithAgent } from '../services/ai-agent';

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
        const response = await chatWithAgent(message, userId || 'default-user');
        console.log('📨 Chat route: Got response, length:', response.length);

        res.json({
            response,
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
        const briefing = await chatWithAgent(
            'Generate my morning briefing for today',
            userId
        );

        res.json({
            briefing,
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
        const checkIn = await chatWithAgent(
            'Let\'s do my evening check-in. How did I do today with my habits?',
            userId || 'default-user'
        );

        res.json({
            checkIn,
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

