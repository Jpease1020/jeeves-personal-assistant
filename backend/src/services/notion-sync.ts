// Notion Sync Service - Keeps AI Assistant updated with your tasks
import { Client } from '@notionhq/client';

export class NotionSyncService {
    private notion: Client;

    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY,
        });
    }

    async syncDailyTasks(userId: string) {
        console.log('🔄 Syncing Notion tasks...');

        try {
            // Get today's tasks from Notion
            const todayTasks = await this.getTodayTasks();

            // Get this week's tasks
            const weekTasks = await this.getWeekTasks();

            // Get shared tasks (with wife)
            const sharedTasks = await this.getSharedTasks();

            // Update AI Assistant's understanding
            await this.updateAIContext({
                userId,
                todayTasks,
                weekTasks,
                sharedTasks,
                lastSync: new Date().toISOString()
            });

            // Trigger proactive actions based on tasks
            await this.triggerProactiveActions(todayTasks);

            console.log('✅ Notion sync completed');
            return { success: true, taskCount: todayTasks.length };

        } catch (error) {
            console.error('❌ Sync failed:', error);
            throw error;
        }
    }

    private async getTodayTasks() {
        // Query Notion for today's tasks
        const response = await this.notion.databases.query({
            database_id: process.env.NOTION_TASKS_DATABASE_ID!,
            filter: {
                and: [
                    {
                        property: 'Date',
                        date: {
                            equals: new Date().toISOString().split('T')[0]
                        }
                    },
                    {
                        property: 'Status',
                        select: {
                            does_not_equal: 'Completed'
                        }
                    }
                ]
            }
        });

        return response.results.map(page => ({
            id: page.id,
            title: this.extractTitle(page),
            priority: this.extractPriority(page),
            dueTime: this.extractDueTime(page),
            category: this.extractCategory(page),
            isShared: this.isSharedTask(page)
        }));
    }

    private async getWeekTasks() {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

        const response = await this.notion.databases.query({
            database_id: process.env.NOTION_TASKS_DATABASE_ID!,
            filter: {
                and: [
                    {
                        property: 'Date',
                        date: {
                            between: [
                                startOfWeek.toISOString().split('T')[0],
                                endOfWeek.toISOString().split('T')[0]
                            ]
                        }
                    }
                ]
            }
        });

        return response.results.map(page => ({
            id: page.id,
            title: this.extractTitle(page),
            priority: this.extractPriority(page),
            dueDate: this.extractDueDate(page),
            category: this.extractCategory(page)
        }));
    }

    private async getSharedTasks() {
        // Get tasks marked as shared with wife
        const response = await this.notion.databases.query({
            database_id: process.env.NOTION_TASKS_DATABASE_ID!,
            filter: {
                property: 'Shared',
                checkbox: {
                    equals: true
                }
            }
        });

        return response.results.map(page => ({
            id: page.id,
            title: this.extractTitle(page),
            assignedTo: this.extractAssignedTo(page),
            dueDate: this.extractDueDate(page),
            priority: this.extractPriority(page)
        }));
    }

    private async updateAIContext(context: any) {
        // Store in Supabase for AI to access
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabase
            .from('user_context')
            .upsert({
                user_id: context.userId,
                notion_sync_data: context,
                updated_at: new Date().toISOString()
            });
    }

    private async triggerProactiveActions(tasks: any[]) {
        // AI Assistant analyzes tasks and takes action

        // 1. Send morning briefing with today's priorities
        if (tasks.length > 0) {
            await this.sendMorningBriefing(tasks);
        }

        // 2. Check for overdue tasks
        const overdueTasks = tasks.filter(task =>
            new Date(task.dueTime) < new Date()
        );
        if (overdueTasks.length > 0) {
            await this.sendOverdueAlert(overdueTasks);
        }

        // 3. Suggest optimal task ordering based on ADHD patterns
        await this.suggestTaskOrdering(tasks);

        // 4. Check for shared tasks that need coordination
        const sharedTasks = tasks.filter(task => task.isShared);
        if (sharedTasks.length > 0) {
            await this.coordinateSharedTasks(sharedTasks);
        }
    }

    private async sendMorningBriefing(tasks: any[]) {
        // Send proactive notification with today's priorities
        const { notificationService } = await import('../services/notifications');

        const highPriorityTasks = tasks.filter(t => t.priority === 'High');
        const sharedTasks = tasks.filter(t => t.isShared);

        await notificationService.sendProactiveNotification({
            type: 'morning_briefing',
            title: '🌅 Good morning! Here\'s your day ahead',
            body: `You have ${tasks.length} tasks today. ${highPriorityTasks.length} high priority, ${sharedTasks.length} shared with your wife.`,
            action: 'view_today_tasks',
            userId: 'default-user',
            priority: 'medium',
            data: { tasks, highPriorityTasks, sharedTasks }
        });
    }

    private async sendOverdueAlert(overdueTasks: any[]) {
        const { notificationService } = await import('../services/notifications');

        await notificationService.sendProactiveNotification({
            type: 'overdue_alert',
            title: '⚠️ You have overdue tasks',
            body: `${overdueTasks.length} tasks are overdue. Let's tackle them together!`,
            action: 'view_overdue_tasks',
            userId: 'default-user',
            priority: 'high',
            data: { overdueTasks }
        });
    }

    private async suggestTaskOrdering(tasks: any[]) {
        // AI analyzes your ADHD patterns and suggests optimal task order
        const { notificationService } = await import('../services/notifications');

        // This would use AI to analyze your patterns and suggest ordering
        await notificationService.sendProactiveNotification({
            type: 'task_ordering_suggestion',
            title: '🧠 ADHD-Friendly Task Order',
            body: 'Based on your patterns, here\'s the optimal order for today\'s tasks.',
            action: 'view_suggested_order',
            userId: 'default-user',
            priority: 'low',
            data: { suggestedOrder: tasks }
        });
    }

    private async coordinateSharedTasks(sharedTasks: any[]) {
        const { notificationService } = await import('../services/notifications');

        await notificationService.sendProactiveNotification({
            type: 'shared_task_coordination',
            title: '👫 Shared Tasks Update',
            body: `${sharedTasks.length} tasks are shared with your wife. Need to coordinate?`,
            action: 'coordinate_tasks',
            userId: 'default-user',
            priority: 'medium',
            data: { sharedTasks }
        });
    }

    // Helper methods to extract data from Notion pages
    private extractTitle(page: any): string {
        // Extract title from Notion page properties
        return page.properties.Name?.title?.[0]?.text?.content || 'Untitled';
    }

    private extractPriority(page: any): string {
        return page.properties.Priority?.select?.name || 'Medium';
    }

    private extractDueTime(page: any): string {
        return page.properties['Due Time']?.date?.start || null;
    }

    private extractDueDate(page: any): string {
        return page.properties.Date?.date?.start || null;
    }

    private extractCategory(page: any): string {
        return page.properties.Category?.select?.name || 'General';
    }

    private isSharedTask(page: any): boolean {
        return page.properties.Shared?.checkbox || false;
    }

    private extractAssignedTo(page: any): string {
        return page.properties['Assigned To']?.select?.name || 'Both';
    }
}

export const notionSyncService = new NotionSyncService();
