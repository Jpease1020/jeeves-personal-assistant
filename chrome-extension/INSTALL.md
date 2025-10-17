# 🚀 Chrome Extension Installation Guide

## Quick Setup (5 minutes)

### 1. **Open Chrome Extensions**
- Go to `chrome://extensions/`
- Turn on **"Developer mode"** (toggle in top right)

### 2. **Load the Extension**
- Click **"Load unpacked"**
- Navigate to: `/Users/justinpease/workspace/personal-assistant/chrome-extension`
- Select the folder and click **"Select"**

### 3. **Pin the Extension**
- Click the puzzle piece icon in Chrome toolbar
- Pin **"Personal Assistant - Focus & Productivity"**

### 4. **Test It**
- Click the extension icon
- You should see the popup with stats
- Try visiting a blocked site (like pornhub.com) - you'll be redirected!

## 🎯 What It Does

### **Tracks Your Time**
- ✅ Monitors time spent on each website
- ✅ Categorizes sites as productive vs distracting
- ✅ Calculates daily focus score
- ✅ Shows top sites and usage patterns

### **Blocks Adult Sites**
- ✅ Blocks major adult content sites
- ✅ Works in incognito mode
- ✅ Shows motivational blocking page
- ✅ Logs block attempts to your backend

### **Syncs with Your Assistant**
- ✅ Sends data to your Personal Assistant every 5 minutes
- ✅ Shows Chrome usage in your main dashboard
- ✅ Integrates with your AI assistant

## 🔧 Configuration

The extension is pre-configured to work with your Personal Assistant:
- **Backend URL**: `http://localhost:4001`
- **User ID**: `e7c8419d-9c8c-4c09-b8d3-e9caf81e8ae4`
- **Sync Interval**: 5 minutes

## 📊 Using the Extension

### **Popup Interface**
Click the extension icon to see:
- Daily time breakdown
- Focus score
- Top sites visited
- Current tab info
- Sync status

### **Blocking**
When you try to access blocked sites:
- Redirected to motivational page
- Shows your productivity stats
- Options to go back or search Google

### **Data Sync**
- Automatic sync every 5 minutes
- Manual sync button in popup
- Data appears in your Personal Assistant dashboard

## 🛠️ Troubleshooting

### **Extension Not Loading**
- Make sure Developer mode is enabled
- Check that you selected the correct folder
- Refresh the extensions page

### **Data Not Syncing**
- Ensure your Personal Assistant backend is running
- Check that backend is on `http://localhost:4001`
- Try manual sync from popup

### **Sites Not Blocked**
- Check if tracking is enabled in popup
- Verify the site is in the blocked list
- Try refreshing the page

## 🎉 You're Ready!

Your Chrome extension is now:
- ✅ Tracking your website usage
- ✅ Blocking adult content
- ✅ Syncing data to your Personal Assistant
- ✅ Ready to help you stay focused!

**Next**: Check your Personal Assistant dashboard to see your Chrome usage data!
