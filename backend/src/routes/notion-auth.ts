import { Router } from 'express';
import { Client } from '@notionhq/client';

const router = Router();

// Notion OAuth configuration
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const REDIRECT_URI = process.env.NOTION_REDIRECT_URI || 'http://localhost:4001/auth/notion/callback';

// Store user tokens temporarily (in production, use a proper database)
const userTokens = new Map<string, string>();

// Step 1: Initiate OAuth flow
router.get('/notion/authorize', (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    authUrl.searchParams.set('client_id', NOTION_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('state', userId); // Use userId as state for security

    res.json({
        authUrl: authUrl.toString(),
        message: 'Visit this URL to authorize Notion access'
    });
});

// Step 2: Handle OAuth callback
router.get('/notion/callback', async (req, res) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();

        // Store the access token for this user
        userTokens.set(userId as string, tokenData.access_token);

        res.json({
            success: true,
            message: 'Notion OAuth successful! You can now use Notion MCP features.',
            userId: userId
        });

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({
            error: 'Failed to complete OAuth flow',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Step 3: Get user's Notion client
export function getNotionClient(userId: string): Client | null {
    const accessToken = userTokens.get(userId);

    if (!accessToken) {
        return null;
    }

    return new Client({
        auth: accessToken
    });
}

// Step 4: Check if user is authenticated
router.get('/notion/status/:userId', (req, res) => {
    const { userId } = req.params;
    const isAuthenticated = userTokens.has(userId);

    res.json({
        authenticated: isAuthenticated,
        userId: userId
    });
});

export { router as notionAuthRouter };
