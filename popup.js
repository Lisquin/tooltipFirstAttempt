document.getElementById("check-button").addEventListener("click", async () => {
    const school = document.getElementById("school-select").value;
    const userInput = document.getElementById("class-input").value.trim();
    const formattedInput = formatInput(userInput);
  
    const res = await fetch("equivalency.json");
    const data = await res.json();
  
    const index = Object.values(data.vccs_course).indexOf(formattedInput);
    const resultDiv = document.getElementById("result");
  
    if (index === -1) {
      resultDiv.innerText = `Course "${formattedInput}" not found.`;
      return;
    }
  
    const course = data[school];
    if (!school || !course) {
      resultDiv.innerText = "Please select a school.";
      return;
    }
  
    const equivalent = course[index];
    resultDiv.innerText = `${formattedInput} at NOVA transfers to: ${equivalent}`;
  });
  
  function formatInput(input) {
    const match = input.toUpperCase().match(/([A-Z]+)\s*0*([0-9]+)/);
    if (!match) return input.toUpperCase();
    return `${match[1]} ${parseInt(match[2])}`;
  }
  