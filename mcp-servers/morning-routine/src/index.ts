import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_MORNING_ROUTINE_PORT || 4014;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Morning routine steps from docs/goals.md
const ROUTINE_STEPS = [
    { id: '1', name: 'Wake + Grounding', duration_mins: 15, time: '6:00-6:15', details: 'Wake up, prayer, make bed, get dressed, take meds' },
    { id: '2', name: 'Reset Your Space', duration_mins: 15, time: '6:15-6:30', details: 'Make coffee, tidy kitchen/living room, fill water bottle' },
    { id: '3', name: 'Identity + Direction', duration_mins: 15, time: '6:30-6:45', details: 'Personal notebook, affirmations, goals review, Battle Plan' },
    { id: '4', name: 'Workout', duration_mins: 30, time: '6:45-7:15', details: 'Protein shake, weight lifting or cardio' },
    { id: '5', name: 'Cool Down', duration_mins: 15, time: '7:15-7:30', details: 'Shower, brush teeth, apply minoxidil, breakfast shake' },
    { id: '6', name: 'Recenter', duration_mins: 30, time: '7:30-8:00', details: 'Bible study, Spanish study, review to-do list, email scan' }
];

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'morning-routine-mcp' });
});

// Tool: get_routine_steps
app.post('/tools/get_routine_steps', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                steps: ROUTINE_STEPS,
                total_duration_mins: ROUTINE_STEPS.reduce((sum, step) => sum + step.duration_mins, 0)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: start_routine
app.post('/tools/start_routine', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Create routine completion record
        const { data, error } = await supabase
            .from('routine_completions')
            .insert({
                user_id: userId || 'default-user',
                date: today,
                completed: false,
                steps_completed: 0,
                steps_skipped: 0
            })
            .select()
            .single();

        if (error) {
            // If already exists for today, just return it
            const { data: existing } = await supabase
                .from('routine_completions')
                .select('*')
                .eq('user_id', userId || 'default-user')
                .eq('date', today)
                .single();

            if (existing) {
                return res.json({
                    success: true,
                    data: {
                        completion_id: existing.id,
                        current_step: ROUTINE_STEPS[0],
                        started_at: new Date().toISOString()
                    },
                    message: 'Routine already started today, continuing...'
                });
            }

            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            data: {
                completion_id: data.id,
                current_step: ROUTINE_STEPS[0],
                started_at: new Date().toISOString()
            },
            message: 'Morning routine started! First step: ' + ROUTINE_STEPS[0].name
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: complete_step
app.post('/tools/complete_step', async (req, res) => {
    try {
        const { step_id, completion_id, time_spent_mins } = req.body;

        if (!completion_id || !step_id) {
            return res.status(400).json({ error: 'Completion ID and step ID are required' });
        }

        const step = ROUTINE_STEPS.find(s => s.id === step_id);
        if (!step) {
            return res.status(404).json({ error: 'Step not found' });
        }

        // Log step completion
        await supabase
            .from('routine_step_logs')
            .insert({
                completion_id,
                step_name: step.name,
                step_order: parseInt(step_id),
                completed: true,
                time_spent_mins: time_spent_mins || step.duration_mins
            });

        // Update routine completion
        const { data: completion } = await supabase
            .from('routine_completions')
            .select('steps_completed')
            .eq('id', completion_id)
            .single();

        const newStepsCompleted = (completion?.steps_completed || 0) + 1;
        const isFullyCompleted = newStepsCompleted >= ROUTINE_STEPS.length;

        await supabase
            .from('routine_completions')
            .update({
                steps_completed: newStepsCompleted,
                completed: isFullyCompleted
            })
            .eq('id', completion_id);

        // Get next step
        const nextStepIndex = parseInt(step_id);
        const nextStep = nextStepIndex < ROUTINE_STEPS.length ? ROUTINE_STEPS[nextStepIndex] : null;

        res.json({
            success: true,
            data: {
                completed_step: step.name,
                next_step: nextStep,
                progress: `${newStepsCompleted}/${ROUTINE_STEPS.length}`,
                routine_complete: isFullyCompleted
            },
            message: isFullyCompleted
                ? '🎉 Morning routine complete! Great job!'
                : `✅ ${step.name} complete! Next: ${nextStep?.name}`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tool: get_routine_status
app.post('/tools/get_routine_status', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const { data: completion } = await supabase
            .from('routine_completions')
            .select('*, routine_step_logs(*)')
            .eq('user_id', userId || 'default-user')
            .eq('date', today)
            .single();

        if (!completion) {
            return res.json({
                success: true,
                data: {
                    started: false,
                    message: 'Morning routine not started yet today'
                }
            });
        }

        const completedSteps = completion.steps_completed || 0;
        const currentStepIndex = completedSteps < ROUTINE_STEPS.length ? completedSteps : ROUTINE_STEPS.length - 1;

        res.json({
            success: true,
            data: {
                started: true,
                completed: completion.completed,
                current_step: ROUTINE_STEPS[currentStepIndex],
                progress: `${completedSteps}/${ROUTINE_STEPS.length}`,
                steps_completed: completedSteps,
                steps_skipped: completion.steps_skipped || 0
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🌅 Morning Routine MCP server running on http://localhost:${PORT}`);
});

