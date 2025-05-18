
document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById("chatBtn");
  const uploadBtn = document.getElementById("uploadBtn");

  chatBtn?.addEventListener("click", async () => {
    const chatInput = document.getElementById("chatInput").value;
    const chatResponse = document.getElementById("chatResponse");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      chatResponse.textContent = data.reply || "❌ No response";
    } catch (err) {
      chatResponse.textContent = "❌ Error: " + err.message;
    }
  });

  uploadBtn?.addEventListener("click", async () => {
    const file = document.getElementById("blueprintFile").files[0];
    const email = document.getElementById("emailInput").value;
    const uploadResponse = document.getElementById("uploadResponse");

    if (!file || !email) {
      uploadResponse.textContent = "⚠️ Please provide both file and email.";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const res = await fetch("/api/parse-drawing", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      uploadResponse.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      uploadResponse.textContent = "❌ Error: " + err.message;
    }
  });
});
