const chatbox = document.getElementById("chatbox");

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.textContent = (role === "user" ? "🧑‍💼 " : "🤖 ") + text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendDrawing() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files[0]) return alert("Select a file first.");

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("email", "ai@rebar.shop"); // temporary email for API call

  appendMessage("user", "[Uploaded a drawing]");
  appendMessage("assistant", "⏳ Processing...");

  try {
    const response = await fetch("https://rebar-ai-backend.onrender.com/api/parse-drawing", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.success) {
      appendMessage("assistant", JSON.stringify(result.data, null, 2));
    } else {
      appendMessage("assistant", result.error || "Follow-up required.");
    }
  } catch (err) {
    appendMessage("assistant", "❌ Error: " + err.message);
  }
}

async function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage("user", msg);
  input.value = "";
  appendMessage("assistant", "⏳ Thinking...");

  try {
    const response = await fetch("https://rebar-ai-backend.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await response.json();
    appendMessage("assistant", data.reply);
  } catch (err) {
    appendMessage("assistant", "❌ Error: " + err.message);
  }
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("chatInput").value = transcript;
    sendChat();
  };
  recognition.start();
}