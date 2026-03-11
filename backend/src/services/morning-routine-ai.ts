import { notionService } from './notion-service';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

interface AIStep {
    id: string;
    title: string;
    checklist: string[];
    estimatedMinutes: number;
    dependencies?: string[];
    energyLevel: 'low' | 'medium' | 'high';
    frictionPoints: string[];
    microWins: string[];
    fallbacks: string[];
    section?: string;
    timing?: string;
}

interface AISection {
    title: string;
    intent: string;
    whyItMatters: string;
    estimatedMinutes: number;
    steps: AIStep[];
}

interface AICoaching {
    bottlenecks: string[];
    suggestedTimers: Array<{ stepId: string; duration: number; description: string }>;
    accountabilityHooks: string[];
    rewardIdeas: string[];
    timingSuggestions: string[];
}

interface AISchedule {
    startTime: string; // e.g., "06:00"
    endTime: string;
    bufferMinutes: number;
    idealTiming: string;
}

interface AIRoutineAnalysis {
    sections: AISection[];
    coaching: AICoaching;
    schedule: AISchedule;
    metadata: {
        totalEstimatedMinutes: number;
        criticalPath: string[];
        optionalSteps: string[];
        version: string;
        analyzedAt: string;
    };
}

export class MorningRoutineAIService {
    private supabase: any;
    private anthropic: Anthropic;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        }

        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (anthropicKey) {
            this.anthropic = new Anthropic({ apiKey: anthropicKey });
        }
    }

    /**
     * Analyze morning routine using AI and return structured plan
     */
    async analyzeRoutine(userId: string, notionPageId: string): Promise<AIRoutineAnalysis> {
        console.log('🤖 Analyzing morning routine with AI...');

        // Check if we have a cached analysis
        const cached = await this.getCachedAnalysis(userId, notionPageId);
        if (cached) {
            console.log('✅ Using cached routine analysis');
            return cached.analysis_data;
        }

        // Get Notion content
        const notionContent = await notionService.getPageContent(notionPageId, false);

        // Have Claude analyze the content
        const systemPrompt = `You are an expert ADHD coach specializing in helping people build sustainable morning routines. 

Your task is to analyze a morning routine from Notion and create:
1. A structured plan with sections, steps, and checklists
2. Smart coaching insights about friction points and timing
3. Personalized recommendations based on ADHD principles

Key principles:
- Break down every task into tiny, concrete checklists (execution clarity)
- Identify energy levels needed for each step
- Anticipate where they'll get stuck (friction points)
- Create micro-wins (tiny rewards for each step)
- Provide fallback options for when motivation is low
- Suggest timing based on natural energy patterns

Return your analysis as structured JSON.`;

        const userPrompt = `Analyze this morning routine and create a structured plan:

${notionContent.content}

Return a JSON object with this structure:
{
  "sections": [
    {
      "title": "Section name",
      "intent": "What this section accomplishes",
      "whyItMatters": "Why this matters to the person",
      "estimatedMinutes": 15,
      "steps": [
        {
          "id": "wake_1",
          "title": "Wake up (one snooze)",
          "checklist": ["Set alarm", "One snooze allowed", "Turn off alarm", "Turn on lights"],
          "estimatedMinutes": 5,
          "dependencies": [],
          "energyLevel": "low",
          "frictionPoints": ["Hard to wake up", "Temptation to snooze more"],
          "microWins": ["Lights on within 2 minutes"],
          "fallbacks": ["Coffee first, then wake up properly"],
          "section": "Wake + Grounding",
          "timing": "06:00"
        }
      ]
    }
  ],
  "coaching": {
    "bottlenecks": ["What's likely to slow them down"],
    "suggestedTimers": [
      {"stepId": "wake_1", "duration": 5, "description": "5 min alarm to get out of bed"}
    ],
    "accountabilityHooks": ["Partner checks in at 6:15", "Post workout photo"],
    "rewardIdeas": ["Coffee after step 2", "Phone time after all steps done"],
    "timingSuggestions": ["Wake at consistent time to build circadian rhythm"]
  },
  "schedule": {
    "startTime": "06:00",
    "endTime": "08:00",
    "bufferMinutes": 15,
    "idealTiming": "Early morning when willpower is highest"
  },
  "metadata": {
    "totalEstimatedMinutes": 90,
    "criticalPath": ["Steps that must be done in order"],
    "optionalSteps": ["Steps that can be skipped if time is tight"],
    "version": "1.0",
    "analyzedAt": "${new Date().toISOString()}"
  }
}`;

        const response = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });

        const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
        const analysis: AIRoutineAnalysis = JSON.parse(analysisText);

        // Cache the analysis
        await this.cacheAnalysis(userId, notionPageId, analysis);

        console.log(`✅ Routine analyzed: ${analysis.sections.length} sections, ${analysis.metadata.totalEstimatedMinutes} minutes total`);

        return analysis;
    }

    /**
     * Get cached analysis if available and fresh
     */
    private async getCachedAnalysis(userId: string, notionPageId: string): Promise<any | null> {
        if (!this.supabase) return null;

        const { data, error } = await this.supabase
            .from('morning_routine_analysis')
            .select('analysis_data, updated_at')
            .eq('user_id', userId)
            .eq('notion_page_id', notionPageId)
            .single();

        if (error || !data) return null;

        // Cache valid for 1 week
        const cacheAge = new Date().getTime() - new Date(data.updated_at).getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (cacheAge > oneWeek) return null;

        return data;
    }

    /**
     * Cache the analysis in database
     */
    private async cacheAnalysis(userId: string, notionPageId: string, analysis: AIRoutineAnalysis): Promise<void> {
        if (!this.supabase) return;

        await this.supabase
            .from('morning_routine_analysis')
            .upsert({
                user_id: userId,
                notion_page_id: notionPageId,
                analysis_data: analysis,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,notion_page_id'
            });
    }

    /**
     * Track step completion for learning
     */
    async trackStep(userId: string, step: AIStep, startedAt: Date, completedAt?: Date, skipped?: boolean): Promise<void> {
        if (!this.supabase) return;

        const actualMinutes = completedAt
            ? Math.round((completedAt.getTime() - startedAt.getTime()) / 60000)
            : null;

        await this.supabase
            .from('morning_routine_tracking')
            .insert({
                user_id: userId,
                step_id: step.id,
                step_title: step.title,
                section: step.section,
                started_at: startedAt.toISOString(),
                completed_at: completedAt?.toISOString(),
                estimated_minutes: step.estimatedMinutes,
                actual_minutes: actualMinutes,
                skipped: skipped || false,
                friction_points: step.frictionPoints,
                used_fallback: false,
                energy_level: step.energyLevel
            });
    }

    /**
     * Get insights from step tracking data
     */
    async getInsights(userId: string, limit: number = 7): Promise<{
        averageStepTime: number;
        mostStruggledSteps: Array<{ step: string; avgTime: number; skipRate: number }>;
        suggestedImprovements: string[];
    }> {
        if (!this.supabase) {
            return {
                averageStepTime: 0,
                mostStruggledSteps: [],
                suggestedImprovements: []
            };
        }

        const { data } = await this.supabase
            .from('morning_routine_tracking')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit * 50); // Get enough data for analysis

        if (!data || data.length === 0) {
            return {
                averageStepTime: 0,
                mostStruggledSteps: [],
                suggestedImprovements: []
            };
        }

        // Analyze the data
        const totalTime = data
            .filter(t => t.actual_minutes)
            .reduce((sum, t) => sum + t.actual_minutes, 0);
        const completedCount = data.filter(t => t.completed_at).length;
        const averageStepTime = completedCount > 0 ? totalTime / completedCount : 0;

        // Group by step
        const stepStats = new Map<string, { times: number[]; skips: number }>();
        for (const record of data) {
            if (!stepStats.has(record.step_id)) {
                stepStats.set(record.step_id, { times: [], skips: 0 });
            }
            const stats = stepStats.get(record.step_id)!;
            if (record.actual_minutes) {
                stats.times.push(record.actual_minutes);
            }
            if (record.skipped) {
                stats.skips++;
            }
        }

        const mostStruggledSteps = Array.from(stepStats.entries())
            .map(([step, stats]) => ({
                step,
                avgTime: stats.times.reduce((a, b) => a + b, 0) / stats.times.length,
                skipRate: stats.skips / (stats.times.length + stats.skips) || 0
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 5);

        return {
            averageStepTime,
            mostStruggledSteps,
            suggestedImprovements: [] // Could add AI-generated suggestions here
        };
    }
}

export const morningRoutineAIService = new MorningRoutineAIService();

