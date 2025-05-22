// src/DrawingTool.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DrawingTool() {
  const [files, setFiles] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [mode, setMode] = useState("drawing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com";
  const SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbzIqrzDQtPfxST7NzmeZdls88qYP0UgCCtAEd1dkIHo_aVaLkzvneKXYzPPZx6QdQ/exec";
  const estimateTableRef = useRef(null);

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true); setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("mode", mode);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/parse-blueprints`, formData);
      if (response.data?.error) {
        console.error("Gemini Error:", response.data);
        setError(response.data.error || "Something went wrong with Gemini output.");
      } else if (mode === "drawing") {
        setDrawings(response.data);
      } else {
        setJsonOutput(response.data);
      }
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}-output.json`;
    link.click();
  };

  const downloadPDF = async () => {
    if (!estimateTableRef.current) return;
    const canvas = await html2canvas(estimateTableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('estimate-output.pdf');
  };

  const sendToGoogleSheets = async () => {
    if (!jsonOutput || !Array.isArray(jsonOutput)) return;
    try {
      await axios.post(SHEET_WEBHOOK, jsonOutput);
      alert("✅ Sent to Google Sheets successfully.");
    } catch {
      alert("❌ Failed to send to Google Sheets.");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Drawing Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input type="file" multiple onChange={handleFileChange} />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="drawing">Drawings</option>
          <option value="barlist">Barlist</option>
          <option value="estimate">Estimate</option>
        </select>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <span className="loader border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
          <span>Processing your files...</span>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {mode === "estimate" && jsonOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Estimate Output</h2>
          <div ref={estimateTableRef} className="overflow-auto bg-white p-4 shadow rounded">
            <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(jsonOutput, null, 2)}</pre>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={downloadJSON} className="bg-blue-600 text-white px-3 py-1 rounded">Download JSON</button>
            <button onClick={downloadPDF} className="bg-green-600 text-white px-3 py-1 rounded">Download PDF</button>
            <form onSubmit={(e) => { e.preventDefault(); alert('📩 Sent to customer. Waiting for clarification...'); }} className="flex gap-2">
  <input type="text" placeholder="Add customer note..." className="border px-2 py-1 rounded w-64" />
  <button type="submit" className="bg-orange-500 text-white px-3 py-1 rounded">
    Send to Customer for Clarification
  </button>
</form>
          </div>
        </div>
      )}
    </div>
  );
}
