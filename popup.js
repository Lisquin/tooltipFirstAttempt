// Handle toggle
const toggle = document.getElementById('toggle');
chrome.storage.local.get('enabled', data => {
  toggle.checked = !!data.enabled;
});
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  document.getElementById('status').textContent = toggle.checked ? "Highlighting enabled" : "Highlighting disabled";
  // Reload the page to apply change
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({target: {tabId: tabs[0].id}, func: () => window.location.reload()});
  });
});
