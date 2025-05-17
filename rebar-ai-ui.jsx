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

// [Trimmed for brevity in preview] — full code will be written below

