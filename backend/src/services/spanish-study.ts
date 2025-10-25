import { createClient } from '@supabase/supabase-js';
import { notionService } from './notion-service';

export interface SpanishStudyItem {
    id: string;
    notionPageId: string;
    notionPageTitle: string;
    content: string;
    type: 'vocabulary' | 'grammar' | 'phrase' | 'conversation' | 'other';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SpanishStudyProgress {
    id: string;
    userId: string;
    studyItemId: string;
    correctCount: number;
    incorrectCount: number;
    lastReviewed: Date;
    nextReview: Date;
    interval: number; // days
    easeFactor: number; // SM-2 algorithm
    streak: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface QuizQuestion {
    id: string;
    studyItemId: string;
    question: string;
    correctAnswer: string;
    options?: string[];
    type: 'translation' | 'definition' | 'conjugation' | 'fill_blank' | 'multiple_choice';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    explanation?: string;
}

export class SpanishStudyService {
    private supabase: any;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        } else {
            console.warn('⚠️ Supabase not configured for Spanish study service');
        }
    }

    /**
     * Sync Spanish study content from Notion
     */
    async syncFromNotion(userId: string): Promise<{
        synced: number;
        errors: string[];
    }> {
        try {
            console.log('📚 Syncing Spanish study content from Notion...');

            const spanishPages = await notionService.findSpanishStudyPages();
            let synced = 0;
            const errors: string[] = [];

            for (const page of spanishPages) {
                try {
                    const studyItems = this.parseSpanishContent(page);

                    for (const item of studyItems) {
                        await this.saveStudyItem(item);
                        synced++;
                    }
                } catch (error) {
                    errors.push(`Failed to sync page "${page.title}": ${error}`);
                    console.error(`Error syncing page ${page.title}:`, error);
                }
            }

            console.log(`✅ Synced ${synced} Spanish study items from ${spanishPages.length} pages`);
            return { synced, errors };

        } catch (error) {
            console.error('❌ Failed to sync Spanish content:', error);
            return { synced: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
        }
    }

    /**
     * Parse Spanish content from Notion page into study items
     */
    private parseSpanishContent(page: {
        id: string;
        title: string;
        content: string;
        tasks: any[];
    }): SpanishStudyItem[] {
        const items: SpanishStudyItem[] = [];
        const lines = page.content.split('\n').filter(line => line.trim());

        let currentItem: Partial<SpanishStudyItem> | null = null;
        let itemIndex = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and headings
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            // Look for vocabulary patterns
            const vocabMatch = trimmedLine.match(/^(.+?)\s*[-=]\s*(.+)$/);
            if (vocabMatch) {
                // Save previous item if exists
                if (currentItem && currentItem.content) {
                    items.push(this.finalizeStudyItem(currentItem, page, itemIndex++));
                }

                // Start new vocabulary item
                currentItem = {
                    notionPageId: page.id,
                    notionPageTitle: page.title,
                    content: `${vocabMatch[1].trim()} = ${vocabMatch[2].trim()}`,
                    type: 'vocabulary',
                    difficulty: 'intermediate',
                    tags: this.extractTags(trimmedLine)
                };
                continue;
            }

            // Look for grammar patterns
            const grammarMatch = trimmedLine.match(/^(conjugation|grammar|rule):\s*(.+)$/i);
            if (grammarMatch) {
                if (currentItem && currentItem.content) {
                    items.push(this.finalizeStudyItem(currentItem, page, itemIndex++));
                }

                currentItem = {
                    notionPageId: page.id,
                    notionPageTitle: page.title,
                    content: trimmedLine,
                    type: 'grammar',
                    difficulty: 'intermediate',
                    tags: this.extractTags(trimmedLine)
                };
                continue;
            }

            // Look for phrase patterns
            const phraseMatch = trimmedLine.match(/^["'](.+)["']\s*[-=]\s*(.+)$/);
            if (phraseMatch) {
                if (currentItem && currentItem.content) {
                    items.push(this.finalizeStudyItem(currentItem, page, itemIndex++));
                }

                currentItem = {
                    notionPageId: page.id,
                    notionPageTitle: page.title,
                    content: `${phraseMatch[1]} = ${phraseMatch[2]}`,
                    type: 'phrase',
                    difficulty: 'intermediate',
                    tags: this.extractTags(trimmedLine)
                };
                continue;
            }

            // If we have a current item, add to its content
            if (currentItem) {
                currentItem.content += '\n' + trimmedLine;
            } else {
                // Create a general study item
                currentItem = {
                    notionPageId: page.id,
                    notionPageTitle: page.title,
                    content: trimmedLine,
                    type: 'other',
                    difficulty: 'intermediate',
                    tags: this.extractTags(trimmedLine)
                };
            }
        }

        // Save the last item
        if (currentItem && currentItem.content) {
            items.push(this.finalizeStudyItem(currentItem, page, itemIndex));
        }

        return items;
    }

    /**
     * Finalize a study item with proper structure
     */
    private finalizeStudyItem(
        item: Partial<SpanishStudyItem>,
        page: { id: string; title: string },
        index: number
    ): SpanishStudyItem {
        return {
            id: `${page.id}_${index}`,
            notionPageId: page.id,
            notionPageTitle: page.title,
            content: item.content || '',
            type: item.type || 'other',
            difficulty: item.difficulty || 'intermediate',
            tags: item.tags || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    /**
     * Extract tags from content
     */
    private extractTags(content: string): string[] {
        const tags: string[] = [];

        // Look for hashtags
        const hashtagMatches = content.match(/#(\w+)/g);
        if (hashtagMatches) {
            tags.push(...hashtagMatches.map(tag => tag.substring(1)));
        }

        // Look for difficulty indicators
        if (content.toLowerCase().includes('beginner') || content.toLowerCase().includes('básico')) {
            tags.push('beginner');
        }
        if (content.toLowerCase().includes('intermediate') || content.toLowerCase().includes('intermedio')) {
            tags.push('intermediate');
        }
        if (content.toLowerCase().includes('advanced') || content.toLowerCase().includes('avanzado')) {
            tags.push('advanced');
        }

        // Look for content type indicators
        if (content.toLowerCase().includes('verb') || content.toLowerCase().includes('verbo')) {
            tags.push('verbs');
        }
        if (content.toLowerCase().includes('noun') || content.toLowerCase().includes('sustantivo')) {
            tags.push('nouns');
        }
        if (content.toLowerCase().includes('adjective') || content.toLowerCase().includes('adjetivo')) {
            tags.push('adjectives');
        }

        return tags;
    }

    /**
     * Save study item to database
     */
    private async saveStudyItem(item: SpanishStudyItem): Promise<void> {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('spanish_study_items')
                .upsert({
                    id: item.id,
                    notion_page_id: item.notionPageId,
                    notion_page_title: item.notionPageTitle,
                    content: item.content,
                    type: item.type,
                    difficulty: item.difficulty,
                    tags: item.tags,
                    created_at: item.createdAt.toISOString(),
                    updated_at: item.updatedAt.toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error saving study item:', error);
            }
        } catch (error) {
            console.error('Error in saveStudyItem:', error);
        }
    }

    /**
     * Get next question for review (spaced repetition)
     */
    async getNextQuestion(userId: string): Promise<QuizQuestion | null> {
        if (!this.supabase) return null;

        try {
            // Get items that are due for review
            const now = new Date();

            const { data: progressItems, error } = await this.supabase
                .from('spanish_study_progress')
                .select(`
                    *,
                    spanish_study_items (*)
                `)
                .eq('user_id', userId)
                .lte('next_review', now.toISOString())
                .order('next_review', { ascending: true })
                .limit(1);

            if (error) {
                console.error('Error fetching progress items:', error);
                return null;
            }

            if (!progressItems || progressItems.length === 0) {
                // No items due for review, get a new item
                return await this.getNewQuestion(userId);
            }

            const progressItem = progressItems[0];
            const studyItem = progressItem.spanish_study_items;

            if (!studyItem) {
                return await this.getNewQuestion(userId);
            }

            return this.createQuestionFromStudyItem(studyItem);

        } catch (error) {
            console.error('Error getting next question:', error);
            return null;
        }
    }

    /**
     * Get a new question for a study item that hasn't been reviewed yet
     */
    private async getNewQuestion(userId: string): Promise<QuizQuestion | null> {
        if (!this.supabase) return null;

        try {
            // Get a study item that hasn't been reviewed yet
            const { data: newItems, error } = await this.supabase
                .from('spanish_study_items')
                .select('*')
                .not('id', 'in', `(SELECT study_item_id FROM spanish_study_progress WHERE user_id = '${userId}')`)
                .limit(1);

            if (error) {
                console.error('Error fetching new items:', error);
                return null;
            }

            if (!newItems || newItems.length === 0) {
                return null; // No new items to study
            }

            return this.createQuestionFromStudyItem(newItems[0]);

        } catch (error) {
            console.error('Error getting new question:', error);
            return null;
        }
    }

    /**
     * Create a quiz question from a study item
     */
    private createQuestionFromStudyItem(studyItem: any): QuizQuestion {
        const content = studyItem.content;

        // Parse content to create question
        if (studyItem.type === 'vocabulary') {
            const parts = content.split('=');
            if (parts.length === 2) {
                return {
                    id: `${studyItem.id}_translation`,
                    studyItemId: studyItem.id,
                    question: `Translate: "${parts[0].trim()}"`,
                    correctAnswer: parts[1].trim(),
                    type: 'translation',
                    difficulty: studyItem.difficulty,
                    explanation: `This is a vocabulary item from ${studyItem.notion_page_title}`
                };
            }
        }

        if (studyItem.type === 'phrase') {
            const parts = content.split('=');
            if (parts.length === 2) {
                return {
                    id: `${studyItem.id}_phrase`,
                    studyItemId: studyItem.id,
                    question: `What does this Spanish phrase mean? "${parts[0].trim()}"`,
                    correctAnswer: parts[1].trim(),
                    type: 'translation',
                    difficulty: studyItem.difficulty,
                    explanation: `This phrase is from ${studyItem.notion_page_title}`
                };
            }
        }

        // Default question type
        return {
            id: `${studyItem.id}_general`,
            studyItemId: studyItem.id,
            question: `Study this content: "${content}"`,
            correctAnswer: content,
            type: 'definition',
            difficulty: studyItem.difficulty,
            explanation: `This content is from ${studyItem.notion_page_title}`
        };
    }

    /**
     * Record answer and update spaced repetition data
     */
    async recordAnswer(
        userId: string,
        questionId: string,
        isCorrect: boolean,
        responseTime: number
    ): Promise<void> {
        if (!this.supabase) return;

        try {
            const studyItemId = questionId.split('_')[0];

            // Get or create progress record
            let { data: progress, error: fetchError } = await this.supabase
                .from('spanish_study_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('study_item_id', studyItemId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching progress:', fetchError);
                return;
            }

            const now = new Date();

            if (!progress) {
                // Create new progress record
                progress = {
                    user_id: userId,
                    study_item_id: studyItemId,
                    correct_count: 0,
                    incorrect_count: 0,
                    last_reviewed: now.toISOString(),
                    next_review: now.toISOString(),
                    interval: 1,
                    ease_factor: 2.5,
                    streak: 0,
                    created_at: now.toISOString(),
                    updated_at: now.toISOString()
                };
            }

            // Update progress based on answer
            if (isCorrect) {
                progress.correct_count++;
                progress.streak++;

                // SM-2 algorithm for spaced repetition
                if (progress.streak === 1) {
                    progress.interval = 1;
                } else if (progress.streak === 2) {
                    progress.interval = 6;
                } else {
                    progress.interval = Math.round(progress.interval * progress.ease_factor);
                }

                progress.ease_factor = Math.max(1.3, progress.ease_factor + 0.1);
            } else {
                progress.incorrect_count++;
                progress.streak = 0;
                progress.interval = 1;
                progress.ease_factor = Math.max(1.3, progress.ease_factor - 0.2);
            }

            // Calculate next review date
            const nextReview = new Date(now);
            nextReview.setDate(nextReview.getDate() + progress.interval);
            progress.next_review = nextReview.toISOString();
            progress.last_reviewed = now.toISOString();
            progress.updated_at = now.toISOString();

            // Save progress
            const { error: saveError } = await this.supabase
                .from('spanish_study_progress')
                .upsert(progress, { onConflict: 'user_id,study_item_id' });

            if (saveError) {
                console.error('Error saving progress:', saveError);
            }

        } catch (error) {
            console.error('Error recording answer:', error);
        }
    }

    /**
     * Get study progress statistics
     */
    async getProgressStats(userId: string): Promise<{
        totalItems: number;
        reviewedItems: number;
        correctRate: number;
        streak: number;
        dueForReview: number;
    }> {
        if (!this.supabase) {
            return {
                totalItems: 0,
                reviewedItems: 0,
                correctRate: 0,
                streak: 0,
                dueForReview: 0
            };
        }

        try {
            const now = new Date().toISOString();

            // Get total items
            const { count: totalItems } = await this.supabase
                .from('spanish_study_items')
                .select('*', { count: 'exact', head: true });

            // Get reviewed items
            const { data: reviewedData } = await this.supabase
                .from('spanish_study_progress')
                .select('correct_count, incorrect_count, streak')
                .eq('user_id', userId);

            // Get items due for review
            const { count: dueForReview } = await this.supabase
                .from('spanish_study_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .lte('next_review', now);

            const reviewedItems = reviewedData?.length || 0;
            const totalCorrect = reviewedData?.reduce((sum, item) => sum + item.correct_count, 0) || 0;
            const totalIncorrect = reviewedData?.reduce((sum, item) => sum + item.incorrect_count, 0) || 0;
            const totalAnswers = totalCorrect + totalIncorrect;
            const correctRate = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
            const maxStreak = reviewedData?.reduce((max, item) => Math.max(max, item.streak), 0) || 0;

            return {
                totalItems: totalItems || 0,
                reviewedItems,
                correctRate: Math.round(correctRate),
                streak: maxStreak,
                dueForReview: dueForReview || 0
            };

        } catch (error) {
            console.error('Error getting progress stats:', error);
            return {
                totalItems: 0,
                reviewedItems: 0,
                correctRate: 0,
                streak: 0,
                dueForReview: 0
            };
        }
    }
}

export const spanishStudyService = new SpanishStudyService();
