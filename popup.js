const SUPABASE_URL = ZELYN_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = ZELYN_CONFIG.SUPABASE_ANON_KEY;

let currentTab = null;
let session = null;
let folders = [];
let isDuplicate = false;
let generatedSummary = null;

// State management
const states = {
  loading: document.getElementById('loading-state'),
  login: document.getElementById('login-state'),
  main: document.getElementById('main-state'),
  success: document.getElementById('success-state'),
  error: document.getElementById('error-state')
};

function showState(stateName) {
  Object.values(states).forEach(state => state.style.display = 'none');
  states[stateName].style.display = 'flex';
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  showState('error');
}

// Initialize
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    const result = await chrome.storage.local.get(['supabase_session']);
    session = result.supabase_session;

    if (!session || !session.access_token) {
      showState('login');
      return;
    }

    await Promise.all([loadFolders(), checkDuplicate()]);
    displayPageInfo();
    showState('main');
  } catch (error) {
    console.error('Init error:', error);
    showError('Could not connect to ZELYN. Check your connection.');
  }
}

function displayPageInfo() {
  const favicon = currentTab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23666"/></svg>';
  document.getElementById('favicon').src = favicon;
  document.getElementById('page-title').textContent = currentTab.title;
  document.getElementById('page-url').textContent = new URL(currentTab.url).hostname;
}

async function loadFolders() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/folders?select=*&order=name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to load folders');

    folders = await response.json();
    const select = document.getElementById('folder-select');
    // Clear existing options except first
    while (select.options.length > 1) select.remove(1);

    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = folder.name;
      select.appendChild(option);
    });

    // Add "+ New Folder" option
    const newFolderOpt = document.createElement('option');
    newFolderOpt.value = '__new__';
    newFolderOpt.textContent = '+ New Folder';
    newFolderOpt.style.color = '#ff4d4d';
    select.appendChild(newFolderOpt);
  } catch (error) {
    console.error('Load folders error:', error);
  }
}

async function checkDuplicate() {
  try {
    const encodedUrl = encodeURIComponent(currentTab.url);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookmarks?select=id&url=eq.${encodedUrl}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to check duplicate');

    const bookmarks = await response.json();
    isDuplicate = bookmarks.length > 0;

    if (isDuplicate) {
      document.getElementById('duplicate-warning').style.display = 'flex';
      document.getElementById('save-btn').disabled = true;
    }
  } catch (error) {
    console.error('Check duplicate error:', error);
  }
}

// --- Quick Folder Create ---
document.getElementById('folder-select')?.addEventListener('change', (e) => {
  if (e.target.value === '__new__') {
    e.target.value = ''; // reset select
    document.getElementById('new-folder-row').style.display = 'block';
    document.getElementById('new-folder-input').focus();
  }
});

document.getElementById('new-folder-cancel-btn')?.addEventListener('click', () => {
  document.getElementById('new-folder-row').style.display = 'none';
  document.getElementById('new-folder-input').value = '';
});

document.getElementById('new-folder-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createNewFolder();
});

document.getElementById('new-folder-save-btn')?.addEventListener('click', createNewFolder);

async function createNewFolder() {
  const input = document.getElementById('new-folder-input');
  const name = input.value.trim();
  if (!name) return;

  const saveBtn = document.getElementById('new-folder-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = '...';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/folders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ user_id: session.user.id, name, icon: 'folder' })
    });
    if (!response.ok) throw new Error('Failed to create folder');

    const [newFolder] = await response.json();
    folders.push(newFolder);

    // Rebuild dropdown
    await loadFolders();
    document.getElementById('folder-select').value = newFolder.id;

    document.getElementById('new-folder-row').style.display = 'none';
    input.value = '';
  } catch (error) {
    console.error('Create folder error:', error);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Create';
  }
}

// --- AI Summarize ---
document.getElementById('summarize-btn')?.addEventListener('click', () => {
  document.getElementById('summarize-confirm').style.display = 'block';
  document.getElementById('summarize-btn').style.display = 'none';
});

document.getElementById('summarize-no-btn')?.addEventListener('click', () => {
  document.getElementById('summarize-confirm').style.display = 'none';
  document.getElementById('summarize-btn').style.display = 'flex';
});

document.getElementById('summarize-yes-btn')?.addEventListener('click', runSummarize);

async function runSummarize() {
  document.getElementById('summarize-confirm').style.display = 'none';
  document.getElementById('summarize-progress').style.display = 'block';

  const progressFill = document.getElementById('summarize-progress-fill');
  const progressText = document.getElementById('summarize-progress-text');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/summarize-bookmark`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookmark_id: 'extension-temp',
        url: currentTab.url,
        title: currentTab.title
      })
    });

    if (!response.ok) throw new Error('Summarize failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.type === 'progress') {
            const pct = Math.round((msg.step / msg.total) * 100);
            progressFill.style.width = pct + '%';
            progressText.textContent = msg.label;
          } else if (msg.type === 'done') {
            generatedSummary = msg.data.summary;
            document.getElementById('summarize-progress').style.display = 'none';
            document.getElementById('summarize-result').style.display = 'block';
            document.getElementById('summary-text').textContent = generatedSummary;
          } else if (msg.type === 'error') {
            throw new Error(msg.error);
          }
        } catch (e) {
          if (e.message && !e.message.includes('JSON')) throw e;
        }
      }
    }
  } catch (error) {
    console.error('Summarize error:', error);
    document.getElementById('summarize-progress').style.display = 'none';
    document.getElementById('summarize-btn').style.display = 'flex';
    document.getElementById('summarize-btn').textContent = (error.message || 'Failed');
    setTimeout(() => {
      const btn = document.getElementById('summarize-btn');
      btn.innerHTML = '<span class="summarize-icon"></span> AI Summarize <span class="credit-badge">5 credits</span>';
    }, 3000);
  }
}

// --- Save Bookmark ---
async function saveBookmark() {
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const url = new URL(currentTab.url);
    const folderId = document.getElementById('folder-select').value || null;
    const notes = document.getElementById('notes-input').value || '';

    const bookmark = {
      user_id: session.user.id,
      title: currentTab.title,
      url: currentTab.url,
      domain: url.hostname,
      favicon: currentTab.favIconUrl || '',
      folder_id: folderId === '__new__' ? null : folderId,
      notes: notes,
      tags: [],
      link_status: 'unchecked'
    };

    // If user summarized, attach it
    if (generatedSummary) {
      bookmark.ai_summary = generatedSummary;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookmarks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(bookmark)
    });

    if (!response.ok) throw new Error('Failed to save bookmark');

    showState('success');
    setTimeout(() => window.close(), 1500);
  } catch (error) {
    console.error('Save error:', error);
    showError('Save failed. Please try again.');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save to ZELYN';
  }
}

// Event listeners
document.getElementById('open-zelyn-btn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://zelyn.app' });
  window.close();
});

document.getElementById('check-session-btn')?.addEventListener('click', async () => {
  showState('loading');
  const result = await chrome.storage.local.get(['supabase_session']);
  session = result.supabase_session;

  if (session && session.access_token) {
    await Promise.all([loadFolders(), checkDuplicate()]);
    displayPageInfo();
    showState('main');
  } else {
    showState('login');
  }
});

document.getElementById('save-anyway-btn')?.addEventListener('click', () => {
  document.getElementById('duplicate-warning').style.display = 'none';
  document.getElementById('save-btn').disabled = false;
  isDuplicate = false;
  saveBookmark(); // Actually save immediately instead of waiting for a second click
});

document.getElementById('save-btn')?.addEventListener('click', saveBookmark);

document.getElementById('retry-btn')?.addEventListener('click', () => {
  showState('loading');
  init();
});

// Start
init();
