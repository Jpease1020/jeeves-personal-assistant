export interface OuraDailySummary {
    date: string;
    score?: number;
    value?: number;
    summary?: string;
}

export interface OuraServiceClient {
    getSleep(params: { userId: string; date: string }): Promise<OuraDailySummary | null>;
    getReadiness(params: { userId: string; date: string }): Promise<OuraDailySummary | null>;
    getActivity(params: { userId: string; date: string }): Promise<OuraDailySummary | null>;
    getRecovery(params: { userId: string; date: string }): Promise<OuraDailySummary | null>;
}

export class OuraService implements OuraServiceClient {
    async getSleep(_: { userId: string; date: string }): Promise<OuraDailySummary | null> { return null; }
    async getReadiness(_: { userId: string; date: string }): Promise<OuraDailySummary | null> { return null; }
    async getActivity(_: { userId: string; date: string }): Promise<OuraDailySummary | null> { return null; }
    async getRecovery(_: { userId: string; date: string }): Promise<OuraDailySummary | null> { return null; }
}


