
document.getElementById("sendBtn").onclick = async () => {
  const msg = document.getElementById("chatInput").value;
  const resBox = document.getElementById("chatResponse");
  resBox.textContent = "⏳ Thinking...";
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    resBox.textContent = data.reply || "❌ Error in response.";
  } catch (err) {
    resBox.textContent = "❌ " + err.message;
  }
};

document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("fileInput").files[0];
  const email = document.getElementById("emailInput").value;
  const resBox = document.getElementById("blueprintResponse");
  if (!file || !email) return alert("File and email required.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", email);
  resBox.textContent = "⏳ Uploading...";
  try {
    const res = await fetch("/api/parse-drawing", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    resBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    resBox.textContent = "❌ " + err.message;
  }
};
