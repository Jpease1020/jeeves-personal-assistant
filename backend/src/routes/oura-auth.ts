import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Lazy initialization of Supabase client
function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
}

// OAuth configuration
const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID || 'c774943c-f4ec-4a92-8b2b-7013351408cf';
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;
const OURA_REDIRECT_URI = process.env.OURA_REDIRECT_URI || 'http://localhost:4001/auth/oura/callback';

// Generate OAuth authorization URL
router.get('/oura/authorize', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const scope = 'extapi:email extapi:personal extapi:daily extapi:heartrate extapi:tag extapi:workout extapi:session extapi:spo2 extapi:ring_configuration extapi:stress';

    const authUrl = `https://moi.ouraring.com/oauth/v2/ext/oauth-authorize?` +
        `response_type=code&` +
        `client_id=${OURA_CLIENT_ID}&` +
        `prompt=consent&` +
        `redirect_uri=${encodeURIComponent(OURA_REDIRECT_URI)}&` +
        `state=${state}&` +
        `scope=${scope}`;

    res.json({
        authUrl,
        state,
        scope,
        instructions: 'Visit the authUrl to authorize the app, then you\'ll be redirected back with a code'
    });
});

// Handle OAuth callback
router.get('/oura/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.status(400).json({
                error: 'OAuth authorization failed',
                details: error
            });
        }

        if (!code) {
            return res.status(400).json({
                error: 'Authorization code not provided'
            });
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://moi.ouraring.com/oauth/v2/ext/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: OURA_CLIENT_ID,
                client_secret: OURA_CLIENT_SECRET!,
                redirect_uri: OURA_REDIRECT_URI,
                code: code as string
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        // Store token in database (you'll need to pass userId somehow)
        const userId = req.query.userId as string || 'default-user';

        if (userId && userId !== 'default-user') {
            const supabase = getSupabaseClient();

            await supabase
                .from('oauth_tokens')
                .upsert({
                    user_id: userId,
                    provider: 'oura',
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
                    scope: tokenData.scope,
                    token_type: tokenData.token_type
                });
        }

        res.json({
            success: true,
            message: 'Oura authorization successful!',
            accessToken: tokenData.access_token,
            expiresIn: tokenData.expires_in,
            scope: tokenData.scope,
            instructions: 'Add this access token to your .env file as OURA_API_TOKEN'
        });

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({
            error: 'Failed to complete OAuth flow',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get stored OAuth token for a user
router.get('/oura/token/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('oauth_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', 'oura')
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: 'No Oura token found for user',
                instructions: 'Run /auth/oura/authorize first to get authorization'
            });
        }

        // Check if token is expired
        const expiresAt = new Date(data.expires_at);
        const now = new Date();

        if (expiresAt <= now) {
            return res.status(410).json({
                error: 'Oura token expired',
                instructions: 'Run /auth/oura/authorize again to refresh authorization'
            });
        }

        res.json({
            success: true,
            accessToken: data.access_token,
            expiresAt: data.expires_at,
            scope: data.scope
        });

    } catch (error) {
        console.error('Error getting Oura token:', error);
        res.status(500).json({
            error: 'Failed to retrieve Oura token',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export { router as ouraAuthRouter };
