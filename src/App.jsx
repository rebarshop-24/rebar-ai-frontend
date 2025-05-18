import { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const aiMessage = { role: 'ai', text: data.reply || 'Error' };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🤖 Rebar AI Assistant</h1>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="inline-block px-3 py-2 bg-white rounded shadow">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          className="flex-1 p-2 border rounded-l"
          placeholder="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded-r">Send</button>
      </div>
    </div>
  );
}
