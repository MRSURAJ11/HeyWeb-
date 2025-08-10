// Background service worker for HeyWeb! Voice Assistant
chrome.runtime.onInstalled.addListener(() => {
  console.log('HeyWeb! Voice Assistant extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_SCRIPT') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: request.function,
      args: request.args || []
    }).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep the message channel open for async response
  }
});

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Content script might already be injected
    });
  }
});
