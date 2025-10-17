import { createClient } from '@supabase/supabase-js';

export interface WakeLog {
    user_id: string;
    wake_time: Date;
    sleep_data: {
        sleepScore: number;
        sleepDuration: number;
        sleepEfficiency: number;
        deepSleep: number;
        remSleep: number;
    };
}

export interface MorningRoutineStep {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number; // in minutes
    order: number;
    completed: boolean;
    completedAt?: Date;
}

export class MorningRoutineService {
    private supabase: any;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        } else {
            console.warn('⚠️ Supabase not configured for morning routine service');
        }
    }

    /**
     * Log wake time and sleep data
     */
    async logWakeTime(userId: string, wakeTime: Date, sleepData: any): Promise<void> {
        try {
            if (!this.supabase) {
                console.warn('⚠️ Cannot log wake time - Supabase not configured');
                return;
            }

            const { error } = await this.supabase
                .from('morning_routine_logs')
                .insert({
                    user_id: userId,
                    wake_time: wakeTime.toISOString(),
                    sleep_score: sleepData.sleepScore,
                    sleep_duration: sleepData.sleepDuration,
                    sleep_efficiency: sleepData.sleepEfficiency,
                    deep_sleep_duration: sleepData.deepSleep,
                    rem_sleep_duration: sleepData.remSleep,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('❌ Error logging wake time:', error);
            } else {
                console.log('📊 Wake time logged successfully');
            }

        } catch (error) {
            console.error('❌ Error in logWakeTime:', error);
        }
    }

    /**
     * Get morning routine steps for user
     */
    getMorningRoutineSteps(): MorningRoutineStep[] {
        return [
            {
                id: 'wake_grounding',
                name: 'Wake + Grounding',
                description: 'Prayer, gratitude, make bed, get dressed, take meds',
                estimatedDuration: 15,
                order: 1,
                completed: false
            },
            {
                id: 'reset_space',
                name: 'Reset Your Space',
                description: 'Make coffee, tidy up kitchen and living room, fill water bottle',
                estimatedDuration: 15,
                order: 2,
                completed: false
            },
            {
                id: 'identity_direction',
                name: 'Identity + Direction',
                description: 'Personal notebook: affirmations, goals, battle plan review',
                estimatedDuration: 15,
                order: 3,
                completed: false
            },
            {
                id: 'workout',
                name: 'Workout',
                description: 'Weight lifting or cardio based on schedule',
                estimatedDuration: 30,
                order: 4,
                completed: false
            },
            {
                id: 'cool_down',
                name: 'Cool Down',
                description: 'Post-workout rinse, brush teeth, apply minoxidil, breakfast shake',
                estimatedDuration: 15,
                order: 5,
                completed: false
            },
            {
                id: 'recenter',
                name: 'Recenter',
                description: 'Bible study, Spanish study, review to-do list, check email',
                estimatedDuration: 30,
                order: 6,
                completed: false
            }
        ];
    }

    /**
     * Start morning routine tracking for user
     */
    async startMorningRoutine(userId: string): Promise<void> {
        try {
            console.log('🌅 Starting morning routine tracking for user:', userId);

            const steps = this.getMorningRoutineSteps();

            // Import notification service
            const { sendProactiveNotification } = await import('./notifications');

            // Send first step notification
            const firstStep = steps[0];
            await sendProactiveNotification({
                userId,
                type: 'morning_routine_step',
                title: `Step 1: ${firstStep.name} 🌅`,
                body: firstStep.description,
                data: {
                    stepId: firstStep.id,
                    stepOrder: firstStep.order,
                    totalSteps: steps.length,
                    estimatedDuration: firstStep.estimatedDuration
                },
                action: 'complete_step',
                priority: 'high'
            });

            // Log routine start
            await this.logRoutineStart(userId);

            console.log('✅ Morning routine started successfully');

        } catch (error) {
            console.error('❌ Error starting morning routine:', error);
            throw error;
        }
    }

    /**
     * Complete a morning routine step
     */
    async completeStep(userId: string, stepId: string): Promise<void> {
        try {
            console.log('✅ Completing morning routine step:', stepId);

            // Log step completion
            await this.logStepCompletion(userId, stepId);

            // Check if all steps are complete
            const nextStep = this.getNextStep(stepId);

            if (nextStep) {
                // Send next step notification
                const { sendProactiveNotification } = await import('./notifications');

                await sendProactiveNotification({
                    userId,
                    type: 'morning_routine_step',
                    title: `Step ${nextStep.order}: ${nextStep.name} 🎯`,
                    body: nextStep.description,
                    data: {
                        stepId: nextStep.id,
                        stepOrder: nextStep.order,
                        totalSteps: 6,
                        estimatedDuration: nextStep.estimatedDuration
                    },
                    action: 'complete_step',
                    priority: 'medium'
                });

                console.log(`📋 Next step: ${nextStep.name}`);
            } else {
                // All steps complete
                await this.completeMorningRoutine(userId);
            }

        } catch (error) {
            console.error('❌ Error completing step:', error);
            throw error;
        }
    }

    /**
     * Get next step in routine
     */
    private getNextStep(currentStepId: string): MorningRoutineStep | null {
        const steps = this.getMorningRoutineSteps();
        const currentIndex = steps.findIndex(step => step.id === currentStepId);

        if (currentIndex >= 0 && currentIndex < steps.length - 1) {
            return steps[currentIndex + 1];
        }

        return null;
    }

    /**
     * Complete entire morning routine
     */
    private async completeMorningRoutine(userId: string): Promise<void> {
        try {
            console.log('🎉 Morning routine completed!');

            const { sendProactiveNotification } = await import('./notifications');

            await sendProactiveNotification({
                userId,
                type: 'morning_routine_complete',
                title: 'Morning routine complete! 🎉',
                body: 'Excellent work! You\'ve set yourself up for a productive day. Ready to tackle your goals?',
                data: {
                    completedAt: new Date().toISOString(),
                    totalSteps: 6
                },
                action: 'view_daily_goals',
                priority: 'medium'
            });

            // Log routine completion
            await this.logRoutineCompletion(userId);

        } catch (error) {
            console.error('❌ Error completing morning routine:', error);
        }
    }

    /**
     * Log routine start
     */
    private async logRoutineStart(userId: string): Promise<void> {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('morning_routine_logs')
                .update({
                    routine_started_at: new Date().toISOString(),
                    status: 'in_progress'
                })
                .eq('user_id', userId)
                .eq('date', new Date().toISOString().split('T')[0]);

            if (error) {
                console.error('❌ Error logging routine start:', error);
            }
        } catch (error) {
            console.error('❌ Error in logRoutineStart:', error);
        }
    }

    /**
     * Log step completion
     */
    private async logStepCompletion(userId: string, stepId: string): Promise<void> {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('morning_routine_logs')
                .update({
                    [`${stepId}_completed_at`]: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('date', new Date().toISOString().split('T')[0]);

            if (error) {
                console.error('❌ Error logging step completion:', error);
            }
        } catch (error) {
            console.error('❌ Error in logStepCompletion:', error);
        }
    }

    /**
     * Log routine completion
     */
    private async logRoutineCompletion(userId: string): Promise<void> {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('morning_routine_logs')
                .update({
                    routine_completed_at: new Date().toISOString(),
                    status: 'completed'
                })
                .eq('user_id', userId)
                .eq('date', new Date().toISOString().split('T')[0]);

            if (error) {
                console.error('❌ Error logging routine completion:', error);
            }
        } catch (error) {
            console.error('❌ Error in logRoutineCompletion:', error);
        }
    }

    /**
     * Get today's routine progress
     */
    async getTodaysProgress(userId: string): Promise<any> {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('morning_routine_logs')
                .select('*')
                .eq('user_id', userId)
                .eq('date', new Date().toISOString().split('T')[0])
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('❌ Error fetching routine progress:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('❌ Error in getTodaysProgress:', error);
            return null;
        }
    }
}

export const morningRoutineService = new MorningRoutineService();

// Export individual functions for easier imports
export const logWakeTime = (userId: string, wakeTime: Date, sleepData: any) =>
    morningRoutineService.logWakeTime(userId, wakeTime, sleepData);

