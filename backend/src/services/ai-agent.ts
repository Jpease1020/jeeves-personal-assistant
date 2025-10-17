import Anthropic from '@anthropic-ai/sdk';
import { loadSystemPrompt } from './system-prompt';
import { mcpClient } from './mcp-client';

let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
    if (!anthropic) {
        // Debug: Log all environment variables that contain 'ANTHROPIC'
        console.log('🤖 AI Agent: Environment variables check:');
        Object.keys(process.env).forEach(key => {
            if (key.includes('ANTHROPIC') || key.includes('API')) {
                console.log(`  ${key}: ${process.env[key]?.substring(0, 20)}...`);
            }
        });

        // Debug: Log API key format before creating client
        console.log('🤖 AI Agent: API Key format check:', {
            exists: !!process.env.ANTHROPIC_API_KEY,
            length: process.env.ANTHROPIC_API_KEY?.length || 0,
            startsWith: process.env.ANTHROPIC_API_KEY?.substring(0, 15) || 'N/A',
            fullKey: process.env.ANTHROPIC_API_KEY || 'NOT_FOUND'
        });

        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }
        if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-api')) {
            throw new Error('ANTHROPIC_API_KEY appears to be invalid format');
        }

        // Create Anthropic client with explicit API key
        anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY!,
        });
    }
    return anthropic;
}

// Store conversation history per user
const conversationHistory: Map<string, Anthropic.MessageParam[]> = new Map();

export async function chatWithAgent(
    message: string,
    userId: string
): Promise<string> {
    try {
        console.log('🤖 AI Agent: Processing message:', message);

        // Get or initialize conversation history
        let history = conversationHistory.get(userId) || [];

        // Add user message to history
        history.push({
            role: 'user',
            content: message
        });

        // Get system prompt with user context
        const systemPrompt = await loadSystemPrompt(userId);
        console.log('🤖 AI Agent: System prompt loaded, length:', systemPrompt.length);

        // Call Claude API
        console.log('🤖 AI Agent: Calling Claude API...');
        const client = getAnthropicClient();
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: systemPrompt,
            messages: history
        });

        console.log('🤖 AI Agent: Claude response received, content blocks:', response.content.length);

        // Extract assistant's response
        const assistantMessage = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');

        console.log('🤖 AI Agent: Extracted message length:', assistantMessage.length);

        // Add assistant response to history
        history.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Keep only last 20 messages (10 exchanges) to manage context
        if (history.length > 20) {
            history = history.slice(-20);
        }

        // Update conversation history
        conversationHistory.set(userId, history);

        // Check if Claude wants to use any MCP tools
        // (Tool use will be implemented when MCP servers are ready)
        if (response.content.some(block => block.type === 'tool_use')) {
            // Handle tool calls through MCP client
            // This will be implemented in the next phase
        }

        return assistantMessage;
    } catch (error) {
        console.error('Error in AI agent:', error);
        throw new Error('Failed to get response from AI agent');
    }
}

export function clearConversationHistory(userId: string): void {
    conversationHistory.delete(userId);
}

