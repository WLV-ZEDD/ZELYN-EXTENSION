// Service worker for ZELYN extension
// Handles session sync from web app

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.type, 'from:', sender.origin);

  if (request.type === 'ZELYN_SESSION_SYNC' && request.session) {
    // Store session from web app
    chrome.storage.local.set({ supabase_session: request.session }, () => {
      console.log('Session synced from ZELYN web app');
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'ZELYN_SESSION_CLEAR') {
    // Clear session on logout
    chrome.storage.local.remove('supabase_session', () => {
      console.log('Session cleared from ZELYN');
      sendResponse({ success: true });
    });
    return true;
  }

  sendResponse({ success: false, error: 'Unknown message type' });
});

// Listen for session changes in storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.supabase_session) {
    console.log('Session changed:', changes.supabase_session.newValue ? 'logged in' : 'logged out');
  }
});
