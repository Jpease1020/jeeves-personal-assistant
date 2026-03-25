import Anthropic from '@anthropic-ai/sdk';
import { loadSystemPrompt } from './system-prompt';
import { notionService } from './notion-service';
import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

// Initialize Supabase client
function getSupabaseClient() {
    if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }
    return supabase;
}

let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
    if (!anthropic) {
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

// Define tools available to Claude
const availableTools: Anthropic.Tool[] = [{
    name: 'read_notion_page',
    description: 'Read content from a Notion page given its URL',
    input_schema: {
        type: 'object' as const,
        properties: {
            page_url: {
                type: 'string',
                description: 'The full Notion URL of the page to read'
            }
        },
        required: ['page_url']
    }
}, {
    name: 'read_notion_page_with_children',
    description: 'Read a Notion page and automatically read all child pages it links to. Perfect for reading a main index page and following all its links.',
    input_schema: {
        type: 'object' as const,
        properties: {
            page_url: {
                type: 'string',
                description: 'The full Notion URL of the main page to read (will automatically read all child pages)'
            }
        },
        required: ['page_url']
    }
}, {
    name: 'search_notion',
    description: 'Search for Notion pages by keywords',
    input_schema: {
        type: 'object' as const,
        properties: {
            keywords: {
                type: 'array' as const,
                items: { type: 'string' },
                description: 'List of keywords to search for'
            }
        },
        required: ['keywords']
    }
}, {
    name: 'create_mochi_card',
    description: 'Create a flashcard in Mochi with front and back content. Perfect for creating study cards from Spanish vocabulary or any learning content.',
    input_schema: {
        type: 'object' as const,
        properties: {
            front: {
                type: 'string',
                description: 'The front of the card (the question or term)'
            },
            back: {
                type: 'string',
                description: 'The back of the card (the answer or definition)'
            },
            context: {
                type: 'string',
                description: 'Optional context or example usage'
            }
        },
        required: ['front', 'back']
    }
}, {
    name: 'sync_to_mochi',
    description: 'Sync Spanish study content from Notion to Mochi flashcards. This will read the Spanish Study Plan from Notion and create flashcards in Mochi.',
    input_schema: {
        type: 'object' as const,
        properties: {
            user_id: {
                type: 'string',
                description: 'User ID for the sync operation'
            }
        },
        required: ['user_id']
    }
}];

// Load conversation history from database
async function loadHistoryFromDB(userId: string): Promise<Anthropic.MessageParam[]> {
    const db = getSupabaseClient();
    if (!db) return [];

    const { data, error } = await db
        .from('conversation_history')
        .select('messages')
        .eq('user_id', userId)
        .single();

    if (error || !data) return [];
    return data.messages || [];
}

// Save conversation history to database
async function saveHistoryToDB(userId: string, messages: Anthropic.MessageParam[]): Promise<void> {
    const db = getSupabaseClient();
    if (!db) return;

    // Limit to last 20 messages
    const limitedMessages = messages.length > 20 ? messages.slice(-20) : messages;

    const { error } = await db
        .from('conversation_history')
        .upsert({
            user_id: userId,
            messages: limitedMessages,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Error saving conversation history:', error);
    }
}

export async function chatWithAgent(
    message: string,
    userId: string
): Promise<string> {
    try {
        console.log('🤖 AI Agent: Processing message:', message);

        // Get or initialize conversation history from DB
        let history: Anthropic.MessageParam[] = [];

        // Load conversation history
        if (conversationHistory.has(userId)) {
            history = conversationHistory.get(userId)!;
        } else {
            history = await loadHistoryFromDB(userId);
            conversationHistory.set(userId, history);
        }

        // Filter out any empty messages from history
        history = history.filter(msg => {
            if (typeof msg.content === 'string') {
                return msg.content.trim().length > 0;
            }
            return true;
        });

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
        console.log('📤 Sending history with', history.length, 'messages');

        // Log the last few messages for debugging
        if (history.length > 0) {
            const lastMsg = history[history.length - 1];
            console.log('📤 Last message:', {
                role: lastMsg.role,
                contentLength: typeof lastMsg.content === 'string' ? lastMsg.content.length : 'non-string'
            });
        }

        const client = getAnthropicClient();
        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: systemPrompt,
            messages: history,
            tools: availableTools
        });

        console.log('🤖 AI Agent: Claude response received, content blocks:', response.content.length);

        // Extract assistant's response
        const assistantMessage = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as Anthropic.TextBlock).text)
            .join('\n');

        console.log('🤖 AI Agent: Extracted message length:', assistantMessage.length);

        // Check if Claude wants to use any tools
        if (response.content.some(block => block.type === 'tool_use')) {
            console.log('🤖 AI Agent: Tool use detected, handling tool calls...');

            // First, add the assistant's response with tool_use to history
            history.push({
                role: 'assistant',
                content: response.content
            });

            const toolResultsContent: Anthropic.ContentBlock[] = [];

            for (const block of response.content) {
                if (block.type === 'tool_use') {
                    const toolUse = block as Anthropic.ToolUseBlock;

                    try {
                        let result: any;

                        // Handle different tool types
                        switch (toolUse.name) {
                            case 'read_notion_page':
                                const pageUrl = (toolUse.input as any).page_url;
                                console.log(`📄 Reading Notion page: ${pageUrl}`);

                                // Extract page ID from URL - handle both formats:
                                // 1. notion.so/page-slug-with-ID
                                // 2. notion.so/ID
                                let pageId = null;

                                // Try to match ID at the end of the URL
                                const pageIdMatch = pageUrl.match(/-([a-f0-9]{32})(?:\?|$)/);
                                if (pageIdMatch) {
                                    pageId = pageIdMatch[1];
                                } else {
                                    // Fallback: try to match ID directly after notion.so/
                                    const directMatch = pageUrl.match(/notion\.so\/([a-f0-9]{32})/);
                                    if (directMatch) {
                                        pageId = directMatch[1];
                                    }
                                }

                                if (pageId) {
                                    console.log(`📄 Extracted page ID: ${pageId}`);
                                    const content = await notionService.getPageContent(pageId);
                                    result = {
                                        success: true,
                                        content: content
                                    };
                                } else {
                                    result = {
                                        success: false,
                                        error: 'Invalid Notion URL format. Could not extract page ID.'
                                    };
                                }
                                break;

                            case 'read_notion_page_with_children':
                                const mainPageUrl = (toolUse.input as any).page_url;
                                console.log(`📚 Reading Notion page with all children: ${mainPageUrl}`);

                                // Extract page ID from URL - handle both formats
                                let mainPageId = null;

                                // Try to match ID at the end of the URL
                                const mainPageIdMatch = mainPageUrl.match(/-([a-f0-9]{32})(?:\?|$)/);
                                if (mainPageIdMatch) {
                                    mainPageId = mainPageIdMatch[1];
                                } else {
                                    // Fallback: try to match ID directly after notion.so/
                                    const directMatch = mainPageUrl.match(/notion\.so\/([a-f0-9]{32})/);
                                    if (directMatch) {
                                        mainPageId = directMatch[1];
                                    }
                                }

                                if (mainPageId) {
                                    console.log(`📚 Extracted page ID: ${mainPageId}`);

                                    // Read main page
                                    const mainContent = await notionService.getPageContent(mainPageId, true);

                                    // Get all child pages
                                    const childPages: any[] = [];
                                    const extractChildPages = (content: any) => {
                                        if (content.tasks) {
                                            for (const task of content.tasks) {
                                                if (task.type === 'child_page') {
                                                    childPages.push(task);
                                                }
                                            }
                                        }
                                    };

                                    extractChildPages(mainContent);

                                    // Read all child pages
                                    const childrenContent: any[] = [];
                                    for (const child of childPages) {
                                        try {
                                            const childContent = await notionService.getPageContent(child.id, true);
                                            childrenContent.push({
                                                title: child.title,
                                                id: child.id,
                                                content: childContent
                                            });
                                        } catch (error) {
                                            console.error(`Error reading child page ${child.title}:`, error);
                                        }
                                    }

                                    result = {
                                        success: true,
                                        mainPage: {
                                            title: mainContent.title,
                                            content: mainContent
                                        },
                                        children: childrenContent,
                                        childCount: childrenContent.length
                                    };
                                } else {
                                    result = {
                                        success: false,
                                        error: 'Invalid Notion URL format. Could not extract page ID.'
                                    };
                                }
                                break;

                            case 'search_notion':
                                const keywords = (toolUse.input as any).keywords;
                                console.log(`🔍 Searching Notion for: ${keywords}`);

                                const pages = await notionService.searchPages(keywords);
                                result = {
                                    success: true,
                                    pages: pages
                                };
                                break;

                            case 'create_mochi_card':
                                const { front, back, context } = (toolUse.input as any);
                                console.log(`🎴 Creating Mochi card: ${front}`);

                                // Import mochiService
                                const { mochiService } = await import('./mochi-service');
                                const mochiCard = await mochiService.createCard(front, back, context);

                                result = {
                                    success: true,
                                    card: {
                                        id: mochiCard.id,
                                        front,
                                        back,
                                        context
                                    },
                                    message: 'Card created successfully in Mochi'
                                };
                                break;

                            case 'sync_to_mochi':
                                const { user_id } = (toolUse.input as any);
                                console.log(`🔄 Syncing to Mochi for user: ${user_id}`);

                                // Make HTTP request to the Mochi sync endpoint
                                const syncResponse = await fetch(`http://localhost:4001/api/mochi/sync`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user_id })
                                });

                                const syncResult = await syncResponse.json() as { success: boolean; data?: { created?: number; errors?: string[] }; message?: string };

                                result = {
                                    success: syncResult.success,
                                    created: syncResult.data?.created || 0,
                                    errors: syncResult.data?.errors || [],
                                    message: syncResult.message
                                };
                                break;

                            default:
                                result = {
                                    success: false,
                                    error: `Unknown tool: ${toolUse.name}`
                                };
                        }

                        toolResultsContent.push({
                            type: 'tool_result',
                            tool_use_id: toolUse.id,
                            content: JSON.stringify(result)
                        } as any);

                    } catch (error) {
                        console.error(`Error handling tool ${toolUse.name}:`, error);
                        toolResultsContent.push({
                            type: 'tool_result',
                            tool_use_id: toolUse.id,
                            content: JSON.stringify({
                                success: false,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            })
                        } as any);
                    }
                }
            }

            // Send tool results as the next user message
            const toolResultsMessage: Anthropic.MessageParam = {
                role: 'user',
                content: toolResultsContent
            };

            console.log('🔧 About to send tool results. History length:', history.length);
            console.log('🔧 Tool results content blocks:', toolResultsContent.length);

            // Create new messages array with tool results
            const messagesWithToolResults = [...history, toolResultsMessage];
            console.log('🔧 Total messages with tool results:', messagesWithToolResults.length);

            // DEBUG: Log the message structure
            console.log('🔧 Message structure:');
            messagesWithToolResults.forEach((msg, idx) => {
                console.log(`  [${idx}] role: ${msg.role}, content type: ${Array.isArray(msg.content) ? 'array' : typeof msg.content}`);
                if (Array.isArray(msg.content) && msg.content.length > 0) {
                    console.log(`  [${idx}] first block type: ${(msg.content[0] as any).type}`);
                }
            });

            const toolResponse = await client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                system: systemPrompt,
                messages: messagesWithToolResults,
                tools: availableTools
            });

            const finalMessage = toolResponse.content
                .filter(block => block.type === 'text')
                .map(block => (block as Anthropic.TextBlock).text)
                .join('\n');

            // Add tool results and final assistant response to history
            history.push(toolResultsMessage);
            history.push({
                role: 'assistant',
                content: finalMessage
            });

            // Save conversation history
            conversationHistory.set(userId, history);
            await saveHistoryToDB(userId, history);

            return finalMessage;
        }

        // No tools, just add assistant response and return
        history.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Save conversation history
        conversationHistory.set(userId, history);
        await saveHistoryToDB(userId, history);

        return assistantMessage;
    } catch (error) {
        console.error('Error in AI agent:', error);
        throw new Error('Failed to get response from AI agent');
    }
}

export function clearConversationHistory(userId: string): void {
    conversationHistory.delete(userId);
}
