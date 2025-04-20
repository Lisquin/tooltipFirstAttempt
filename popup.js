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

// Handle CSV upload
document.getElementById('csvInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const lines = event.target.result.split('\n');
    // Expect first line as header
    const header = lines[0].trim().split(',');
    const idx_vccs = header.indexOf('vccs_course');
    const idx_vt = header.indexOf('vt_course');
    const idx_uva = header.indexOf('uva_course');
    const idx_gmu = header.indexOf('gmu_course');
    if (idx_vccs === -1 || idx_vt === -1 || idx_uva === -1 || idx_gmu === -1) {
      document.getElementById('status').textContent = "CSV missing required columns.";
      return;
    }
    const courseMap = {};
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 5) continue;
      const vccs = cols[idx_vccs].trim();
      if (!vccs) continue;
      courseMap[vccs] = {
        vt: cols[idx_vt].trim(),
        uva: cols[idx_uva].trim(),
        gmu: cols[idx_gmu].trim()
      };
    }
    chrome.storage.local.set({ courseMap });
    document.getElementById('status').textContent = "CSV loaded!";
    // Reload the page to apply new data
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({target: {tabId: tabs[0].id}, func: () => window.location.reload()});
    });
  };
  reader.readAsText(file);
});
