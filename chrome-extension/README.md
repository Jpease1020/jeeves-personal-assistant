# Personal Assistant Chrome Extension

A comprehensive Chrome extension that tracks your website usage, blocks distracting sites, and syncs data with your Personal Assistant backend.

## Features

### 🎯 Focus Tracking
- **Real-time website time tracking** - See exactly how much time you spend on each site
- **Productivity vs Distraction categorization** - Automatically categorize sites as productive or distracting
- **Focus score calculation** - Get a daily focus score based on your browsing patterns
- **Detailed analytics** - View top sites, time breakdowns, and usage patterns

### 🚫 Site Blocking
- **Adult content blocking** - Blocks access to adult websites (including incognito mode)
- **Customizable blocking** - Add your own sites to block
- **Motivational blocking page** - Beautiful blocking page with stats and motivation
- **Works in incognito** - Blocking works even in private browsing mode

### 📊 Data Sync
- **Real-time sync** - Data syncs to your Personal Assistant backend every 5 minutes
- **Cross-device analytics** - View your Chrome usage in your main dashboard
- **Historical data** - Track your progress over time
- **AI integration** - Your AI assistant can analyze your browsing patterns

## Installation

### Development Installation

1. **Open Chrome Extensions page**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder from this project

3. **Configure the extension**
   - The extension will automatically connect to your Personal Assistant backend
   - Make sure your backend is running on `http://localhost:4001`

### Production Installation

1. **Build the extension**
   ```bash
   cd chrome-extension
   # Create production build (if needed)
   ```

2. **Package for Chrome Web Store**
   - Zip the extension folder
   - Submit to Chrome Web Store

## Configuration

### Backend Connection
The extension connects to your Personal Assistant backend at `http://localhost:4001`. Make sure:
- Your backend is running
- CORS is configured to allow Chrome extension requests
- Your user ID is correctly set in the extension

### Blocked Sites
Default blocked sites include major adult content sites. You can modify the list in:
- `background.js` - `ADULT_SITES` array
- `rules.json` - Declarative net request rules

### Tracked Sites
Default distracting sites include social media and entertainment sites. Modify in:
- `background.js` - `DISTRACTING_SITES` array

## Usage

### Popup Interface
Click the extension icon to:
- View your daily stats
- See focus score
- Toggle tracking on/off
- Sync data manually
- View current tab info

### Blocking Behavior
When you try to access a blocked site:
- You'll be redirected to a motivational blocking page
- The page shows your productivity stats
- You can go back or search Google instead
- The block event is logged to your backend

### Data Tracking
The extension automatically tracks:
- Time spent on each website
- Page visibility changes
- Tab switching patterns
- Form interactions (productivity indicators)
- Keyboard shortcuts (productivity indicators)
- Scroll behavior (distraction indicators)

## API Integration

### Screen Time Data
The extension sends data to your backend at:
- `POST /api/screen-time` - Daily screen time summary
- `POST /api/blocked-site` - Blocked site events

### Data Format
```json
{
  "userId": "your-user-id",
  "date": "2025-01-16",
  "totalScreenTime": 420,
  "appUsage": [
    {
      "appName": "github.com",
      "category": "Productive",
      "timeSpent": 180,
      "pickups": 5
    }
  ],
  "distractionPatterns": [
    {
      "timeRange": "14:00-15:00",
      "appName": "instagram.com",
      "duration": 30,
      "distractionLevel": "high"
    }
  ],
  "focusScore": 75
}
```

## Privacy & Security

### Data Collection
- Only website domains and time spent are tracked
- No page content or personal data is collected
- All data stays on your Personal Assistant backend

### Permissions
- `activeTab` - Track current tab
- `storage` - Store daily stats locally
- `tabs` - Monitor tab changes
- `webNavigation` - Track navigation events
- `declarativeNetRequest` - Block sites
- `alarms` - Schedule sync operations

### Local Storage
Daily stats are stored locally in Chrome's storage and synced to your backend. No data is sent to third parties.

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (main logic)
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script for page tracking
├── blocked.html          # Blocked site page
├── rules.json            # Site blocking rules
└── icons/                # Extension icons
    └── icon.svg
```

### Key Components

#### Background Script (`background.js`)
- Main extension logic
- Time tracking
- Site blocking
- Data sync
- Tab monitoring

#### Popup (`popup.html` + `popup.js`)
- User interface
- Stats display
- Settings controls
- Manual sync

#### Content Script (`content.js`)
- Page-level tracking
- User interaction monitoring
- Productivity indicators

#### Blocked Page (`blocked.html`)
- Motivational blocking page
- Stats display
- Navigation options

## Troubleshooting

### Extension Not Working
1. Check if backend is running on `http://localhost:4001`
2. Verify CORS settings in backend
3. Check Chrome extension console for errors
4. Ensure all permissions are granted

### Data Not Syncing
1. Check network connection
2. Verify backend API endpoints
3. Check Chrome extension console
4. Try manual sync from popup

### Sites Not Blocked
1. Check if blocking is enabled in popup
2. Verify site is in blocked list
3. Check Chrome extension console
4. Try refreshing the page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This extension is part of the Personal Assistant project and follows the same license terms.
