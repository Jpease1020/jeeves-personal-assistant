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

        // Return mock response for now to test connectivity
        const mockResponses = {
            'morning briefing': 'Good morning! Here\'s your personalized briefing:\n\n🌅 **Today\'s Focus**: Complete project proposal\n📊 **Habits**: 2/3 completed yesterday\n⏰ **Schedule**: Team meeting at 10 AM\n💡 **Tip**: Take a 5-minute break every hour',
            'start routine': 'Let\'s begin your morning routine! Here\'s what we\'ll do:\n\n1. 🧘 5-minute meditation\n2. 💧 Drink a glass of water\n3. 📝 Review today\'s priorities\n4. 🏃 Quick stretch or walk\n\nReady to start?',
            'spanish quiz': '¡Hola! Let\'s practice your Spanish:\n\n**Question**: How do you say "Good morning" in Spanish?\n\nA) Buenas tardes\nB) Buenos días\nC) Buenas noches\n\nType your answer!',
            'today\'s priority': 'Based on your schedule and habits, today\'s priority is:\n\n🎯 **Complete the project proposal**\n\nThis aligns with your goal of finishing work tasks by 5 PM. Would you like me to break this down into smaller steps?'
        };

        const lowerMessage = message.toLowerCase();
        let response = 'I understand you want help with that. How can I assist you today?';
        
        for (const [key, mockResponse] of Object.entries(mockResponses)) {
            if (lowerMessage.includes(key)) {
                response = mockResponse;
                break;
            }
        }

        console.log('📨 Chat route: Returning mock response');
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

