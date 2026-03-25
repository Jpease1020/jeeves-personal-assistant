# Environment Variables Setup

## Required Environment Variables

Add these variables to your `backend/.env` file:

```bash
# Server Configuration
PORT=4001
NODE_ENV=development
BACKEND_URL=http://localhost:4001

# Oura Ring Webhook Configuration
OURA_WEBHOOK_SECRET=your-oura-webhook-secret-here

# Existing Variables (replace with your own values)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
OURA_API_TOKEN=your_oura_api_token_here
NOTION_API_KEY=your_notion_api_key_here
GOOGLE_SHEETS_CLIENT_ID=your_google_sheets_client_id_here
GOOGLE_SHEETS_CLIENT_SECRET=your_google_sheets_client_secret_here
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:4001/auth/google/callback
WORKOUT_SHEET_ID=your_workout_sheet_id_here
```

## Oura Ring Webhook Setup

### Step 1: Get Webhook Secret
1. Go to [Oura Cloud API](https://cloud.ouraring.com/)
2. Navigate to API settings
3. Generate a webhook secret
4. Add it to your `.env` file as `OURA_WEBHOOK_SECRET`

### Step 2: Configure Webhook URL
1. In Oura Cloud API settings
2. Go to Webhooks section
3. Add webhook URL: `http://localhost:4001/webhooks/oura/sleep`
4. Select events: `sleep.updated`, `sleep.completed`
5. Save webhook configuration

### Step 3: Test Webhook
1. Start your backend server
2. Visit: `http://localhost:4001/webhooks/oura/test`
3. Check server logs for webhook processing
4. Verify notifications are sent via WebSocket

## Webhook Endpoints

- `POST /webhooks/oura/sleep` - Oura sleep data webhook
- `POST /webhooks/oura/test` - Test webhook with sample data
- `GET /webhooks/oura/setup` - Webhook setup instructions
- `GET /webhooks/health` - Health check

## Security Notes

- Keep `OURA_WEBHOOK_SECRET` secure and private
- Webhook signature verification is required for all Oura webhooks
- Test endpoint is for development only - remove in production
