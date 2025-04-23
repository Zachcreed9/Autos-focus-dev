// Background script for AutoFocus extension
// Handles extension initialization and setting focus on page load

// Initial installation setup
chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
  createContextMenus();
});

// Initialize extension settings
function initializeExtension() {
  chrome.storage.sync.set({
    enabled: true,
    blockedSites: ["youtube.com", "twitter.com", "reddit.com", "facebook.com", "instagram.com"],
    whitelist: ["google.com", "gmail.com", "docs.google.com", "drive.google.com"],
    scheduleSettings: {
      enabled: false,
      days: [1, 2, 3, 4, 5], // Monday to Friday
      timeRanges: [
        { name: 'Matin', start: '09:00', end: '12:00' },
        { name: 'Après-midi', start: '14:00', end: '18:00' }
      ]
    },
    categorySettings: {
      social: true,
      video: true,
      games: false,
      shopping: false
    },
    settings: {
      blockingMode: 'standard',
      notifyBlocked: true,
      notifySession: false,
      notifyStats: false,
      autoFocusEnabled: true,
      highlightFocus: true,
      autoSubmit: false
    },
    focusSettings: {
      preferInputs: true,
      focusDelay: 500,
      highlightFocused: true,
      autoSubmit: false
    },
    stats: {
      blockedCount: 0,
      totalFocusTime: 0,
      focusSessions: [],
      lastReset: new Date().toISOString()
    }
  }, () => {
    console.log('Extension initialized with default settings.');
  });
}

// Create context menu items
function createContextMenus() {
  const menuItems = [
    { id: "blockSite", title: "Bloquer ce site", contexts: ["page"] },
    { id: "whitelistSite", title: "Ajouter à la liste blanche", contexts: ["page"] },
    { id: "separator", type: "separator", contexts: ["page"] },
    { id: "startPomodoro", title: "Démarrer une session Pomodoro", contexts: ["page"] }
  ];

  for (const item of menuItems) {
    chrome.contextMenus.create(item, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error creating context menu item: ${item.title}`, chrome.runtime.lastError);
      }
    });
  }
}

// Context menu handling
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.url) {
    console.warn("No active tab or URL found.");
    return;
  }

  switch (info.menuItemId) {
    case "blockSite":
      handleAddToBlockList(tab.url);
      break;
    case "whitelistSite":
      handleAddToWhitelist(tab.url);
      break;
    case "startPomodoro":
      startPomodoroSession(tab.id);
      break;
    default:
      console.warn(`Unknown menu item clicked: ${info.menuItemId}`);
  }
});

// Keyboard commands handling
chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab || !tab.url) {
    console.warn("No active tab or URL found.");
    return;
  }

  switch (command) {
    case "toggle-focus":
      toggleExtension();
      break;
    case "start-pomodoro":
      startPomodoroSession(tab.id);
      break;
    case "block-current-site":
      handleAddToBlockList(tab.url);
      break;
    case "whitelist-current-site":
      handleAddToWhitelist(tab.url);
      break;
    default:
      console.warn(`Unknown command: ${command}`);
  }
});

// Tab update handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkIfShouldBlock(tabId, tab.url);
  }
});

// Check if a site should be blocked based on current settings
function checkIfShouldBlock(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return; // Skip Chrome internal pages
  }

  chrome.storage.sync.get([
    "enabled",
    "blockedSites",
    "whitelist",
    "scheduleSettings",
    "settings"
  ], (data) => {
    if (!data.enabled) {
      return; // Extension is disabled
    }

    const domain = getDomainFromUrl(url);
    if (!domain) return;

    if (isInList(domain, data.whitelist)) {
      if (data.settings.autoFocusEnabled) {
        applyAutoFocus(tabId);
      }
      return;
    }

    const shouldBlockNow = shouldBlockBasedOnSchedule(data.scheduleSettings, data.settings);
    const isBlocked = isInList(domain, data.blockedSites);

    if (isBlocked && (data.settings.blockingMode !== 'scheduled' || shouldBlockNow)) {
      blockSite(tabId, domain, data.settings.notifyBlocked);
    } else if (data.settings.autoFocusEnabled) {
      applyAutoFocus(tabId);
    }
  });
}

// Get domain from URL
function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error(`Invalid URL: ${url}`);
    return null;
  }
}

// Block a site
function blockSite(tabId, domain, notifyBlocked) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content.js"]
  });

  updateBlockedStats(domain);

  if (notifyBlocked) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon128.png',
      title: 'Auto-Focus',
      message: `Le site ${domain} a été bloqué pour vous aider à rester concentré.`
    });
  }
}

// Utility to check if a domain is in a list
function isInList(domain, list = []) {
  return list.some(item => domain.includes(item));
}

// Check blocking schedule
function shouldBlockBasedOnSchedule(scheduleSettings, settings) {
  if (!settings || settings.blockingMode !== 'scheduled' || !scheduleSettings || !scheduleSettings.enabled) {
    return true;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  if (!scheduleSettings.days.includes(currentDay)) {
    return false;
  }

  return scheduleSettings.timeRanges.some(range => {
    const [startHours, startMinutes] = range.start.split(':').map(Number);
    const [endHours, endMinutes] = range.end.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    return currentTime >= startTime && currentTime <= endTime;
  });
}

// Update blocked stats
function updateBlockedStats(domain) {
  chrome.storage.sync.get('stats', (data) => {
    const stats = data.stats || {
      blockedCount: 0,
      blockedSites: {}
    };

    stats.blockedCount++;
    stats.blockedSites[domain] = (stats.blockedSites[domain] || 0) + 1;

    chrome.storage.sync.set({ stats });
  });
}

// Apply auto-focus settings
function applyAutoFocus(tabId) {
  chrome.storage.sync.get("focusSettings", (data) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: autoFocusContent,
      args: [data.focusSettings]
    });
  });
}

// Content script for auto-focus
function autoFocusContent(settings) {
  // Fallback default settings
  const focusSettings = settings || {
    preferInputs: true,
    focusDelay: 500,
    highlightFocused: true,
    autoSubmit: false
  };

  setTimeout(() => {
    const element = document.querySelector('input, textarea, [contenteditable]');
    if (element) {
      element.focus();
    }
  }, focusSettings.focusDelay);
}

// Add site to block list
function handleAddToBlockList(url) {
  const domain = getDomainFromUrl(url);
  if (!domain) return;

  chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
    if (!blockedSites.includes(domain)) {
      blockedSites.push(domain);
      chrome.storage.sync.set({ blockedSites });
    }
  });
}

// Add site to whitelist
function handleAddToWhitelist(url) {
  const domain = getDomainFromUrl(url);
  if (!domain) return;

  chrome.storage.sync.get('whitelist', ({ whitelist = [] }) => {
    if (!whitelist.includes(domain)) {
      whitelist.push(domain);
      chrome.storage.sync.set({ whitelist });
    }
  });
}

// Toggle extension enabled/disabled
function toggleExtension() {
  chrome.storage.sync.get('enabled', (data) => {
    const newState = !data.enabled;
    chrome.storage.sync.set({ enabled: newState });
  });
}

// Pomodoro session handling
function startPomodoroSession(tabId) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icon128.png',
    title: 'Session Pomodoro',
    message: "Votre session de 25 minutes commence maintenant."
  });

  chrome.alarms.create('pomodoroEnd', { delayInMinutes: 25 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroEnd') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icon128.png',
        title: 'Session terminée',
        message: "Votre session est terminée. Prenez une pause !"
      });
    }
  });
}