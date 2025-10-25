import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string
);

export interface SearchEvent {
    id?: number;
    userId: string;
    query: string;
    source: string;
    url?: string;
    severity: 'explicit' | 'moderate' | 'suspicious';
    matchedKeywords: string[];
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface SearchStats {
    totalSearches: number;
    explicitSearches: number;
    moderateSearches: number;
    suspiciousSearches: number;
    mostSearchedSources: Array<{ source: string; count: number }>;
    dailyStats: Array<{ date: string; searches: number; explicit: number; moderate: number; suspicious: number }>;
    averageSearchesPerDay: number;
    topKeywords: Array<{ keyword: string; count: number; severity: string }>;
}

export class SearchEventService {
    /**
     * Create a new search event
     */
    async createEvent(eventData: SearchEvent): Promise<SearchEvent> {
        try {
            const { data, error } = await supabase
                .from('search_events')
                .insert([eventData])
                .select()
                .single();

            if (error) {
                console.error('Error creating search event:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Database error in createEvent:', error);
            throw error;
        }
    }

    /**
     * Get search events for a user
     */
    async getUserEvents(params: {
        userId: string;
        startDate?: string;
        endDate?: string;
        severity?: string;
        source?: string;
        limit: number;
        offset: number;
    }): Promise<SearchEvent[]> {
        try {
            let query = supabase
                .from('search_events')
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

            if (params.severity) {
                query = query.eq('severity', params.severity);
            }

            if (params.source) {
                query = query.eq('source', params.source);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching user search events:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('Database error in getUserEvents:', error);
            throw error;
        }
    }

    /**
     * Get search statistics for a user
     */
    async getUserStats(userId: string, days: number = 7): Promise<SearchStats> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString();

            // Get all search events for the period
            const { data: events, error } = await supabase
                .from('search_events')
                .select('*')
                .eq('userId', userId)
                .gte('timestamp', startDateStr)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching user search stats:', error);
                throw error;
            }

            if (!events || events.length === 0) {
                return {
                    totalSearches: 0,
                    explicitSearches: 0,
                    moderateSearches: 0,
                    suspiciousSearches: 0,
                    mostSearchedSources: [],
                    dailyStats: [],
                    averageSearchesPerDay: 0,
                    topKeywords: []
                };
            }

            // Calculate statistics
            const totalSearches = events.length;
            const explicitSearches = events.filter(e => e.severity === 'explicit').length;
            const moderateSearches = events.filter(e => e.severity === 'moderate').length;
            const suspiciousSearches = events.filter(e => e.severity === 'suspicious').length;

            // Most searched sources
            const sourceCounts: { [key: string]: number } = {};
            events.forEach(event => {
                sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
            });

            const mostSearchedSources = Object.entries(sourceCounts)
                .map(([source, count]) => ({ source, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Daily stats
            const dailyStats: { [key: string]: { searches: number; explicit: number; moderate: number; suspicious: number } } = {};
            events.forEach(event => {
                const date = event.timestamp.split('T')[0];
                if (!dailyStats[date]) {
                    dailyStats[date] = { searches: 0, explicit: 0, moderate: 0, suspicious: 0 };
                }
                dailyStats[date].searches++;
                if (event.severity === 'explicit') dailyStats[date].explicit++;
                else if (event.severity === 'moderate') dailyStats[date].moderate++;
                else if (event.severity === 'suspicious') dailyStats[date].suspicious++;
            });

            const dailyStatsArray = Object.entries(dailyStats)
                .map(([date, stats]) => ({ date, ...stats }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // Top keywords
            const keywordCounts: { [key: string]: { count: number; severity: string } } = {};
            events.forEach(event => {
                const words = event.query.split(/\s+/);
                words.forEach(word => {
                    if (word.length > 2) { // Ignore very short words
                        const key = word.toLowerCase();
                        if (!keywordCounts[key]) {
                            keywordCounts[key] = { count: 0, severity: event.severity };
                        }
                        keywordCounts[key].count++;
                        // Keep the most severe classification
                        if (event.severity === 'explicit') {
                            keywordCounts[key].severity = 'explicit';
                        } else if (event.severity === 'moderate' && keywordCounts[key].severity !== 'explicit') {
                            keywordCounts[key].severity = 'moderate';
                        }
                    }
                });
            });

            const topKeywords = Object.entries(keywordCounts)
                .map(([keyword, data]) => ({ keyword, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 20);

            const averageSearchesPerDay = totalSearches / days;

            return {
                totalSearches,
                explicitSearches,
                moderateSearches,
                suspiciousSearches,
                mostSearchedSources,
                dailyStats: dailyStatsArray,
                averageSearchesPerDay: Math.round(averageSearchesPerDay * 10) / 10,
                topKeywords
            };
        } catch (error) {
            console.error('Database error in getUserStats:', error);
            throw error;
        }
    }

    /**
     * Get top keywords for a user
     */
    async getTopKeywords(userId: string, days: number = 30, limit: number = 50): Promise<Array<{ keyword: string; count: number; severity: string }>> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateStr = startDate.toISOString();

            const { data: events, error } = await supabase
                .from('search_events')
                .select('query, severity')
                .eq('userId', userId)
                .gte('timestamp', startDateStr);

            if (error) {
                console.error('Error fetching top keywords:', error);
                throw error;
            }

            if (!events || events.length === 0) {
                return [];
            }

            // Count keywords
            const keywordCounts: { [key: string]: { count: number; severity: string } } = {};
            events.forEach(event => {
                const words = event.query.split(/\s+/);
                words.forEach(word => {
                    if (word.length > 2) { // Ignore very short words
                        const key = word.toLowerCase();
                        if (!keywordCounts[key]) {
                            keywordCounts[key] = { count: 0, severity: event.severity };
                        }
                        keywordCounts[key].count++;
                        // Keep the most severe classification
                        if (event.severity === 'explicit') {
                            keywordCounts[key].severity = 'explicit';
                        } else if (event.severity === 'moderate' && keywordCounts[key].severity !== 'explicit') {
                            keywordCounts[key].severity = 'moderate';
                        }
                    }
                });
            });

            return Object.entries(keywordCounts)
                .map(([keyword, data]) => ({ keyword, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
        } catch (error) {
            console.error('Database error in getTopKeywords:', error);
            throw error;
        }
    }
}

export const searchEventService = new SearchEventService();
