// Handles toggle and major selection, saves to chrome.storage

const toggle = document.getElementById('toggle');
const major = document.getElementById('major');

// Load saved settings
chrome.storage.sync.get(['enabled', 'selectedMajor'], (data) => {
  toggle.checked = data.enabled ?? true;
  major.value = data.selectedMajor ?? "compsci";
});

// Save toggle state
toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
});

// Save major selection
major.addEventListener('change', () => {
  chrome.storage.sync.set({ selectedMajor: major.value });
});
