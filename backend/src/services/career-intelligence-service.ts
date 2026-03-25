import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export interface JobLead {
  company: string;
  role: string;
  status: string;
  tech_stack: string[];
  compensation: any;
  next_steps: string;
}

export interface CareerIntelligenceBriefing {
  dailyBattlePlan: {
    priority: string;
    actionItems: string[];
    outreachTemplate?: string;
  };
  marketInsights: string[];
  strategyAdjustments: string[];
  timestamp: string;
}

export class CareerIntelligenceService {
  private anthropic: Anthropic;
  private supabase: any;
  private workspaceRoot: string;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
    
    // Resolve workspace root (assuming we're in life-os/personal-assistant/backend)
    this.workspaceRoot = path.resolve(__dirname, '../../../../..');
  }

  private async getActiveLeads(): Promise<JobLead[]> {
    const leadsDir = path.join(this.workspaceRoot, 'career-orchestrator/data/job-leads');
    try {
      const files = await fs.readdir(leadsDir);
      const leads: JobLead[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(leadsDir, file), 'utf-8');
          leads.push(JSON.parse(content));
        }
      }
      return leads;
    } catch (error) {
      console.error('Error reading job leads:', error);
      return [];
    }
  }

  private async getCareerGoals(): Promise<string> {
    const goalsPath = path.join(this.workspaceRoot, 'career-orchestrator/profile/GOALS.md');
    try {
      return await fs.readFile(goalsPath, 'utf-8');
    } catch (error) {
      console.error('Error reading career goals:', error);
      return '';
    }
  }

  async generateDailyBriefing(): Promise<CareerIntelligenceBriefing> {
    const leads = await this.getActiveLeads();
    const goals = await this.getCareerGoals();

    const prompt = `
      You are the AI Strategist for Justin Pease's Life-OS. 
      Your mission is to help him land a foundational AI Product Engineer or Solutions Architect role ($200k-$300k).

      Current Career Goals:
      ${goals}

      Active Job Leads:
      ${JSON.stringify(leads, null, 2)}

      Based on this context, generate a "Daily Battle Plan" for today.
      Focus on high-leverage actions: following up on warm leads, tailoring his "AI Philosophy" for specific companies, or researching tech stack alignment.

      Provide the response in JSON format:
      {
        "dailyBattlePlan": {
          "priority": "The #1 thing he must do today",
          "actionItems": ["Task 1", "Task 2"],
          "outreachTemplate": "Optional: A short, high-impact message for a recruiter or HM"
        },
        "marketInsights": ["Relevant trend or insight"],
        "strategyAdjustments": ["Advice on how to pivot or refine his approach"]
      }
    `;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content properly based on Anthropic SDK structure
    const content = response.content[0];
    if (content.type !== 'text') {
        throw new Error('Unexpected response format from Anthropic');
    }
    
    const briefing = JSON.parse(content.text);
    
    const result = {
      ...briefing,
      timestamp: new Date().toISOString()
    };

    // Log to Supabase if available
    if (this.supabase) {
      await this.supabase.from('career_briefings').insert([result]);
    }

    return result;
  }
}

export const careerIntelligenceService = new CareerIntelligenceService();
