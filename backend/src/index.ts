import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

// Load environment variables
dotenv.config();

// Import routes
import { chatRouter } from './routes/chat';
import { dashboardRouter } from './routes/dashboard';
import { activityRouter } from './routes/activity';
import notionAIRouter from './routes/notion-ai';
import { webhookRouter } from './routes/webhooks';
import setupRouter from './routes/setup';
import { chromeExtensionRouter } from './routes/chrome-extension';
import { blockedSiteRouter } from './routes/blocked-site';
import morningRoutineRouter from './routes/morning-routine';
import spanishQuizRouter from './routes/spanish-quiz';

// Import MCP routes
import notionMCPRouter from './routes/mcp/notion';
import ouraMCPRouter from './routes/mcp/oura';
import habitsMCPRouter from './routes/mcp/habits';
import screenTimeMCPRouter from './routes/mcp/screen-time';

// Import scheduled jobs
import { startScheduledJobs } from './jobs/scheduler';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/activity', activityRouter);
app.use('/api', notionAIRouter);
app.use('/api', setupRouter);
app.use('/api/morning-routine', morningRoutineRouter);
app.use('/api/spanish', spanishQuizRouter);

// MCP Routes (integrated)
app.use('/api/mcp/notion', notionMCPRouter);
app.use('/api/mcp/oura', ouraMCPRouter);
app.use('/api/mcp/habits', habitsMCPRouter);
app.use('/api/mcp/screen-time', screenTimeMCPRouter);

// Webhook Routes
app.use('/webhooks', webhookRouter);

// OAuth Routes (removed for now; using direct API integrations)

// Chrome Extension Routes
app.use('/api', chromeExtensionRouter);

// Blocked Site Routes
app.use('/api/blocked-site', blockedSiteRouter);

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
export const wss = new WebSocketServer({ server, path: '/api/ws' });

// Initialize notification service with WebSocket server
import { notificationService } from './services/notifications';
notificationService.setWebSocketServer(wss);

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Personal Assistant',
        timestamp: new Date().toISOString()
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${PORT}/api/ws`);

    // Start scheduled background jobs
    startScheduledJobs();
    console.log('⏰ Scheduled jobs started');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

