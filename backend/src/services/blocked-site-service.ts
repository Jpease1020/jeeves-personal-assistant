import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
);

export interface BlockedSiteEvent {
    id?: number;
    userId: string;
    domain: string;
    action: 'blocked' | 'unlock_requested' | 'unlocked';
    reason?: string;
    timestamp: string;
    fullUrl?: string;
    source?: string;
    userAgent?: string;
    extensionVersion?: string;
    ipAddress?: string;
}

export interface UserStats {
    totalBlocks: number;
    totalUnlockAttempts: number;
    totalUnlocks: number;
    mostBlockedDomains: Array<{ domain: string; count: number }>;
    dailyStats: Array<{ date: string; blocks: number; unlocks: number }>;
    averageBlocksPerDay: number;
    streakDays: number;
}

export interface AccountabilityReport {
    userId: string;
    period: string;
    summary: UserStats;
    recentEvents: BlockedSiteEvent[];
    recommendations: string[];
    motivationalMessage: string;
}

export class BlockedSiteService {
    /**
     * Create a new blocked site event
     */
    async createEvent(eventData: BlockedSiteEvent): Promise<BlockedSiteEvent> {
        try {
            const { data, error } = await supabase
                .from('blocked_site_events')
                .insert([eventData])
                .select()
                .single();

            if (error) {
                console.error('Error creating blocked site event:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Database error in createEvent:', error);
            throw error;
        }
    }

    /**
     * Get blocked site events for a user
     */
    async getUserEvents(params: {
        userId: string;
        startDate?: string;
        endDate?: string;
        action?: string;
        limit: number;
        offset: number;
    }): Promise<BlockedSiteEvent[]> {
        try {
            let query = supabase
                .from('blocked_site_events')
                .select('*')
                .eq('userId', params.userId)
                .order('timestamp', { ascending: false })
                .range(params.offset, params.offset + params.limit - 1);

            if (params.startDate) {
                query = query.gte('timestamp', params.startDate);
            }

            if (params.endDate) {
                query = query.lte('timestamp', params.endDate);
            }

            if (params.action) {
                query = query.eq('action', params.action);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching user events:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Database error in getUserEvents:', error);
            throw error;
        }
    }

    /**
     * Get blocking statistics for a user
     */
    async getUserStats(userId: string, days: number = 7): Promise<UserStats> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString();

            // Get all events for the period
            const { data: events, error } = await supabase
                .from('blocked_site_events')
                .select('*')
                .eq('userId', userId)
                .gte('timestamp', startDateStr)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching user stats:', error);
                throw error;
            }

            if (!events || events.length === 0) {
                return {
                    totalBlocks: 0,
                    totalUnlockAttempts: 0,
                    totalUnlocks: 0,
                    mostBlockedDomains: [],
                    dailyStats: [],
                    averageBlocksPerDay: 0,
                    streakDays: 0
                };
            }

            // Calculate statistics
            const totalBlocks = events.filter(e => e.action === 'blocked').length;
            const totalUnlockAttempts = events.filter(e => e.action === 'unlock_requested').length;
            const totalUnlocks = events.filter(e => e.action === 'unlocked').length;

            // Most blocked domains
            const domainCounts: { [key: string]: number } = {};
            events.filter(e => e.action === 'blocked').forEach(event => {
                domainCounts[event.domain] = (domainCounts[event.domain] || 0) + 1;
            });

            const mostBlockedDomains = Object.entries(domainCounts)
                .map(([domain, count]) => ({ domain, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Daily stats
            const dailyStats: { [key: string]: { blocks: number; unlocks: number } } = {};
            events.forEach(event => {
                const date = event.timestamp.split('T')[0];
                if (!dailyStats[date]) {
                    dailyStats[date] = { blocks: 0, unlocks: 0 };
                }
                if (event.action === 'blocked') {
                    dailyStats[date].blocks++;
                } else if (event.action === 'unlocked') {
                    dailyStats[date].unlocks++;
                }
            });

            const dailyStatsArray = Object.entries(dailyStats)
                .map(([date, stats]) => ({ date, ...stats }))
                .sort((a, b) => a.date.localeCompare(b.date));

            const averageBlocksPerDay = totalBlocks / days;
            const streakDays = this.calculateStreakDays(dailyStatsArray);

            return {
                totalBlocks,
                totalUnlockAttempts,
                totalUnlocks,
                mostBlockedDomains,
                dailyStats: dailyStatsArray,
                averageBlocksPerDay: Math.round(averageBlocksPerDay * 10) / 10,
                streakDays
            };
        } catch (error) {
            console.error('Database error in getUserStats:', error);
            throw error;
        }
    }

    /**
     * Generate accountability report
     */
    async generateAccountabilityReport(userId: string, days: number = 7): Promise<AccountabilityReport> {
        try {
            const stats = await this.getUserStats(userId, days);
            const recentEvents = await this.getUserEvents({
                userId,
                limit: 20,
                offset: 0
            });

            const recommendations = this.generateRecommendations(stats);
            const motivationalMessage = this.generateMotivationalMessage(stats);

            return {
                userId,
                period: `${days} days`,
                summary: stats,
                recentEvents,
                recommendations,
                motivationalMessage
            };
        } catch (error) {
            console.error('Error generating accountability report:', error);
            throw error;
        }
    }

    /**
     * Generate CSV report
     */
    generateCSVReport(report: AccountabilityReport): string {
        const headers = ['Date', 'Domain', 'Action', 'Reason', 'Source'];
        const rows = report.recentEvents.map(event => [
            event.timestamp.split('T')[0],
            event.domain,
            event.action,
            event.reason || '',
            event.source || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Calculate streak days (consecutive days with blocks)
     */
    private calculateStreakDays(dailyStats: Array<{ date: string; blocks: number; unlocks: number }>): number {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];

        // Check backwards from today
        for (let i = 0; i < dailyStats.length; i++) {
            const stat = dailyStats[dailyStats.length - 1 - i];
            if (stat.blocks > 0) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Generate recommendations based on stats
     */
    private generateRecommendations(stats: UserStats): string[] {
        const recommendations: string[] = [];

        if (stats.averageBlocksPerDay > 10) {
            recommendations.push('Consider using website blockers during specific hours when you\'re most vulnerable.');
        }

        if (stats.totalUnlockAttempts > stats.totalBlocks * 0.3) {
            recommendations.push('You\'re attempting to unlock sites frequently. Consider setting up additional barriers or accountability partners.');
        }

        if (stats.streakDays > 7) {
            recommendations.push('Great job maintaining your streak! Keep up the excellent work.');
        } else if (stats.streakDays > 3) {
            recommendations.push('You\'re building a good habit. Try to extend your streak even further.');
        } else {
            recommendations.push('Focus on building consistency. Even small daily improvements add up over time.');
        }

        if (stats.mostBlockedDomains.length > 0) {
            const topDomain = stats.mostBlockedDomains[0];
            recommendations.push(`Consider adding additional blocking rules for ${topDomain.domain} if it\'s still causing issues.`);
        }

        return recommendations;
    }

    /**
     * Generate motivational message based on stats
     */
    private generateMotivationalMessage(stats: UserStats): string {
        const messages = [
            'Every blocked site is a step toward your better self.',
            'You\'re building discipline one decision at a time.',
            'Your future self will thank you for these choices.',
            'Progress, not perfection, is the goal.',
            'You\'re stronger than your impulses.',
            'Each day you resist is a victory.',
            'You\'re investing in your long-term happiness.',
            'Discipline is choosing between what you want now and what you want most.'
        ];

        if (stats.streakDays > 7) {
            return `Amazing! You've maintained your focus for ${stats.streakDays} days straight. ${messages[Math.floor(Math.random() * messages.length)]}`;
        } else if (stats.streakDays > 3) {
            return `Great progress! You're on a ${stats.streakDays}-day streak. ${messages[Math.floor(Math.random() * messages.length)]}`;
        } else {
            return messages[Math.floor(Math.random() * messages.length)];
        }
    }
}

export const blockedSiteService = new BlockedSiteService();
