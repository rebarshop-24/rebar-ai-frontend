
import { useEffect, useRef, useState } from 'react';
import { Mic, Send, UploadCloud } from 'lucide-react';

export default function VoiceChat() {
  const [messages, setMessages] = useState([{ role: 'ai', content: 'Hi, upload your blueprint or ask a question.' }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handleListen = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (text) => {
    const userMessage = { role: 'user', content: text || input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const aiResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] })
    }).then(res => res.json());
    setMessages((prev) => [...prev, { role: 'ai', content: aiResponse.reply }]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMessages((prev) => [...prev, { role: 'user', content: `Uploaded file: ${file.name}` }]);
    const formData = new FormData();
    formData.append('file', file);

    const aiResponse = await fetch('/api/parse-drawing', {
      method: 'POST',
      body: formData
    }).then(res => res.json());

    setMessages((prev) => [...prev, { role: 'ai', content: aiResponse.reply }]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>Rebar Estimate Assistant</h1>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxHeight: '400px', overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              background: msg.role === 'ai' ? '#f1f5f9' : '#3b82f6',
              color: msg.role === 'ai' ? '#000' : '#fff',
              alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
              maxWidth: '80%'
            }}>{msg.content}</div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: '1rem', gap: '0.5rem' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or upload a file..."
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button onClick={() => handleSend()}><Send size={16} /></button>
          <button onClick={handleListen}><Mic size={16} /></button>
          <button onClick={() => fileInputRef.current.click()}><UploadCloud size={16} /></button>
          <input
            type="file"
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
