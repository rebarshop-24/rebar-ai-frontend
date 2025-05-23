import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function DrawingTool() {
  const [files, setFiles] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [pdfPath, setPdfPath] = useState("");
  const [email, setEmail] = useState("");
  const [folderId, setFolderId] = useState("");

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com";

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleExportPDF = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("mode", "estimate");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/parse-blueprint-estimate`, formData);
      const raw = response.data;
      setJsonOutput(raw);
      const exportRes = await axios.post(`${BACKEND_URL}/api/export-pdf`, raw, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([exportRes.data]));
      setPdfPath(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleSendEmail = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/send-estimate-email`, new URLSearchParams({
        recipient: email,
        file_path: "/tmp/Estimate_Report_Export.pdf"
      }));
      alert("✅ Email sent.");
    } catch {
      alert("❌ Email failed.");
    }
  };

  const handleUploadDrive = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("file_path", "/tmp/Estimate_Report_Export.pdf");
      formData.append("folder_id", folderId);
      const res = await axios.post(`${BACKEND_URL}/api/upload-estimate-drive`, formData);
      alert("✅ Uploaded to Drive: " + res.data.file_id);
    } catch {
      alert("❌ Drive upload failed.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Estimate Tools</h1>
      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <button onClick={handleExportPDF} className="bg-blue-600 text-white px-4 py-2 rounded">Export Estimate PDF</button>

      {pdfPath && (
        <div className="mt-4 space-y-2">
          <a href={pdfPath} download className="text-blue-700 underline">📄 Download PDF</a>
          <div className="space-y-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Customer email" className="border px-2 py-1" />
            <button onClick={handleSendEmail} className="bg-green-600 text-white px-3 py-1 rounded">Send PDF via Email</button>
          </div>
          <div className="space-y-2">
            <input type="text" value={folderId} onChange={e => setFolderId(e.target.value)} placeholder="Google Drive Folder ID" className="border px-2 py-1" />
            <button onClick={handleUploadDrive} className="bg-gray-700 text-white px-3 py-1 rounded">Upload to Google Drive</button>
          </div>
        </div>
      )}
    </div>
  );
}