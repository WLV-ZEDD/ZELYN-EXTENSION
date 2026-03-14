# ZELYN Chrome Extension

**Save any webpage to ZELYN instantly. Your Place For Bookmarks.**

ZELYN is an open-source browser extension designed for privacy-conscious users who want to build a persistent digital library. I have made this extension open source to ensure full transparency allowing anyone to verify that ZELYN strictly handles page metadata and never collects sensitive browsing data or personal information.

## Privacy and Transparency Statement

Trust is the foundation of a "Second Brain." This extension is designed with a **privacy-first** architecture:

*   **Metadata Only**: The extension only reads the title, URL, and favicon of the active tab when you explicitly click the icon.
*   **No Background Tracking**: It does not monitor your browsing history or activity in the background.
*   **Verified Code**: Being open source means you can audit exactly how your data is handled before it reaches your Supabase instance.

## Installation

### For Regular Users
**Chrome Web Store**: Support is currently in progress. This section will be updated with a direct link once the extension is officially listed.

### For Developers and Early Adopters
1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `zelyn-extension` folder.

## Features

*   **Instant Bookmark Saving**: Capture any webpage with a single click.
*   **Automated Metadata Extraction**: Automatically detects page title, URL, and favicon for a clean library.
*   **Duplicate Detection**: Intelligent warnings if a URL has already been saved to your account.
*   **Folder Organization**: Choose from existing folders or create new ones directly within the popup.
*   **Session Synchronization**: Seamless authentication sync with the ZELYN web app—no separate login required.
*   **Professional Interface**: A high-performance, minimalist dark theme designed for focus and speed.

## Usage

1. **Log In**: Ensure you are logged into the ZELYN web app at [zelyn.vercel.app](https://zelyn.vercel.app).
2. **Navigate**: Go to the webpage you want to preserve.
3. **Click**: Open the ZELYN extension from your browser toolbar.
4. **Annotate**: Add optional notes or select a target folder.
5. **Save**: Click **Save to ZELYN** to confirm.

## Technical Details

*   **Manifest Version**: 3
*   **Permissions**:
    *   **activeTab**: Specifically used to access the current page information only when the extension is activated.
    *   **storage**: Used to securely persist session synchronization data.
    *   **tabs**: Used for authentication session synchronization with the ZELYN web app — does not grant access to read the content of other tabs.
*   **Backend**: Direct integration with Supabase REST API for secure and fast data transmission.
*   **Styling**: Custom CSS utilizing DM Sans typography for a professional, native feel.

## Support

For technical support, bug reports, or contributions, please visit our main platform at [zelyn.vercel.app](https://zelyn.vercel.app).

---

**Last Updated**: March 15, 2026
