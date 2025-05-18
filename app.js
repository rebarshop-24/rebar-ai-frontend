
document.getElementById('root').innerHTML = `
  <div style="max-width:700px;margin:0 auto;padding:2rem;">
    <h1 style="font-size:2rem;margin-bottom:1rem;">🤖 Rebar AI Assistant</h1>
    <div style="margin-bottom:2rem;">
      <h2>💬 ChatBot</h2>
      <textarea id="chat-input" rows="4" style="width:100%"></textarea><br/>
      <button onclick="sendChat()">Send</button>
      <pre id="chat-response"></pre>
    </div>
    <div>
      <h2>📐 BlueprintBot</h2>
      <input type="file" id="blueprint-file"/><br/><br/>
      <input type="email" id="email" placeholder="Your email"/><br/><br/>
      <button onclick="uploadBlueprint()">Upload</button>
      <pre id="blueprint-response"></pre>
    </div>
  </div>
`;

async function sendChat() {
  const msg = document.getElementById('chat-input').value;
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });
  const data = await res.json();
  document.getElementById('chat-response').textContent = data.reply || "Error.";
}

async function uploadBlueprint() {
  const file = document.getElementById('blueprint-file').files[0];
  const email = document.getElementById('email').value;
  if (!file || !email) return alert("Missing file or email");
  const form = new FormData();
  form.append("file", file);
  form.append("email", email);
  const res = await fetch("/api/parse-drawing", { method: "POST", body: form });
  const data = await res.json();
  document.getElementById('blueprint-response').textContent = JSON.stringify(data, null, 2);
}
