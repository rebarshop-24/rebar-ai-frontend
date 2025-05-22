// src/DrawingTool.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DrawingTool() {
  const [file, setFile] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [mode, setMode] = useState("drawing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com";
  const SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbzIqrzDQtPfxST7NzmeZdls88qYP0UgCCtAEd1dkIHo_aVaLkzvneKXYzPPZx6QdQ/exec";
  const estimateTableRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(null);

    const formData = new FormData();
    formData.append("file_path", file);
    formData.append("mode", mode);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/parse-blueprints`, formData);
      if (mode === "drawing") {
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
  };
    </div>

            </div>
          ))}
        </div>
      )}

      {mode === "estimate" && jsonOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Estimate Output</h2>
          <div ref={estimateTableRef} className="overflow-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-2 py-1 border">Size</th>
                  <th className="px-2 py-1 border">Total (kg)</th>
                </tr>
              </thead>
              <tbody>
                {jsonOutput.weight_by_size_kg && Object.entries(jsonOutput.weight_by_size_kg).map(([size, weight]) => (
                  <tr key={size}>
                    <td className="px-2 py-1 border font-medium">{size}</td>
                    <td className="px-2 py-1 border">{weight.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="px-2 py-1 border">TOTAL</td>
                  <td className="px-2 py-1 border">{jsonOutput.total_weight_kg?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-sm text-gray-700">
              Mesh Area: <strong>{jsonOutput.total_mesh_ft2?.toLocaleString()}</strong> ft²
            </p>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={downloadJSON} className="bg-blue-600 text-white px-3 py-1 rounded">Download JSON</button>
            <button onClick={downloadPDF} className="bg-green-600 text-white px-3 py-1 rounded">Download PDF</button>
          </div>
        </div>
      )}

      {mode === "barlist" && jsonOutput && Array.isArray(jsonOutput) && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Barlist Output</h2>
          <div className="overflow-auto">
            <table className="min-w-full text-xs border">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(jsonOutput[0]).map((key) => (
                    <th key={key} className="px-2 py-1 border font-semibold text-left">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jsonOutput.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1 border whitespace-nowrap">{val ?? '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={downloadJSON} className="bg-blue-600 text-white px-3 py-1 rounded">Download JSON</button>
            <button onClick={sendToGoogleSheets} className="bg-yellow-500 text-white px-3 py-1 rounded">Send to Google Sheets</button>
          </div>
        </div>
      )}
    </div>
  );
}
