import React, { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", text: input }]);
    setMessages(prev => [...prev, { role: "ai", text: "Thinking..." }]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        🤖 Rebar AI Assistant
      </h1>

      <div className="w-full max-w-xl space-y-4 flex-grow">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <div className={
              `inline-block px-4 py-2 rounded-lg 
              ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`
            }>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 w-full max-w-xl flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
          className="flex-grow px-4 py-2 border rounded shadow"
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
          Send
        </button>
      </div>
    </div>
  );
}
