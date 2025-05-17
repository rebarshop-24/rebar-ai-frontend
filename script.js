async function sendDrawing() {
  const fileInput = document.getElementById("fileInput");
  const resultBox = document.getElementById("result");

  if (!fileInput.files[0]) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  resultBox.innerText = "⏳ Uploading and parsing...";

  try {
    const response = await fetch("https://rebar-ai-backend.onrender.com/ask", {
      method: "POST",
      body: formData
    });

    const result = await response.text();
    resultBox.innerText = result;
  } catch (err) {
    resultBox.innerText = "❌ Error: " + err.message;
  }
}