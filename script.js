
async function sendChat() {
  const input = document.getElementById("chatInput").value;
  const responseBox = document.getElementById("chatResponse");
  responseBox.textContent = "Sending...";

  try {
    const response = await fetch("https://rebar-ai-backend.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });
    const result = await response.json();
    responseBox.textContent = result.response;
  } catch (err) {
    responseBox.textContent = "Error: " + err;
  }
}

async function uploadBlueprint() {
  const fileInput = document.getElementById("blueprintFile");
  const file = fileInput.files[0];
  const responseBox = document.getElementById("blueprintResponse");
  if (!file) {
    alert("Select a file first.");
    return;
  }

  responseBox.textContent = "Uploading...";
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://rebar-ai-backend.onrender.com/api/parse-drawing", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    responseBox.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    responseBox.textContent = "Error: " + err;
  }
}
