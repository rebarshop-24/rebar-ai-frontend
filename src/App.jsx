import React, { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    const response = await fetch('https://rebar-ai-backend.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
    const data = await response.json();
    setMessages(m => [...m, { sender: 'bot', text: data.reply || 'No reply' }]);
  };

  return (
    <div>
      <h1>🤖 Rebar AI Assistant</h1>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender === 'user' ? '🧑 You' : '🤖 Rebar AI'}</strong>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Ask a question..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
