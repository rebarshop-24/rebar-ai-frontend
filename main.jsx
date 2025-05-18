
import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [chat, setChat] = useState("");
  const [response, setResponse] = useState("");

  const sendChat = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chat })
    });
    const data = await res.json();
    setResponse(data.reply || "Error");
  };

  return (
    <div className="glass-card">
      <h1>🦾 Rebar AI Assistant</h1>
      <textarea value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Ask something..." rows="4" style={{ width: "100%", marginBottom: "1rem" }} />
      <button onClick={sendChat} style={{ padding: "0.5rem 1rem" }}>Send</button>
      <pre>{response}</pre>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
