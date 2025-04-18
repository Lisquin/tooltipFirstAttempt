// Content script: highlights matching courses and shows tooltips

let majorData = {};
let enabled = true;
let selectedMajor = "compsci";

// Helper: fetch JSON data for selected major
async function loadMajorData(major) {
  const url = chrome.runtime.getURL(`majors/${major}.json`);
  const res = await fetch(url);
  return res.json();
}

// Helper: find all text nodes in the body
function getTextNodes(node) {
  let textNodes = [];
  if (node.nodeType === Node.TEXT_NODE) {
    textNodes.push(node);
  } else {
    for (let child of node.childNodes) {
      textNodes = textNodes.concat(getTextNodes(child));
    }
  }
  return textNodes;
}

// Helper: create tooltip div
function createTooltip() {
  let tooltip = document.createElement('div');
  tooltip.className = 'nvcc-tooltip';
  document.body.appendChild(tooltip);
  return tooltip;
}

let tooltipDiv = createTooltip();

// Show tooltip near mouse
function showTooltip(content, x, y) {
  tooltipDiv.innerHTML = content;
  tooltipDiv.style.display = 'block';
  tooltipDiv.style.left = (x + 10) + 'px';
  tooltipDiv.style.top = (y + 10) + 'px';
}

// Hide tooltip
function hideTooltip() {
  tooltipDiv.style.display = 'none';
}

// Main: annotate matching courses
async function annotateCourses() {
  if (!enabled) return;

  majorData = await loadMajorData(selectedMajor);
  const courseCodes = Object.keys(majorData);

  // Build regex to match course codes as whole words
  const regex = new RegExp(`\\b(${courseCodes.join('|')})\\b`, 'g');

  // Find all text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    // Skip nodes inside our own tooltips or checkmarks
    if (node.parentNode.classList && (node.parentNode.classList.contains('nvcc-checkmark') || node.parentNode.classList.contains('nvcc-tooltip'))) continue;

    // Only annotate if text matches
    let matches = node.nodeValue.match(regex);
    if (matches) {
      let span = document.createElement('span');
      let lastIndex = 0;
      let html = '';

      // Split and wrap matches
      node.nodeValue.replace(regex, (match, p1, offset) => {
        // Text before match
        html += escapeHTML(node.nodeValue.slice(lastIndex, offset));
        // Matched course code with checkmark
        html += `<span class="nvcc-course" data-course="${match}">${escapeHTML(match)}<img src="${chrome.runtime.getURL('icons/checkmark.png')}" class="nvcc-checkmark" data-course="${match}"></span>`;
        lastIndex = offset + match.length;
      });
      // Remaining text
      html += escapeHTML(node.nodeValue.slice(lastIndex));
      span.innerHTML = html;
      node.parentNode.replaceChild(span, node);
    }
  }

  // Tooltip events
  document.querySelectorAll('.nvcc-checkmark').forEach(img => {
    img.addEventListener('mouseenter', (e) => {
      const course = img.getAttribute('data-course');
      const info = majorData[course];
      let tooltipContent = '';
      for (let [school, equiv] of Object.entries(info)) {
        tooltipContent += `<b>${school}:</b> ${equiv}<br>`;
      }
      showTooltip(tooltipContent, e.pageX, e.pageY);
    });
    img.addEventListener('mousemove', (e) => {
      tooltipDiv.style.left = (e.pageX + 10) + 'px';
      tooltipDiv.style.top = (e.pageY + 10) + 'px';
    });
    img.addEventListener('mouseleave', hideTooltip);
  });
}

// Escape HTML helper
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// Listen for changes (toggle/major) and re-run
function setupListener() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.enabled) enabled = changes.enabled.newValue;
      if (changes.selectedMajor) selectedMajor = changes.selectedMajor.newValue;
      // Remove old tooltips/checkmarks
      document.querySelectorAll('.nvcc-course').forEach(el => {
        el.outerHTML = el.textContent;
      });
      annotateCourses();
    }
  });
}

// Initial load
chrome.storage.sync.get(['enabled', 'selectedMajor'], (data) => {
  enabled = data.enabled ?? true;
  selectedMajor = data.selectedMajor ?? "compsci";
  annotateCourses();
  setupListener();
});
