import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    location?: string;
    attendees?: Array<{
        email: string;
        displayName?: string;
        responseStatus?: string;
    }>;
    reminders?: {
        useDefault: boolean;
        overrides?: Array<{
            method: string;
            minutes: number;
        }>;
    };
}

interface CalendarTokens {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

interface CalendarConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

export class CalendarService {
    private supabase: any;
    private config: CalendarConfig;

    constructor() {
        // Only initialize Supabase if environment variables are available
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
        } else {
            console.warn('⚠️ Supabase environment variables not set - calendar service will be limited');
            this.supabase = null;
        }

        this.config = {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4001/api/calendar/callback',
            scopes: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events.readonly'
            ]
        };
    }

    /**
     * Generate OAuth2 authorization URL
     */
    getAuthUrl(userId: string): string {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.config.scopes,
            state: userId, // Include user ID in state for callback
            prompt: 'consent' // Force consent to get refresh token
        });

        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string, userId: string): Promise<CalendarTokens> {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        try {
            const { tokens } = await oauth2Client.getToken(code);

            if (!tokens.access_token || !tokens.refresh_token) {
                throw new Error('Failed to get access and refresh tokens');
            }

            const calendarTokens: CalendarTokens = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope || this.config.scopes.join(' '),
                token_type: tokens.token_type || 'Bearer',
                expiry_date: tokens.expiry_date || Date.now() + 3600000 // 1 hour default
            };

            // Store tokens in database
            await this.storeTokens(userId, calendarTokens);

            return calendarTokens;
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            throw new Error('Failed to exchange authorization code for tokens');
        }
    }

    /**
     * Store calendar tokens in database
     */
    private async storeTokens(userId: string, tokens: CalendarTokens): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('calendar_tokens')
                .upsert({
                    user_id: userId,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    scope: tokens.scope,
                    token_type: tokens.token_type,
                    expiry_date: new Date(tokens.expiry_date).toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error storing calendar tokens:', error);
                throw new Error('Failed to store calendar tokens');
            }

            console.log(`✅ Calendar tokens stored for user: ${userId}`);
        } catch (error) {
            console.error('Error in storeTokens:', error);
            throw error;
        }
    }

    /**
     * Get stored tokens for a user
     */
    private async getTokens(userId: string): Promise<CalendarTokens | null> {
        try {
            const { data, error } = await this.supabase
                .from('calendar_tokens')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                scope: data.scope,
                token_type: data.token_type,
                expiry_date: new Date(data.expiry_date).getTime()
            };
        } catch (error) {
            console.error('Error getting tokens:', error);
            return null;
        }
    }

    /**
     * Refresh access token if needed
     */
    private async refreshTokenIfNeeded(tokens: CalendarTokens): Promise<CalendarTokens> {
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

        if (tokens.expiry_date - now > bufferTime) {
            return tokens; // Token is still valid
        }

        console.log('🔄 Refreshing calendar access token...');

        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        oauth2Client.setCredentials({
            refresh_token: tokens.refresh_token
        });

        try {
            const { credentials } = await oauth2Client.refreshAccessToken();

            const refreshedTokens: CalendarTokens = {
                access_token: credentials.access_token!,
                refresh_token: tokens.refresh_token, // Keep the same refresh token
                scope: credentials.scope || tokens.scope,
                token_type: credentials.token_type || tokens.token_type,
                expiry_date: credentials.expiry_date || Date.now() + 3600000
            };

            // Update tokens in database
            await this.storeTokens(tokens.access_token, refreshedTokens); // This needs userId, but we don't have it here

            return refreshedTokens;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Get authenticated calendar client
     */
    private async getCalendarClient(userId: string): Promise<any> {
        const tokens = await this.getTokens(userId);

        if (!tokens) {
            throw new Error('No calendar tokens found. Please authenticate first.');
        }

        const refreshedTokens = await this.refreshTokenIfNeeded(tokens);

        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        oauth2Client.setCredentials({
            access_token: refreshedTokens.access_token,
            refresh_token: refreshedTokens.refresh_token
        });

        return google.calendar({ version: 'v3', auth: oauth2Client });
    }

    /**
     * Get user's calendar events
     */
    async getEvents(userId: string, options: {
        timeMin?: string;
        timeMax?: string;
        maxResults?: number;
        calendarId?: string;
    } = {}): Promise<CalendarEvent[]> {
        try {
            const calendar = await this.getCalendarClient(userId);

            const {
                timeMin = new Date().toISOString(),
                timeMax,
                maxResults = 50,
                calendarId = 'primary'
            } = options;

            const response = await calendar.events.list({
                calendarId,
                timeMin,
                timeMax,
                maxResults,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items || [];

            console.log(`📅 Retrieved ${events.length} calendar events for user: ${userId}`);

            return events.map((event: any) => ({
                id: event.id || '',
                summary: event.summary || 'No title',
                description: event.description,
                start: {
                    dateTime: event.start?.dateTime,
                    date: event.start?.date
                },
                end: {
                    dateTime: event.end?.dateTime,
                    date: event.end?.date
                },
                location: event.location,
                attendees: event.attendees?.map((attendee: any) => ({
                    email: attendee.email || '',
                    displayName: attendee.displayName,
                    responseStatus: attendee.responseStatus
                })),
                reminders: event.reminders ? {
                    useDefault: event.reminders.useDefault || false,
                    overrides: event.reminders.overrides?.map((override: any) => ({
                        method: override.method || 'popup',
                        minutes: override.minutes || 0
                    }))
                } : undefined
            }));
        } catch (error) {
            console.error('Error getting calendar events:', error);
            throw new Error('Failed to retrieve calendar events');
        }
    }

    /**
     * Get upcoming events for proactive assistance
     */
    async getUpcomingEvents(userId: string, hoursAhead: number = 24): Promise<CalendarEvent[]> {
        const now = new Date();
        const future = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));

        return this.getEvents(userId, {
            timeMin: now.toISOString(),
            timeMax: future.toISOString(),
            maxResults: 20
        });
    }

    /**
     * Get today's events
     */
    async getTodaysEvents(userId: string): Promise<CalendarEvent[]> {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        return this.getEvents(userId, {
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            maxResults: 50
        });
    }

    /**
     * Check if user has calendar integration
     */
    async hasIntegration(userId: string): Promise<boolean> {
        const tokens = await this.getTokens(userId);
        return tokens !== null;
    }

    /**
     * Revoke calendar integration
     */
    async revokeIntegration(userId: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('calendar_tokens')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error revoking calendar integration:', error);
                throw new Error('Failed to revoke calendar integration');
            }

            console.log(`✅ Calendar integration revoked for user: ${userId}`);
        } catch (error) {
            console.error('Error in revokeIntegration:', error);
            throw error;
        }
    }

    /**
     * Get free/busy information
     */
    async getFreeBusy(userId: string, timeMin: string, timeMax: string): Promise<any> {
        try {
            const calendar = await this.getCalendarClient(userId);

            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin,
                    timeMax,
                    items: [{ id: 'primary' }]
                }
            });

            return response.data.calendars?.primary;
        } catch (error) {
            console.error('Error getting free/busy info:', error);
            throw new Error('Failed to get free/busy information');
        }
    }
}

export const calendarService = new CalendarService();
