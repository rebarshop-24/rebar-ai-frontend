import { useState } from 'react';
import { Mic, Send, Upload } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setListening] = useState(false);

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    addMessage('user', userMsg);
    setInput('');

    try {
      const res = await fetch('https://rebar-ai-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      console.log('GPT Reply:', data.reply);
      addMessage('ai', data.reply);
    } catch (err) {
      addMessage('ai', '❌ Server error.');
    }
  };

  const handleVoice = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 flex flex-col items-center p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">🤖 Rebar AI Assistant</h1>

      <div className="w-full max-w-2xl bg-white shadow-lg p-6 rounded-2xl">
        <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
              <span className="block text-sm text-gray-600 mb-1">{msg.role === 'user' ? '🧑 You' : '🤖 Rebar AI'}</span>
              <p className="whitespace-pre-wrap text-base font-medium">{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700">
            <Send size={18} />
          </button>
          <button onClick={handleVoice} className={`p-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-200'} hover:bg-red-500`}>
            <Mic size={18} className={isListening ? 'text-white' : 'text-black'} />
          </button>
          <button className="p-3 rounded-full bg-gray-200 hover:bg-gray-300">
            <Upload size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}