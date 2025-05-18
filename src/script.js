document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const voiceBtn = document.getElementById("voice-btn");
  const uploadBtn = document.getElementById("upload-btn");

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com/api/chat";

  function addMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message";
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMessage("🧠 You", msg);
    input.value = "";

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    })
      .then(res => res.json())
      .then(data => {
        if (data.reply) {
          addMessage("🤖 Rebar AI", data.reply);
        } else {
          addMessage("🤖 Rebar AI", "⚠️ No reply received.");
        }
      })
      .catch(err => {
        console.error(err);
        addMessage("🤖 Rebar AI", "❌ Server error.");
      });
  }

  function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.onresult = event => {
      input.value = event.results[0][0].transcript;
      sendMessage(); // auto-send after speech
    };
    recognition.start();
  }

  function handleUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.jpg,.jpeg,.png,.txt";
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (file) {
        addMessage("📁 Upload", `Received: ${file.name}`);
        // You can trigger your Gemini parsing API here
      }
    };
    fileInput.click();
  }

  sendBtn.onclick = sendMessage;
  voiceBtn.onclick = startVoiceInput;
  uploadBtn.onclick = handleUpload;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
