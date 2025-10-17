// Proactive Notion AI integration
export class ProactiveNotionAI {
    async generateWeeklyInsights(userId: string) {
        console.log('📊 Generating weekly insights with Notion AI...');

        try {
            // Get user's weekly data
            const weeklyData = await this.getWeeklyData(userId);

            // Use Notion AI to analyze patterns
            const insights = await notionAIService.generateADHDFriendlySuggestions(
                `Weekly analysis: ${JSON.stringify(weeklyData)}`
            );

            // Send proactive notification
            await notificationService.sendProactiveNotification({
                type: 'weekly_insights',
                title: '📊 Weekly Insights (via Notion AI)',
                body: insights,
                action: 'view_weekly_insights',
                userId,
                priority: 'medium',
                data: { insights, weeklyData }
            });

        } catch (error) {
            console.error('Weekly insights generation failed:', error);
        }
    }

    async generateDailyMotivation(userId: string) {
        console.log('💪 Generating daily motivation with Notion AI...');

        try {
            const motivation = await notionAIService.generateADHDFriendlySuggestions(
                'Generate motivational message for someone with ADHD working on Green Card interview prep and iOS development'
            );

            await notificationService.sendProactiveNotification({
                type: 'daily_motivation',
                title: '💪 Daily Motivation (via Notion AI)',
                body: motivation,
                action: 'view_motivation',
                userId,
                priority: 'low',
                data: { motivation }
            });

        } catch (error) {
            console.error('Daily motivation generation failed:', error);
        }
    }

    private async getWeeklyData(userId: string) {
        // Get user's weekly progress data
        return {
            tasksCompleted: 15,
            habitsStreak: 7,
            studyHours: 12,
            workoutDays: 5,
            focusScore: 75
        };
    }
}
