// Popup script for HeyWeb! Voice Assistant Chrome extension

document.addEventListener('DOMContentLoaded', function() {
  // Open the main HeyWeb! app when button is clicked
  document.getElementById('openApp').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'http://localhost:5173'
    });
  });

  // Get current tab info and update status
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab) {
      // Update status based on whether content script is active
      chrome.tabs.sendMessage(currentTab.id, { action: 'GET_PAGE_INFO' }, function(response) {
        if (chrome.runtime.lastError) {
          // Content script not loaded, show inactive status
          updateStatus(false);
        } else {
          // Content script is active
          updateStatus(true, currentTab.url);
        }
      });
    }
  });
});

function updateStatus(isActive, url) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status div:first-child span:last-child');
  const statusSubtext = document.querySelector('.status div:last-child');

  if (isActive) {
    statusIndicator.style.background = '#10b981';
    statusText.textContent = 'Web Automation Active';
    statusSubtext.textContent = 'Voice commands enabled for this page';
  } else {
    statusIndicator.style.background = '#ef4444';
    statusText.textContent = 'Web Automation Inactive';
    statusSubtext.textContent = 'Extension not active on this page';
  }
}
