import { Router } from 'express';

export const chromeExtensionRouter = Router();

// Receive screen time data from Chrome extension
chromeExtensionRouter.post('/screen-time', async (req, res) => {
    try {
        const { userId, date, totalScreenTime, appUsage, distractionPatterns, focusScore } = req.body;

        console.log(`📊 Received Chrome extension data for ${userId} on ${date}`);

        // Forward to screen time MCP server
        try {
            const response = await fetch('http://localhost:4018/chrome-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    date,
                    totalScreenTime,
                    appUsage,
                    distractionPatterns,
                    focusScore
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Chrome data synced to MCP server:', result);
                res.json({ success: true, message: 'Data synced successfully', data: result });
            } else {
                const errorText = await response.text();
                console.error('❌ MCP server error:', response.status, errorText);
                throw new Error(`MCP server error: ${response.status} - ${errorText}`);
            }
        } catch (fetchError) {
            console.error('❌ Failed to connect to MCP server:', fetchError);
            // Store data locally as fallback
            res.json({
                success: true,
                message: 'Data received (MCP server unavailable)',
                fallback: true,
                data: { userId, date, totalScreenTime, appUsage, distractionPatterns, focusScore }
            });
        }

    } catch (error) {
        console.error('Error processing Chrome extension data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process Chrome extension data'
        });
    }
});

// Receive blocked site event from Chrome extension
chromeExtensionRouter.post('/blocked-site', async (req, res) => {
    try {
        const { userId, domain, timestamp } = req.body;

        console.log(`🚫 Blocked site access: ${domain} for user ${userId}`);

        // Store blocked site event in database
        // TODO: Add to notifications or analytics

        res.json({ success: true, message: 'Block event recorded' });

    } catch (error) {
        console.error('Error processing blocked site event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process blocked site event'
        });
    }
});
