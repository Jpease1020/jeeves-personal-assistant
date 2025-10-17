import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { google } from 'googleapis';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_CALENDAR_PORT || 4011;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'calendar-mcp' });
});

// Helper to get OAuth client
function getOAuthClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

// Tool: list_events
app.post('/tools/list_events', async (req, res) => {
    try {
        const { start_date, end_date, accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const auth = getOAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: start_date || new Date().toISOString(),
            timeMax: end_date,
            singleEvents: true,
            orderBy: 'startTime',
        });

        res.json({
            success: true,
            data: response.data.items || []
        });
    } catch (error: any) {
        console.error('Error listing events:', error);
        res.status(500).json({
            error: error.message || 'Failed to list calendar events'
        });
    }
});

// Tool: create_event
app.post('/tools/create_event', async (req, res) => {
    try {
        const { title, start, end, description, location, accessToken } = req.body;

        if (!accessToken || !title || !start) {
            return res.status(400).json({ error: 'Access token, title, and start time are required' });
        }

        const auth = getOAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: title,
            description,
            location,
            start: {
                dateTime: start,
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: end || new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'America/New_York',
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        res.json({
            success: true,
            data: response.data,
            message: 'Event created successfully'
        });
    } catch (error: any) {
        console.error('Error creating event:', error);
        res.status(500).json({
            error: error.message || 'Failed to create calendar event'
        });
    }
});

// Tool: get_daily_summary
app.post('/tools/get_daily_summary', async (req, res) => {
    try {
        const { date, accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const auth = getOAuthClient(accessToken);
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        // Format summary
        const summary = events.map(event => {
            const start = event.start?.dateTime || event.start?.date;
            const time = start ? new Date(start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All day';
            return `${time}: ${event.summary}`;
        }).join('\n');

        res.json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                eventCount: events.length,
                events,
                summary: summary || 'No events scheduled for this day'
            }
        });
    } catch (error: any) {
        console.error('Error getting daily summary:', error);
        res.status(500).json({
            error: error.message || 'Failed to get daily summary'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📅 Calendar MCP server running on http://localhost:${PORT}`);
});

