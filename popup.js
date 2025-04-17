const courseData = {
    cs: {
      vt: [
        { nova: "CSC 221", vt: "CS 1114" },
        { nova: "CSC 222", vt: "CS 1115" },
        { nova: "CSC 223", vt: "CS 1116" },
        { nova: "MTH 263", vt: "MATH 1225" }
      ],
      uva: [
        { nova: "CSC 221", uva: "CS 1110" },
        { nova: "CSC 222", uva: "CS 1111" },
        { nova: "CSC 223", uva: "CS 1112" },
        { nova: "MTH 263", uva: "MATH 1310" }
      ]
    },
    eng: {
      vt: [
        { nova: "EGR 120", vt: "ENGE 1216" },
        { nova: "PHY 241", vt: "PHYS 2305" }
      ]
    },
    bus: {
      gmu: [
        { nova: "ACC 211", gmu: "ACCT 203" },
        { nova: "BUS 200", gmu: "BUS 100" }
      ]
    },
    arch: {
      vcu: [
        { nova: "ARC 121", vcu: "ARCH 101" },
        { nova: "ARC 122", vcu: "ARCH 102" }
      ]
    }
  };
  
  // Function to populate course dropdown based on major selection
  function updateCourseList() {
    const major = document.getElementById("majorSelect").value;
    const courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = ""; // Clear existing options
  
    const seenCourses = new Set(); // Keeps track of already added course codes
  
    const coursesByUni = courseData[major];
    if (coursesByUni) {
      Object.values(coursesByUni).forEach(courseList => {
        courseList.forEach(course => {
          const courseCode = course.nova;
          if (!seenCourses.has(courseCode)) {
            seenCourses.add(courseCode);
  
            const option = document.createElement("option");
            option.value = courseCode;
            option.textContent = courseCode;
            courseSelect.appendChild(option);
          }
        });
      });
    }
  }
  
  
  // Function to show course equivalencies based on selected major, course, and university
  function showCourses() {
    const major = document.getElementById("majorSelect").value;
    const uni = document.getElementById("universitySelect").value;
    const course = document.getElementById("courseSelect").value;
    const resultDiv = document.getElementById("results");
  
    const data = courseData[major]?.[uni];
    if (!data) {
      resultDiv.innerHTML = "<p>No data found for this combination.</p>";
      return;
    }
  
    const courseDataMatch = data.find(item => item.nova === course || item[uni] === course);
    
    if (!courseDataMatch) {
      resultDiv.innerHTML = "<p>No equivalency found for this course.</p>";
      return;
    }
  
    resultDiv.innerHTML = `
      <ul>
        <li>${courseDataMatch.nova} ➝ ${courseDataMatch[uni]}</li>
      </ul>
    `;
  }
  
  // Event listeners for page load and button click
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("majorSelect").addEventListener("change", updateCourseList);
    document.getElementById("showCoursesBtn").addEventListener("click", showCourses);
  
    // Initialize course list based on the default major
    updateCourseList();
  });
  