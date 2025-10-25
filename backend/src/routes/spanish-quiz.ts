import { Router } from 'express';
import { spanishStudyService } from '../services/spanish-study';

export const spanishQuizRouter = Router();

/**
 * Sync Spanish study content from Notion
 */
spanishQuizRouter.post('/sync', async (req, res) => {
    try {
        const userId = req.body.userId || 'default-user';
        console.log(`📚 Syncing Spanish study content for user: ${userId}`);

        const result = await spanishStudyService.syncFromNotion(userId);

        res.json({
            success: true,
            message: 'Spanish study content synced successfully',
            data: result
        });

    } catch (error) {
        console.error('❌ Error syncing Spanish content:', error);
        res.status(500).json({
            error: 'Failed to sync Spanish study content',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get next question for review
 */
spanishQuizRouter.get('/next-question', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';
        console.log(`❓ Getting next Spanish question for user: ${userId}`);

        const question = await spanishStudyService.getNextQuestion(userId);

        if (!question) {
            return res.json({
                success: true,
                data: {
                    question: null,
                    message: 'No questions available. Try syncing content from Notion first.'
                }
            });
        }

        res.json({
            success: true,
            data: {
                question
            }
        });

    } catch (error) {
        console.error('❌ Error getting next question:', error);
        res.status(500).json({
            error: 'Failed to get next question',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Submit answer and get feedback
 */
spanishQuizRouter.post('/answer', async (req, res) => {
    try {
        const { userId, questionId, answer, responseTime } = req.body;

        if (!userId || !questionId || answer === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'userId, questionId, and answer are required'
            });
        }

        console.log(`📝 Recording Spanish answer for user: ${userId}`);

        // For now, we'll do simple text matching
        // In a real implementation, you might want more sophisticated matching
        const question = await spanishStudyService.getNextQuestion(userId);
        if (!question) {
            return res.status(404).json({
                error: 'Question not found',
                message: 'The question may have expired or been completed'
            });
        }

        const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

        // Record the answer
        await spanishStudyService.recordAnswer(
            userId,
            questionId,
            isCorrect,
            responseTime || 0
        );

        res.json({
            success: true,
            data: {
                isCorrect,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                feedback: isCorrect
                    ? '¡Correcto! Well done!'
                    : `Not quite. The correct answer is: "${question.correctAnswer}"`
            }
        });

    } catch (error) {
        console.error('❌ Error submitting answer:', error);
        res.status(500).json({
            error: 'Failed to submit answer',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get study progress statistics
 */
spanishQuizRouter.get('/progress', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';
        console.log(`📊 Getting Spanish study progress for user: ${userId}`);

        const stats = await spanishStudyService.getProgressStats(userId);

        res.json({
            success: true,
            data: stats
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
 * Get all study items (for debugging/admin)
 */
spanishQuizRouter.get('/items', async (req, res) => {
    try {
        const userId = req.query.userId as string || 'default-user';
        console.log(`📚 Getting Spanish study items for user: ${userId}`);

        // This would require adding a method to the service
        // For now, just return a placeholder
        res.json({
            success: true,
            data: {
                items: [],
                message: 'Study items endpoint not yet implemented'
            }
        });

    } catch (error) {
        console.error('❌ Error getting study items:', error);
        res.status(500).json({
            error: 'Failed to get study items',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default spanishQuizRouter;
