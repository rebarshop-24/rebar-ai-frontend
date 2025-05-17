
// rebar-ai-ui.jsx
// ChatBot with full duplex: mic input + speech output, same UI, separate backends

import { useState, useRef } from "react";
import axios from "axios";

function HeroHeader() {
  return (
    <header className="text-center py-10">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-md">🦾 Rebar AI Assistant</h1>
      <p className="text-slate-300 text-lg mt-2">Your smart estimator for pricing & blueprint parsing</p>
    </header>
  );
}

// [TRUNCATED HERE IN DISPLAY — full JSX will be used in the file]

export default function RebarAIAssistant() {
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [file, setFile] = useState(null);
  const [blueprintResponse, setBlueprintResponse] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speech = event.results[0][0].transcript;
        setChatInput(speech);
        handleChat(speech);
      };

      recognition.onerror = (event) => {
        const errorMessage = event?.error || "Unknown speech recognition error.";
        console.error("Speech error:", errorMessage);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition setup failed:", err);
    }
  };

  const handleChat = async (messageOverride = null) => {
    setLoading(true);
    const msg = messageOverride || chatInput;
    try {
      const res = await axios.post("/api/chat", { message: msg });
      const reply = res.data.reply;
      setChatResponse(reply);
      speak(reply);
    } catch (err) {
      const errorMsg = "❌ ChatBot error: " + err.message;
      setChatResponse(errorMsg);
      speak(errorMsg);
    }
    setLoading(false);
  };

  const handleBlueprint = async () => {
    if (!file || !email) return alert("Please upload a file and enter your email");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    try {
      const res = await axios.post("/api/parse-drawing", formData);
      setBlueprintResponse(res.data);
    } catch (err) {
      setBlueprintResponse({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white p-6 space-y-10 font-sans">
      <HeroHeader />
      <ChatBot
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatResponse={chatResponse}
        handleChat={handleChat}
        startListening={startListening}
        loading={loading}
      />
      <BlueprintBot
        file={file}
        setFile={setFile}
        email={email}
        setEmail={setEmail}
        handleBlueprint={handleBlueprint}
        blueprintResponse={blueprintResponse}
        loading={loading}
      />
    </div>
  );
}
