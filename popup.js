document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const lines = event.target.result.split('\n');
    const wordMap = {};
    lines.forEach(line => {
      // Each line should be: word|description
      const [word, desc] = line.split('|');
      if (word && desc) wordMap[word.trim()] = desc.trim();
    });
    chrome.storage.local.set({ wordMap }, function() {
      document.getElementById('status').textContent = "Words loaded!";
    });
  };
  reader.readAsText(file);
});
