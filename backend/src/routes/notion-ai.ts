import { Router } from 'express';
import { notionAIService } from '../services/notion-ai';

const router = Router();

// Generate task breakdown
router.post('/notion-ai/breakdown', async (req, res) => {
    try {
        const { task } = req.body;

        if (!task) {
            return res.status(400).json({ error: 'Task is required' });
        }

        const breakdown = await notionAIService.generateTaskBreakdown(task);

        res.json({
            success: true,
            breakdown,
            suggestions: [
                'Add steps to Notion task list',
                'Set up reminders for each step',
                'Create focus session plan'
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate breakdown'
        });
    }
});

// Generate routine variations
router.get('/notion-ai/routine-variations', async (req, res) => {
    try {
        const variations = await notionAIService.generateMorningRoutineVariations();

        res.json({
            success: true,
            variations,
            suggestions: [
                'Schedule one for tomorrow',
                'Create rotation schedule',
                'Customize variations'
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate variations'
        });
    }
});

// Generate study questions
router.post('/notion-ai/study-questions', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const questions = await notionAIService.generateGreenCardStudyQuestions(topic);

        res.json({
            success: true,
            topic,
            questions,
            suggestions: [
                'Add to Notion study database',
                'Create quiz session',
                'Schedule practice time'
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate questions'
        });
    }
});

// Generate ADHD-friendly suggestions
router.post('/notion-ai/adhd-suggestions', async (req, res) => {
    try {
        const { context } = req.body;

        if (!context) {
            return res.status(400).json({ error: 'Context is required' });
        }

        const suggestions = await notionAIService.generateADHDFriendlySuggestions(context);

        res.json({
            success: true,
            context,
            suggestions,
            actions: [
                'Add to Notion ADHD strategies page',
                'Set up reminders for techniques',
                'Create personalized action plan'
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate suggestions'
        });
    }
});

// Generate weekly reflection
router.get('/notion-ai/weekly-reflection', async (req, res) => {
    try {
        const template = await notionAIService.generateWeeklyReflection();

        res.json({
            success: true,
            template,
            actions: [
                'Create as Notion page',
                'Schedule weekly reflection time',
                'Set up automated reminders'
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate reflection'
        });
    }
});

export default router;
