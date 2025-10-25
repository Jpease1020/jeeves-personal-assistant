import { Router } from 'express';
import { notionService } from '../services/notion-service';
import { morningRoutineService } from '../services/morning-routine';

export const morningRoutineRouter = Router();

// In-memory storage for daily progress (resets at midnight)
let dailyProgress: {
    [userId: string]: {
        steps: Array<{
            id: string;
            name: string;
            description: string;
            completed: boolean;
            completedAt?: Date;
            estimatedDuration: number;
        }>;
        startedAt?: Date;
        completedAt?: Date;
        notionPageId?: string;
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
 * Start morning routine - reads steps from Notion
 */
morningRoutineRouter.post('/start', async (req, res) => {
    try {
        const userId = req.body.userId || 'default-user';
        console.log(`🌅 Starting morning routine for user: ${userId}`);

        // Find morning routine page in Notion
        const notionPage = await notionService.findMorningRoutinePage();

        if (!notionPage) {
            return res.status(404).json({
                error: 'Morning routine page not found in Notion',
                message: 'Please create a morning routine page in Notion with keywords like "morning", "routine", or "daily routine"'
            });
        }

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

        res.json({
            success: true,
            message: 'Morning routine started successfully',
            data: {
                steps: dailyProgress[userId].steps,
                totalSteps: steps.length,
                notionPage: {
                    id: notionPage.id,
                    title: notionPage.title,
                    url: notionPage.url
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
 */
function parseStepsFromNotionContent(content: string, tasks: any[]): Array<{
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
}> {
    const steps: Array<{
        id: string;
        name: string;
        description: string;
        estimatedDuration: number;
    }> = [];

    // First, try to parse from tasks (to-do items)
    if (tasks.length > 0) {
        tasks.forEach((task, index) => {
            steps.push({
                id: `step_${index + 1}`,
                name: task.title,
                description: task.title,
                estimatedDuration: 15 // Default duration
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
