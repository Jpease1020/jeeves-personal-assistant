// Notion AI Integration Service
import { Client } from '@notionhq/client';

export class NotionAIService {
    private notion: Client;

    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY,
        });
    }

    async generateTaskBreakdown(complexTask: string): Promise<string> {
        console.log('🧠 Using Notion AI to break down complex task...');

        try {
            // Use Notion AI to break down complex tasks into smaller steps
            const response = await this.notion.blocks.children.append({
                block_id: process.env.NOTION_AI_WORKSPACE_ID!,
                children: [
                    {
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: {
                                        content: `Break down this complex task into ADHD-friendly steps: "${complexTask}"`
                                    }
                                }
                            ]
                        }
                    }
                ]
            });

            // Notion AI will generate the breakdown
            // We can then extract and use it
            return await this.extractAIGeneratedContent(response.id);

        } catch (error) {
            console.error('❌ Notion AI task breakdown failed:', error);
            throw error;
        }
    }

    async generateMorningRoutineVariations(): Promise<string[]> {
        console.log('🌅 Using Notion AI to generate routine variations...');

        try {
            // Ask Notion AI to suggest variations for your morning routine
            const prompt = `Generate 3 variations of my morning routine for ADHD management:
      1. Wake + Grounding (15 min)
      2. Reset Your Space (15 min) 
      3. Identity + Direction (15 min)
      4. Workout (30 min)
      5. Cool Down (15 min)
      6. Recenter (30 min)
      
      Suggest creative variations that maintain the same time blocks but add variety.`;

            const response = await this.notion.blocks.children.append({
                block_id: process.env.NOTION_AI_WORKSPACE_ID!,
                children: [
                    {
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: { content: prompt }
                                }
                            ]
                        }
                    }
                ]
            });

            return await this.extractRoutineVariations(response.id);

        } catch (error) {
            console.error('❌ Notion AI routine generation failed:', error);
            throw error;
        }
    }

    async generateGreenCardStudyQuestions(topic: string): Promise<string[]> {
        console.log('📚 Using Notion AI to generate study questions...');

        try {
            const prompt = `Generate 10 practice questions for Green Card interview preparation on the topic: "${topic}"
      
      Include:
      - 5 factual questions (dates, names, laws)
      - 3 scenario-based questions (what would you do if...)
      - 2 personal experience questions (tell me about a time when...)
      
      Make them realistic and challenging.`;

            const response = await this.notion.blocks.children.append({
                block_id: process.env.NOTION_AI_WORKSPACE_ID!,
                children: [
                    {
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: { content: prompt }
                                }
                            ]
                        }
                    }
                ]
            });

            return await this.extractStudyQuestions(response.id);

        } catch (error) {
            console.error('❌ Notion AI study questions failed:', error);
            throw error;
        }
    }

    async generateADHDFriendlySuggestions(context: string): Promise<string> {
        console.log('🧠 Using Notion AI for ADHD-friendly suggestions...');

        try {
            const prompt = `Given this context: "${context}"
      
      Provide ADHD-friendly suggestions for:
      - Breaking down the task
      - Managing distractions
      - Staying motivated
      - Time management
      
      Be specific and actionable.`;

            const response = await this.notion.blocks.children.append({
                block_id: process.env.NOTION_AI_WORKSPACE_ID!,
                children: [
                    {
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: { content: prompt }
                                }
                            ]
                        }
                    }
                ]
            });

            return await this.extractAISuggestions(response.id);

        } catch (error) {
            console.error('❌ Notion AI suggestions failed:', error);
            throw error;
        }
    }

    async generateWeeklyReflection(): Promise<string> {
        console.log('📊 Using Notion AI to generate weekly reflection...');

        try {
            const prompt = `Generate a weekly reflection template for someone with ADHD who is:
      - Preparing for Green Card interview
      - Learning iOS development
      - Managing daily habits and routines
      - Working on personal goals
      
      Include questions about:
      - What went well this week
      - What was challenging
      - Progress on major goals
      - Habit completion rates
      - Energy levels and patterns
      - Plans for next week`;

            const response = await this.notion.blocks.children.append({
                block_id: process.env.NOTION_AI_WORKSPACE_ID!,
                children: [
                    {
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: { content: prompt }
                                }
                            ]
                        }
                    }
                ]
            });

            return await this.extractReflectionTemplate(response.id);

        } catch (error) {
            console.error('❌ Notion AI reflection generation failed:', error);
            throw error;
        }
    }

    // Helper methods to extract AI-generated content
    private async extractAIGeneratedContent(blockId: string): Promise<string> {
        // This would extract the AI-generated content from Notion
        // Implementation depends on how Notion AI returns content
        return "AI-generated content would be extracted here";
    }

    private async extractRoutineVariations(blockId: string): Promise<string[]> {
        return [
            "Variation 1: Music-themed routine",
            "Variation 2: Nature-focused routine",
            "Variation 3: Minimalist routine"
        ];
    }

    private async extractStudyQuestions(blockId: string): Promise<string[]> {
        return [
            "What year was the Constitution written?",
            "Name three branches of government",
            "What would you do if you witnessed a crime?"
        ];
    }

    private async extractAISuggestions(blockId: string): Promise<string> {
        return "AI-generated ADHD-friendly suggestions would be extracted here";
    }

    private async extractReflectionTemplate(blockId: string): Promise<string> {
        return "AI-generated weekly reflection template would be extracted here";
    }
}

export const notionAIService = new NotionAIService();
