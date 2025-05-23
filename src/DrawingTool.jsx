import React, { useState } from 'react';
import axios from 'axios';

export default function DrawingTool() {
  const [files, setFiles] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [pdfPath, setPdfPath] = useState("");
  const [email, setEmail] = useState("");
  const [folderId, setFolderId] = useState("");
  const [mode, setMode] = useState("estimate");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com";

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("mode", mode);
      const res = await axios.post(`${BACKEND_URL}/api/parse-blueprint-estimate`, formData);
      setJsonOutput(res.data);
      if (mode === "estimate") {
        const exportRes = await axios.post(`${BACKEND_URL}/api/export-pdf`, res.data, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([exportRes.data]));
        setPdfPath(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <span className="loader border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
          <span>Processing your files...</span>
        </div>
      )}
      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <select value={mode} onChange={e => setMode(e.target.value)} className="border px-2 py-1 mb-4 ml-2">
        <option value="estimate">Estimate</option>
        <option value="barlist">Barlist</option>
        <option value="drawing">Drawings</option>
      </select>
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded ml-2">Submit</button>

      {jsonOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 capitalize">{mode} Output</h2>
          <div className="overflow-auto bg-white p-4 shadow rounded">
            <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(jsonOutput, null, 2)}</pre>
          </div>

          {mode === "estimate" && (
            <div className="mt-4 space-y-3">
              {pdfPath && (
                <a href={pdfPath} download className="bg-gray-200 inline-block text-blue-700 px-3 py-1 rounded">📄 Download PDF</a>
              )}
              <div className="space-y-1">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Customer email" className="border px-2 py-1" />
                <button onClick={handleSendEmail} className="bg-green-600 text-white px-3 py-1 rounded ml-2">Send PDF via Email</button>
              </div>
              <div className="space-y-1">
                <input type="text" value={folderId} onChange={e => setFolderId(e.target.value)} placeholder="Google Drive Folder ID" className="border px-2 py-1" />
                <button onClick={handleUploadDrive} className="bg-gray-700 text-white px-3 py-1 rounded ml-2">Upload to Google Drive</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}