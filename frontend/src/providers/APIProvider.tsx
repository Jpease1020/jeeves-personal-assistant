import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://personal-assistant-backend-production.up.railway.app';

interface APIContextType {
    sendMessage: (message: string) => Promise<string>;
    getDashboard: () => Promise<any>;
    getBriefing: () => Promise<string>;
    checkIn: () => Promise<string>;
    startActivity: (activity: string, estimatedMins?: number) => Promise<any>;
    endActivity: () => Promise<any>;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export function APIProvider({ children }: { children: ReactNode }) {
    const sendMessage = async (message: string): Promise<string> => {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, userId: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4' }),
        });
        const data = await response.json();
        return data.response;
    };

    const getDashboard = async () => {
        const response = await fetch(`${API_URL}/api/dashboard?userId=e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4`);
        const data = await response.json();
        return data.data;
    };

    const getBriefing = async (): Promise<string> => {
        const response = await fetch(`${API_URL}/api/chat/briefing?userId=e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4`);
        const data = await response.json();
        return data.briefing;
    };

    const checkIn = async (): Promise<string> => {
        const response = await fetch(`${API_URL}/api/chat/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4' }),
        });
        const data = await response.json();
        return data.checkIn;
    };

    const startActivity = async (activity: string, estimatedMins = 60) => {
        const response = await fetch(`${API_URL}/api/activity/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4',
                activityName: activity,
                estimatedDuration: estimatedMins,
            }),
        });
        return response.json();
    };

    const endActivity = async () => {
        const response = await fetch(`${API_URL}/api/activity/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4' }),
        });
        return response.json();
    };

    const value = {
        sendMessage,
        getDashboard,
        getBriefing,
        checkIn,
        startActivity,
        endActivity,
    };

    return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
}

export function useAPI() {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error('useAPI must be used within APIProvider');
    }
    return context;
}

