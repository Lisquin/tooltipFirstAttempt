function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function underlineCourses(courseMap) {
  if (!courseMap || Object.keys(courseMap).length === 0) return;
  const courses = Object.keys(courseMap).map(escapeRegExp);
  if (courses.length === 0) return;
  const regex = new RegExp('\\b(' + courses.join('|') + ')\\b', 'gi');
  walk(document.body);

  function walk(node) {
    let child, next;
    switch (node.nodeType) {
      case 1:
        if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) return;
        for (child = node.firstChild; child; child = next) {
          next = child.nextSibling;
          walk(child);
        }
        break;
      case 3:
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
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const span = document.createElement('span');
      span.className = 'underlined-course';
      span.textContent = match[0];
      const data = courseMap[match[0]] || courseMap[match[0].toUpperCase()] || courseMap[match[0].toLowerCase()];
      if (data) {
        span.setAttribute('data-tooltip',
          `VT: ${data.vt}\nUVA: ${data.uva}\nGMU: ${data.gmu}`
        );
      }
      frag.appendChild(span);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    if (frag.childNodes.length) {
      parent.replaceChild(frag, textNode);
    }
  }
}

// Tooltip logic
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
  tooltip.style.whiteSpace = 'pre-line';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  document.body.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('underlined-course')) {
      tooltip.textContent = e.target.getAttribute('data-tooltip');
      tooltip.style.display = 'block';
    }
  });
  document.body.addEventListener('mousemove', function(e) {
    if (e.target.classList.contains('underlined-course')) {
      tooltip.style.left = (e.pageX + 10) + 'px';
      tooltip.style.top = (e.pageY + 10) + 'px';
    }
  });
  document.body.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('underlined-course')) {
      tooltip.style.display = 'none';
    }
  });
}

// Only run if enabled
chrome.storage.local.get(['enabled', 'courseMap'], function(data) {
  if (data.enabled && data.courseMap) {
    underlineCourses(data.courseMap);
    setupTooltip();
  }
});
