const csvInput = document.getElementById('csvInput');
const status = document.getElementById('status');
const error = document.getElementById('error');

csvInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  status.textContent = '';
  error.textContent = '';

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      if (!results.data || results.data.length === 0) {
        error.textContent = 'CSV is empty or invalid.';
        return;
      }
      // Build the wordMap from CSV rows
      const wordMap = {};
      results.data.forEach(row => {
        if (row.vccs_course) {
          wordMap[row.vccs_course.trim()] =
            `VT: ${row.vt_course || 'N/A'}<br>UVA: ${row.uva_course || 'N/A'}<br>GMU: ${row.gmu_course || 'N/A'}`;
        }
      });
      if (Object.keys(wordMap).length === 0) {
        error.textContent = 'No courses found in CSV.';
        return;
      }
      // Save wordMap to storage
      chrome.storage.local.set({ wordMap }, () => {
        status.textContent = 'CSV loaded! Reload www.nvcc.edu to see highlights.';
        error.textContent = '';
      });
    },
    error: function(err) {
      error.textContent = 'Error parsing CSV: ' + err.message;
    }
  });
});
