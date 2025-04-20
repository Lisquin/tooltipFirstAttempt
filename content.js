// --- CSV Parsing and Highlighting Functions ---

let courseList = null; // Will hold parsed CSV data

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    let obj = {};
    header.forEach((h, i) => obj[h] = cols[i]);
    return obj;
  });
}

function underlineCourses(courseList) {
  if (!courseList || courseList.length === 0) return;
  const vccsCourses = courseList.map(row => row.vccs_course).filter(Boolean);
  const regex = new RegExp('\\b(' + vccsCourses.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
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
      const row = courseList.find(r => r.vccs_course.toLowerCase() === match[0].toLowerCase());
      if (row) {
        span.setAttribute('data-tooltip',
          `VT: ${row.vt_course}\nUVA: ${row.uva_course}\nGMU: ${row.gmu_course}`
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

function removeUnderlines() {
  document.querySelectorAll('span.underlined-course').forEach(span => {
    const parent = span.parentNode;
    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize(); // Merge adjacent text nodes
  });
}

// --- Tooltip logic (unchanged) ---
function setupTooltip() {
  if (document.getElementById('course-tooltip')) return; // Prevent duplicates
  let tooltip = document.createElement('div');
  tooltip.id = 'course-tooltip';
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

// --- Initialization ---

// Fetch CSV once and store in memory
function fetchAndCacheCourses(callback) {
  if (courseList) {
    callback(courseList);
  } else {
    fetch(chrome.runtime.getURL('courses.csv'))
      .then(res => res.text())
      .then(csvText => {
        courseList = parseCSV(csvText);
        callback(courseList);
      });
  }
}

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "enable_highlighting") {
    fetchAndCacheCourses(list => {
      underlineCourses(list);
      setupTooltip();
    });
  } else if (message.action === "disable_highlighting") {
    removeUnderlines();
  }
});

// On initial load, apply highlighting if enabled
chrome.storage.local.get('enabled', function(data) {
  if (data.enabled) {
    fetchAndCacheCourses(list => {
      underlineCourses(list);
      setupTooltip();
    });
  }
});
