// Handle toggle
const toggle = document.getElementById('toggle');
chrome.storage.local.get('enabled', data => {
  toggle.checked = !!data.enabled;
});
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  // Send a message to the content script to toggle highlighting
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: toggle.checked ? "enable_highlighting" : "disable_highlighting"
    });
  });
  document.getElementById('status').textContent = toggle.checked ? "Highlighting enabled" : "Highlighting disabled";
});

