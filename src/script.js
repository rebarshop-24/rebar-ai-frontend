const chatBox = document.getElementById("chatBox");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  appendMessage("🧠 You", text);
  input.value = "";

  fetch("https://rebar-ai-backend.onrender.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => appendMessage("🤖 Rebar AI", data.reply || "No response."))
    .catch(() => appendMessage("🤖 Rebar AI", "❌ Server error"));
}

function startVoice() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "en-US";
  rec.onresult = event => {
    document.getElementById("chatInput").value = event.results[0][0].transcript;
  };
  rec.start();
}

function uploadFile() {
  const file = document.getElementById("drawingUpload").files[0];
  if (!file) return alert("Upload a file first.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", "test@example.com");

  fetch("https://rebar-ai-backend.onrender.com/api/parse-drawing", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        appendMessage("🤖 Rebar AI", "✅ Drawing processed.");
      } else {
        appendMessage("🤖 Rebar AI", data.error || data.question || "❌ Failed");
      }
    })
    .catch(() => appendMessage("🤖 Rebar AI", "❌ Upload error"));
}