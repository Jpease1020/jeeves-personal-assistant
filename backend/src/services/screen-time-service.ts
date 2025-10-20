export interface ScreenTimeSummary {
    date: string;
    totalMinutes: number;
    productiveMinutes: number;
    distractingMinutes: number;
    apps?: Array<{ app: string; minutes: number }>;
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface ScreenTimeServiceClient {
    getSummary(params: { userId: string; date: string }): Promise<ScreenTimeSummary | null>;
}

export class ScreenTimeService implements ScreenTimeServiceClient {
    private supabase: SupabaseClient | null = null;

    private getClient(): SupabaseClient {
        if (!this.supabase) {
            const url = process.env.SUPABASE_URL as string;
            const key = process.env.SUPABASE_SERVICE_KEY as string;
            if (!url || !key) {
                throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
            }
            this.supabase = createClient(url, key);
        }
        return this.supabase;
    }

    async getSummary({ userId, date }: { userId: string; date: string }): Promise<ScreenTimeSummary | null> {
        try {
            const client = this.getClient();
            const { data, error } = await client
                .from('screen_time_summaries')
                .select('*')
                .eq('user_id', userId)
                .eq('date', date)
                .maybeSingle();

            if (error) {
                console.error('ScreenTimeService query error:', error);
                return null;
            }
            if (!data) return null;

            const apps: Array<{ app: string; minutes: number }> = Array.isArray((data as any).data?.apps)
                ? data.data.apps
                : [];

            return {
                date: (data as any).date,
                totalMinutes: (data as any).total_minutes ?? (data as any).total ?? (data as any).totalMinutes ?? 0,
                productiveMinutes: (data as any).productive_minutes ?? (data as any).productive ?? (data as any).productiveMinutes ?? 0,
                distractingMinutes: (data as any).distracting_minutes ?? (data as any).distracting ?? (data as any).distractingMinutes ?? 0,
                apps
            };
        } catch (e) {
            console.error('ScreenTimeService getSummary failed:', e);
            return null;
        }
    }
}


