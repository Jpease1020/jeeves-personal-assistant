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

# Existing Variables (already configured)
ANTHROPIC_API_KEY=sk-ant-api03-HUDmpTNcQisPa...
SUPABASE_URL=https://mczyngpzmzwhocwxjsyr.su...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInF...
OURA_API_TOKEN=KHXAV57UGQGPBZAHPF504UQ3KPJVT...
NOTION_API_KEY=ntn_43679490685500B1PF0lMacve...
GOOGLE_SHEETS_CLIENT_ID=1065437506851-5d2o7p...
GOOGLE_SHEETS_CLIENT_SECRET=GOCSPX-NFp-yAZel...
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:4001/auth/google/callback
WORKOUT_SHEET_ID=''
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

