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
import { webhookRouter } from './routes/webhooks';
import setupRouter from './routes/setup';
import { ouraAuthRouter } from './routes/oura-auth';
import { chromeExtensionRouter } from './routes/chrome-extension';
import { notionAuthRouter } from './routes/notion-auth';

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
app.use('/api', setupRouter);

// Webhook Routes
app.use('/webhooks', webhookRouter);

// OAuth Routes
app.use('/auth', ouraAuthRouter);
app.use('/auth', notionAuthRouter);

// Chrome Extension Routes
app.use('/api', chromeExtensionRouter);

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

