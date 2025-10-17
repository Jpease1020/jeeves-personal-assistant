import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { google } from 'googleapis';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_GOOGLE_SHEETS_PORT || 4017;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'google-sheets-mcp' });
});

// Helper to get OAuth client
function getOAuthClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_SHEETS_CLIENT_ID,
        process.env.GOOGLE_SHEETS_CLIENT_SECRET,
        process.env.GOOGLE_SHEETS_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}

// Tool: get_recent_workouts
app.post('/tools/get_recent_workouts', async (req, res) => {
    try {
        const { accessToken, count = 10, sheetName = 'Workouts' } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const spreadsheetId = process.env.WORKOUT_SHEET_ID;
        if (!spreadsheetId) {
            return res.status(500).json({ error: 'WORKOUT_SHEET_ID not configured' });
        }

        const auth = getOAuthClient(accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        // Get data from sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`, // Get all columns
        });

        const rows = response.data.values || [];
        if (rows.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No workout data found'
            });
        }

        // Parse workouts (assuming first row is headers)
        const headers = rows[0].map((h: string) => h.toLowerCase().trim());
        const workouts = rows.slice(1, count + 1).map((row: any[]) => {
            const workout: any = {};
            headers.forEach((header: string, index: number) => {
                workout[header] = row[index] || '';
            });
            return workout;
        }).filter(w => w.date); // Filter out empty rows

        res.json({
            success: true,
            data: workouts,
            count: workouts.length
        });
    } catch (error: any) {
        console.error('Error getting recent workouts:', error);
        res.status(500).json({
            error: error.message || 'Failed to get workout data'
        });
    }
});

// Tool: get_last_workout
app.post('/tools/get_last_workout', async (req, res) => {
    try {
        const { accessToken, sheetName = 'Workouts' } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const spreadsheetId = process.env.WORKOUT_SHEET_ID;
        if (!spreadsheetId) {
            return res.status(500).json({ error: 'WORKOUT_SHEET_ID not configured' });
        }

        const auth = getOAuthClient(accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.json({
                success: true,
                data: null,
                message: 'No workouts found'
            });
        }

        // Get headers and last workout row
        const headers = rows[0].map((h: string) => h.toLowerCase().trim());
        const lastRow = rows[rows.length - 1];

        const workout: any = {};
        headers.forEach((header: string, index: number) => {
            workout[header] = lastRow[index] || '';
        });

        // Calculate days since last workout
        const lastWorkoutDate = new Date(workout.date || workout.Date);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                ...workout,
                days_since: daysSince,
                date_formatted: lastWorkoutDate.toLocaleDateString()
            }
        });
    } catch (error: any) {
        console.error('Error getting last workout:', error);
        res.status(500).json({
            error: error.message || 'Failed to get last workout'
        });
    }
});

// Tool: get_workout_frequency
app.post('/tools/get_workout_frequency', async (req, res) => {
    try {
        const { accessToken, days = 7, sheetName = 'Workouts' } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const spreadsheetId = process.env.WORKOUT_SHEET_ID;
        if (!spreadsheetId) {
            return res.status(500).json({ error: 'WORKOUT_SHEET_ID not configured' });
        }

        const auth = getOAuthClient(accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.json({
                success: true,
                data: {
                    period_days: days,
                    workout_count: 0,
                    workouts_per_week: 0,
                    on_track: false
                }
            });
        }

        // Parse dates and count workouts in period
        const headers = rows[0].map((h: string) => h.toLowerCase().trim());
        const dateIndex = headers.findIndex(h => h.includes('date'));

        if (dateIndex === -1) {
            return res.status(400).json({ error: 'Date column not found in sheet' });
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        let workoutCount = 0;
        for (let i = 1; i < rows.length; i++) {
            const dateStr = rows[i][dateIndex];
            if (dateStr) {
                const workoutDate = new Date(dateStr);
                if (workoutDate >= cutoffDate) {
                    workoutCount++;
                }
            }
        }

        const workoutsPerWeek = (workoutCount / days) * 7;
        const onTrack = workoutsPerWeek >= 6; // Goal is 6 days/week

        res.json({
            success: true,
            data: {
                period_days: days,
                workout_count: workoutCount,
                workouts_per_week: parseFloat(workoutsPerWeek.toFixed(1)),
                on_track: onTrack,
                message: onTrack
                    ? `Great job! ${workoutCount} workouts in ${days} days - you're hitting your 6 days/week goal!`
                    : `${workoutCount} workouts in ${days} days. Need ${Math.ceil(6 * (days / 7)) - workoutCount} more to hit 6 days/week goal.`
            }
        });
    } catch (error: any) {
        console.error('Error getting workout frequency:', error);
        res.status(500).json({
            error: error.message || 'Failed to get workout frequency'
        });
    }
});

// Tool: get_exercise_progress
app.post('/tools/get_exercise_progress', async (req, res) => {
    try {
        const { accessToken, exercise_name, sheetName = 'Workouts' } = req.body;

        if (!accessToken || !exercise_name) {
            return res.status(400).json({ error: 'Access token and exercise name are required' });
        }

        const spreadsheetId = process.env.WORKOUT_SHEET_ID;
        if (!spreadsheetId) {
            return res.status(500).json({ error: 'WORKOUT_SHEET_ID not configured' });
        }

        const auth = getOAuthClient(accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.json({
                success: true,
                data: null,
                message: 'No workout data found'
            });
        }

        // Find rows that mention this exercise
        const headers = rows[0];
        const matchingWorkouts = rows.slice(1).filter((row: any[]) => {
            return row.some((cell: string) =>
                cell && cell.toLowerCase().includes(exercise_name.toLowerCase())
            );
        });

        if (matchingWorkouts.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: `No data found for exercise: ${exercise_name}`
            });
        }

        res.json({
            success: true,
            data: {
                exercise_name,
                times_performed: matchingWorkouts.length,
                most_recent: matchingWorkouts[matchingWorkouts.length - 1],
                history: matchingWorkouts.slice(-5) // Last 5 occurrences
            }
        });
    } catch (error: any) {
        console.error('Error getting exercise progress:', error);
        res.status(500).json({
            error: error.message || 'Failed to get exercise progress'
        });
    }
});

// Tool: get_workout_summary
app.post('/tools/get_workout_summary', async (req, res) => {
    try {
        const { accessToken, sheetName = 'Workouts' } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const spreadsheetId = process.env.WORKOUT_SHEET_ID;
        if (!spreadsheetId) {
            return res.status(500).json({ error: 'WORKOUT_SHEET_ID not configured' });
        }

        const auth = getOAuthClient(accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.json({
                success: true,
                data: {
                    total_workouts: 0,
                    last_workout_date: null,
                    this_week_count: 0
                }
            });
        }

        const headers = rows[0].map((h: string) => h.toLowerCase().trim());
        const dateIndex = headers.findIndex(h => h.includes('date'));

        // Get last workout
        const lastRow = rows[rows.length - 1];
        const lastWorkoutDate = lastRow[dateIndex] ? new Date(lastRow[dateIndex]) : null;
        const daysSince = lastWorkoutDate
            ? Math.floor((new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;

        // Count this week's workouts
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        let thisWeekCount = 0;
        for (let i = 1; i < rows.length; i++) {
            const dateStr = rows[i][dateIndex];
            if (dateStr) {
                const workoutDate = new Date(dateStr);
                if (workoutDate >= oneWeekAgo) {
                    thisWeekCount++;
                }
            }
        }

        res.json({
            success: true,
            data: {
                total_workouts: rows.length - 1,
                last_workout_date: lastWorkoutDate?.toLocaleDateString() || null,
                days_since_last_workout: daysSince,
                this_week_count: thisWeekCount,
                weekly_goal: 6,
                on_track_this_week: thisWeekCount >= 6,
                workouts_needed_this_week: Math.max(0, 6 - thisWeekCount)
            }
        });
    } catch (error: any) {
        console.error('Error getting workout summary:', error);
        res.status(500).json({
            error: error.message || 'Failed to get workout summary'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📊 Google Sheets MCP server running on http://localhost:${PORT}`);
});

