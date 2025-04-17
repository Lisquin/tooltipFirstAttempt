// Utility: Escape special regex characters in words
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight words in all text nodes
function highlightWords(wordMap) {
  if (!wordMap || Object.keys(wordMap).length === 0) return;

  // Build a regex to match any of the words, case-insensitive, word boundaries
  const words = Object.keys(wordMap).map(escapeRegExp);
  if (words.length === 0) return;
  const regex = new RegExp('\\b(' + words.join('|') + ')\\b', 'gi');

  // Walk the DOM and process text nodes
  walk(document.body);

  function walk(node) {
    let child, next;
    switch (node.nodeType) {
      case 1: // Element
        // Skip script, style, textarea, and input elements
        if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) return;
        for (child = node.firstChild; child; child = next) {
          next = child.nextSibling;
          walk(child);
        }
        break;
      case 3: // Text node
        handleText(node);
        break;
    }
  }

  function handleText(textNode) {
    const parent = textNode.parentNode;
    const text = textNode.nodeValue;
    let match, lastIndex = 0, frag = document.createDocumentFragment();

    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      // Matched word
      const span = document.createElement('span');
      span.className = 'highlighted-word';
      span.textContent = match[0];
      span.setAttribute('data-tooltip', wordMap[match[0]] || wordMap[match[0].toLowerCase()] || '');
      frag.appendChild(span);
      lastIndex = regex.lastIndex;
    }
    // Remaining text after last match
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    // Replace the original text node if any matches were found
    if (frag.childNodes.length) {
      parent.replaceChild(frag, textNode);
    }
  }
}

// Tooltip logic (optional, for better styling than CSS ::after)
function setupTooltip() {
  let tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.background = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '4px 8px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.zIndex = '99999';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  document.body.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('highlighted-word')) {
      tooltip.textContent = e.target.getAttribute('data-tooltip');
      tooltip.style.display = 'block';
    }
  });
  document.body.addEventListener('mousemove', function(e) {
    if (e.target.classList.contains('highlighted-word')) {
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    }
  });
  document.body.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('highlighted-word')) {
      tooltip.style.display = 'none';
    }
  });
}

// Load word map from storage and highlight
chrome.storage.local.get('wordMap', function(data) {
  if (data.wordMap) {
    highlightWords(data.wordMap);
    setupTooltip();
  }
});
