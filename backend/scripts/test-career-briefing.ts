import { careerIntelligenceService } from '../src/services/career-intelligence-service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the backend .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('🚀 Generating Daily Career Intelligence Briefing...');
  
  try {
    const briefing = await careerIntelligenceService.generateDailyBriefing();
    
    console.log('\n--- 🎯 TODAY\'S BATTLE PLAN ---');
    console.log(`Priority: ${briefing.dailyBattlePlan.priority}`);
    console.log('\nAction Items:');
    briefing.dailyBattlePlan.actionItems.forEach(item => console.log(`- ${item}`));
    
    if (briefing.dailyBattlePlan.outreachTemplate) {
      console.log('\n--- 📧 OUTREACH TEMPLATE ---');
      console.log(briefing.dailyBattlePlan.outreachTemplate);
    }
    
    console.log('\n--- 💡 MARKET INSIGHTS ---');
    briefing.marketInsights.forEach(insight => console.log(`- ${insight}`));
    
    console.log('\n--- 📈 STRATEGY ADJUSTMENTS ---');
    briefing.strategyAdjustments.forEach(adj => console.log(`- ${adj}`));
    
  } catch (error) {
    console.error('❌ Failed to generate briefing:', error);
  }
}

main();
