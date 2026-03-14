# ZELYN Chrome Extension

Save any webpage to ZELYN instantly. Your Second Brain For The Internet.

## Installation for Testing

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `zelyn-extension` folder
5. The extension is now installed!

## Usage

1. **Login to ZELYN web app first** at https://zelyn.app
2. Navigate to any webpage you want to save
3. Click the ZELYN extension icon in your toolbar
4. Select a folder (optional), add notes (optional)
5. Click "Save to ZELYN"
6. Done! The bookmark is saved instantly

## Features

- ✅ Instant bookmark saving from any webpage
- ✅ Auto-detects page title, URL, and favicon
- ✅ Duplicate detection — warns if URL already saved
- ✅ Folder organization
- ✅ Add notes while saving
- ✅ Session sync with web app (no separate login needed)
- ✅ Pure black design (#000000) with coral red accent (#ff4d4d)

## Web App Integration

The extension automatically syncs authentication with the ZELYN web app. When you log in or out of the web app, the extension session updates automatically.

**No separate login required in the extension!**

## Publishing to Chrome Web Store

1. Create a ZIP file of the `zelyn-extension` folder (excluding this README if desired)
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer fee (if not already paid)
4. Click "New Item"
5. Upload the ZIP file
6. Fill in store listing details:
   - **Name**: ZELYN — Save Bookmarks
   - **Description**: Save any webpage to ZELYN instantly. Your browser forgets. ZELYN never does.
   - **Category**: Productivity
   - **Screenshots**: Take screenshots of the extension in use
7. Submit for review

## Technical Details

- **Manifest Version**: 3
- **Permissions**: activeTab, storage, tabs
- **Authentication**: Shared session with web app via chrome.storage.local
- **API**: Direct Supabase REST API calls
- **Design**: DM Sans font, #000000 background, #ff4d4d accent

## Support

For issues or questions, contact ZELYN support at https://zelyn.app
