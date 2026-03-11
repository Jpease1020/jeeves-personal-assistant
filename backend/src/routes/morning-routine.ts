import { Router } from 'express';
import { notionService } from '../services/notion-service';
import { morningRoutineService } from '../services/morning-routine';
import { morningRoutineAIService } from '../services/morning-routine-ai';

export const morningRoutineRouter = Router();

// Enhanced in-memory storage for AI-guided routine
let dailyProgress: {
    [userId: string]: {
        steps: Array<{
            id: string;
            name: string;
            description: string;
            completed: boolean;
            completedAt?: Date;
            estimatedDuration: number;
            section?: string;
            // AI enhancements
            checklist?: string[];
            frictionPoints?: string[];
            microWins?: string[];
            fallbacks?: string[];
            energyLevel?: string;
            timing?: string;
        }>;
        startedAt?: Date;
        completedAt?: Date;
        notionPageId?: string;
        aiAnalysis?: any;
    };
} = {};

// Reset progress at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        dailyProgress = {};
        console.log('🔄 Daily morning routine progress reset');
    }
}, 60000); // Check every minute

/**
 * Analyze morning routine with AI
 */
morningRoutineRouter.post('/analyze', async (req, res) => {
    try {
        const userId = req.body.userId || 'default-user';
        const notionPageId = '1eaa2b80227d807aa39dec3c7dbfea97';

        console.log(`🤖 Analyzing morning routine with AI for user: ${userId}`);

        const analysis = await morningRoutineAIService.analyzeRoutine(userId, notionPageId);

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('❌ Error analyzing routine:', error);
        res.status(500).json({
            error: 'Failed to analyze routine',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Start morning routine - reads steps from Notion OR uses AI analysis
 */
morningRoutineRouter.post('/start', async (req, res) => {
    try {
        const userId = req.body.userId || 'default-user';
        console.log(`🌅 Starting morning routine for user: ${userId}`);

        // Use specific morning routine page from Notion
        const morningRoutinePageId = '1eaa2b80227d807aa39dec3c7dbfea97';
        const notionPageContent = await notionService.getPageContent(morningRoutinePageId);

        if (!notionPageContent || !notionPageContent.content) {
            return res.status(404).json({
                error: 'Morning routine page not found in Notion',
                message: 'Could not load the morning routine page'
            });
        }

        // Create notionPage object from the content
        const notionPage = {
            id: morningRoutinePageId,
            title: notionPageContent.title,
            content: notionPageContent.content,
            tasks: notionPageContent.tasks
        };

        // Parse steps from Notion content
        const steps = parseStepsFromNotionContent(notionPage.content, notionPage.tasks);

        if (steps.length === 0) {
            return res.status(400).json({
                error: 'No morning routine steps found',
                message: 'Please add steps to your morning routine page in Notion'
            });
        }

        // Initialize daily progress
        dailyProgress[userId] = {
            steps: steps.map(step => ({
                ...step,
                completed: false
            })),
            startedAt: new Date(),
            notionPageId: notionPage.id
        };

        console.log(`✅ Morning routine started with ${steps.length} steps`);

        const completedSteps = dailyProgress[userId].steps.filter(s => s.completed).length;
        const totalSteps = dailyProgress[userId].steps.length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        res.json({
            success: true,
            message: 'Morning routine started successfully',
            data: {
                started: true,
                startedAt: dailyProgress[userId].startedAt,
                steps: dailyProgress[userId].steps,
                progress: {
                    completedSteps,
                    totalSteps,
                    percentage,
                    allCompleted: false
                },
                notionPage: {
                    id: notionPage.id,
                    title: notionPage.title,
                    url: `https://notion.so/${notionPage.id}`
                }
            }
        });

    } catch (error) {
        console.error('❌ Error starting morning routine:', error);
        res.status(500).json({
            error: 'Failed to start morning routine',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Complete a morning routine step
 */
morningRoutineRouter.post('/complete-step', async (req, res) => {
    try {
        const { userId, stepId } = req.body;

        if (!userId || !stepId) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'userId and stepId are required'
            });
        }

        const userProgress = dailyProgress[userId];
        if (!userProgress) {
            return res.status(404).json({
                error: 'Morning routine not started',
                message: 'Please start your morning routine first'
            });
        }

        const step = userProgress.steps.find(s => s.id === stepId);
        if (!step) {
            return res.status(404).json({
                error: 'Step not found',
                message: 'Invalid step ID'
            });
        }

        if (step.completed) {
            return res.status(400).json({
                error: 'Step already completed',
                message: 'This step has already been completed'
            });
        }

        // Mark step as completed
        step.completed = true;
        step.completedAt = new Date();

        // Check if all steps are completed
        const allCompleted = userProgress.steps.every(s => s.completed);
        if (allCompleted) {
            userProgress.completedAt = new Date();
            console.log(`🎉 Morning routine completed for user: ${userId}`);
        }

        console.log(`✅ Step completed: ${step.name} for user: ${userId}`);

        res.json({
            success: true,
            message: 'Step completed successfully',
            data: {
                step: {
                    id: step.id,
                    name: step.name,
                    completed: true,
                    completedAt: step.completedAt
                },
                progress: {
                    completedSteps: userProgress.steps.filter(s => s.completed).length,
                    totalSteps: userProgress.steps.length,
                    allCompleted
                }
            }
        });

    } catch (error) {
        console.error('❌ Error completing step:', error);
        res.status(500).json({
            error: 'Failed to complete step',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get current morning routine progress
 */
morningRoutineRouter.get('/progress', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';

        const userProgress = dailyProgress[userId];
        if (!userProgress) {
            return res.json({
                success: true,
                data: {
                    started: false,
                    steps: [],
                    progress: {
                        completedSteps: 0,
                        totalSteps: 0,
                        percentage: 0
                    }
                }
            });
        }

        const completedSteps = userProgress.steps.filter(s => s.completed).length;
        const totalSteps = userProgress.steps.length;
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        res.json({
            success: true,
            data: {
                started: true,
                startedAt: userProgress.startedAt,
                completedAt: userProgress.completedAt,
                steps: userProgress.steps,
                progress: {
                    completedSteps,
                    totalSteps,
                    percentage,
                    allCompleted: completedSteps === totalSteps
                }
            }
        });

    } catch (error) {
        console.error('❌ Error getting progress:', error);
        res.status(500).json({
            error: 'Failed to get progress',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Parse morning routine steps from Notion content
 * Groups tasks by their section/heading from Notion
 */
function parseStepsFromNotionContent(content: string, tasks: any[]): Array<{
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    section?: string;
}> {
    const steps: Array<{
        id: string;
        name: string;
        description: string;
        estimatedDuration: number;
        section?: string;
    }> = [];

    // First, try to parse from tasks (to-do items/checkboxes)
    if (tasks.length > 0) {
        tasks.forEach((task, index) => {
            // Extract estimated time from task title if present
            const timeMatch = task.title.match(/\((\d+)\s*min\)/i);
            const estimatedDuration = timeMatch ? parseInt(timeMatch[1]) : 10;
            const cleanTitle = task.title.replace(/\((\d+)\s*min\)/i, '').trim();

            // Use the task's list field (which contains the section/group from Notion)
            const section = task.list && task.list !== 'page-content' ? task.list : undefined;

            steps.push({
                id: `step_${index + 1}`,
                name: cleanTitle,
                description: cleanTitle,
                estimatedDuration,
                section
            });
        });
        return steps;
    }

    // If no tasks, try to parse from content text
    const lines = content.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Skip empty lines and headings
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            return;
        }

        // Look for numbered lists or bullet points
        const match = trimmedLine.match(/^[\d+\.\-\*]\s*(.+)/);
        if (match) {
            steps.push({
                id: `step_${index + 1}`,
                name: match[1],
                description: match[1],
                estimatedDuration: 15 // Default duration
            });
        } else if (trimmedLine.length > 10) {
            // Treat any substantial line as a step
            steps.push({
                id: `step_${index + 1}`,
                name: trimmedLine,
                description: trimmedLine,
                estimatedDuration: 15 // Default duration
            });
        }
    });

    // If we still don't have steps, create default ones
    if (steps.length === 0) {
        const defaultSteps = [
            { name: 'Wake up and get ready', description: 'Wake up, make bed, get dressed', duration: 15 },
            { name: 'Morning hygiene', description: 'Brush teeth, wash face, take medications', duration: 10 },
            { name: 'Breakfast', description: 'Eat breakfast and hydrate', duration: 20 },
            { name: 'Plan your day', description: 'Review calendar and priorities', duration: 10 },
            { name: 'Exercise or meditation', description: 'Physical activity or mindfulness practice', duration: 30 }
        ];

        defaultSteps.forEach((step, index) => {
            steps.push({
                id: `default_step_${index + 1}`,
                name: step.name,
                description: step.description,
                estimatedDuration: step.duration
            });
        });
    }

    return steps;
}

export default morningRoutineRouter;
