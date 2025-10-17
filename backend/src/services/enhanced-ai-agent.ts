// Enhanced AI Agent with Notion AI integration
import { notionAIService } from './notion-ai';

export async function chatWithAgent(
    message: string,
    userId: string
): Promise<string> {
    try {
        console.log('🤖 AI Agent: Processing message:', message);

        // Check if user is asking for Notion AI assistance
        if (message.includes('break down') || message.includes('complex task')) {
            return await handleTaskBreakdown(message, userId);
        }

        if (message.includes('morning routine') || message.includes('routine variation')) {
            return await handleRoutineVariations(message, userId);
        }

        if (message.includes('study questions') || message.includes('green card')) {
            return await handleStudyQuestions(message, userId);
        }

        if (message.includes('ADHD') || message.includes('suggestions')) {
            return await handleADHDSuggestions(message, userId);
        }

        if (message.includes('weekly reflection') || message.includes('reflection')) {
            return await handleWeeklyReflection(message, userId);
        }

        // Regular AI agent processing...
        // (existing code)

    } catch (error) {
        console.error('Error in AI agent:', error);
        throw new Error('Failed to get response from AI agent');
    }
}

async function handleTaskBreakdown(message: string, userId: string): Promise<string> {
    try {
        // Extract the complex task from the message
        const taskMatch = message.match(/break down (.+)/i);
        const complexTask = taskMatch ? taskMatch[1] : message;

        console.log('🧠 Using Notion AI to break down task:', complexTask);

        const breakdown = await notionAIService.generateTaskBreakdown(complexTask);

        return `🧠 **Task Breakdown** (via Notion AI):
        
${breakdown}

I've used Notion AI to break this down into ADHD-friendly steps. Would you like me to:
- Add these steps to your Notion task list?
- Set up reminders for each step?
- Create a focus session plan?`;

    } catch (error) {
        console.error('Task breakdown failed:', error);
        return "I had trouble breaking down that task. Let me try a different approach...";
    }
}

async function handleRoutineVariations(message: string, userId: string): Promise<string> {
    try {
        console.log('🌅 Generating routine variations with Notion AI...');

        const variations = await notionAIService.generateMorningRoutineVariations();

        return `🌅 **Morning Routine Variations** (via Notion AI):
        
${variations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

These variations maintain your 2-hour structure but add variety to prevent boredom. Would you like me to:
- Schedule one of these for tomorrow?
- Create a rotation schedule?
- Customize any of these variations?`;

    } catch (error) {
        console.error('Routine variations failed:', error);
        return "I couldn't generate routine variations right now. Let me suggest some manually...";
    }
}

async function handleStudyQuestions(message: string, userId: string): Promise<string> {
    try {
        // Extract topic from message
        const topicMatch = message.match(/study questions for (.+)/i);
        const topic = topicMatch ? topicMatch[1] : 'general Green Card topics';

        console.log('📚 Generating study questions for:', topic);

        const questions = await notionAIService.generateGreenCardStudyQuestions(topic);

        return `📚 **Study Questions** (via Notion AI) - Topic: ${topic}
        
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

These questions are designed to be realistic and challenging. Would you like me to:
- Add these to your Notion study database?
- Create a quiz session?
- Schedule practice time?`;

    } catch (error) {
        console.error('Study questions failed:', error);
        return "I couldn't generate study questions right now. Let me help you create some manually...";
    }
}

async function handleADHDSuggestions(message: string, userId: string): Promise<string> {
    try {
        console.log('🧠 Generating ADHD-friendly suggestions...');

        const suggestions = await notionAIService.generateADHDFriendlySuggestions(message);

        return `🧠 **ADHD-Friendly Suggestions** (via Notion AI):
        
${suggestions}

These suggestions are tailored to your ADHD needs. Would you like me to:
- Add these to your Notion ADHD strategies page?
- Set up reminders for these techniques?
- Create a personalized action plan?`;

    } catch (error) {
        console.error('ADHD suggestions failed:', error);
        return "I couldn't generate suggestions right now. Let me provide some general ADHD-friendly tips...";
    }
}

async function handleWeeklyReflection(message: string, userId: string): Promise<string> {
    try {
        console.log('📊 Generating weekly reflection template...');

        const template = await notionAIService.generateWeeklyReflection();

        return `📊 **Weekly Reflection Template** (via Notion AI):
        
${template}

This template is designed specifically for your goals and ADHD needs. Would you like me to:
- Create this as a Notion page?
- Schedule weekly reflection time?
- Set up automated reminders?`;

    } catch (error) {
        console.error('Weekly reflection failed:', error);
        return "I couldn't generate a reflection template right now. Let me create a simple one for you...";
    }
}
