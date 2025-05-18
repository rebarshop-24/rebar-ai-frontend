
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatOutput = document.getElementById("chat-output");

  const blueprintForm = document.getElementById("blueprint-form");
  const blueprintInput = document.getElementById("blueprint-file");
  const emailInput = document.getElementById("email");
  const blueprintOutput = document.getElementById("blueprint-output");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value;
    chatOutput.textContent = "🤖 Thinking...";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("❌ Server returned error " + res.status);
      }

      const data = await res.json();
      chatOutput.textContent = "🤖 " + (data.reply || "No response.");
    } catch (err) {
      chatOutput.textContent = "❌ Error: " + err.message;
    }
  });

  blueprintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = blueprintInput.files[0];
    const email = emailInput.value;
    if (!file || !email) {
      blueprintOutput.textContent = "❌ Please select a file and enter your email.";
      return;
    }

    blueprintOutput.textContent = "📐 Parsing...";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const res = await fetch("/api/parse-drawing", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("❌ Server returned error " + res.status);
      }

      const data = await res.json();
      blueprintOutput.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      blueprintOutput.textContent = "❌ Error: " + err.message;
    }
  });
});
