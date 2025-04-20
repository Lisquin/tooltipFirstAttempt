const toggle = document.getElementById('toggle');
chrome.storage.local.get('enabled', data => {
  toggle.checked = !!data.enabled;
});
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });

  // Send a message to the content script to toggle highlighting
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length === 0) return; // No active tab
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: toggle.checked ? "enable_highlighting" : "disable_highlighting" },
      function(response) {
        if (chrome.runtime.lastError) {
          // Content script not found: show a message or ignore
          document.getElementById('status').textContent =
            "Highlighting is not available on this page.";
        } else {
          // Success or handle response if needed
          document.getElementById('status').textContent = toggle.checked
            ? "Highlighting enabled"
            : "Highlighting disabled";
        }
      }
    );
  });
});
