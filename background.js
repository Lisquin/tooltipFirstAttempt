chrome.commands.onCommand.addListener(function(command) {
  if (command === "toggle-highlighting") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_highlighting" });
    });
  }
});
