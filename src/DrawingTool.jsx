import React, { useState } from 'react';
import axios from 'axios';

export default function DrawingTool() {
  const [files, setFiles] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [folderId, setFolderId] = useState("");
  const [mode, setMode] = useState("estimate");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://rebar-ai-backend.onrender.com";

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async () => {
    setLoading(true);
    setJsonOutput(null);
    setPdfBlob(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("mode", mode);

      const res = await axios.post(`${BACKEND_URL}/api/parse-blueprint-estimate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setJsonOutput(res.data);

      // 🔍 Smart AI Notes Prompt
      let smartNotes = "✅ AI Estimate generated successfully.";
      if (res.data?.inferred || res.data?.missingDimensions || res.data?.confidence < 0.95) {
        smartNotes += "\n⚠️ Some dimensions (e.g., wall size) were inferred or unclear. Please confirm or upload a detailed drawing.";
      }
      setNotes(smartNotes);

      if (mode === "estimate") {
        const exportRes = await axios.post(`${BACKEND_URL}/api/export-pdf`, res.data, {
          responseType: "blob"
        });
        setPdfBlob(exportRes.data);
      }
    } catch (x) {
      const detail = x.response?.data?.detail || x.response?.data?.error || x.message;
      console.error("❌ Submission failed:", detail);
      alert(`❌ Submission failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !projectName || !pdfBlob) {
      return alert("❌ Missing email, project name, or PDF.");
    }

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], "Estimate_Report_Export.pdf", { type: "application/pdf" });

      formData.append("recipient", email);
      formData.append("project_name", projectName);
      formData.append("ai_message", notes);
      formData.append("file", file);

      await axios.post(`${BACKEND_URL}/api/send-estimate-email`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ Email sent successfully.");
    } catch (x) {
      const detail = x.response?.data?.detail || x.response?.data?.error || x.message;
      console.error("❌ Email failed:", detail);
      alert(`❌ Email failed: ${detail}`);
    }
  };

  const handleUploadDrive = async () => {
    if (!folderId || !pdfBlob) return alert("❌ Missing folder ID or PDF file.");

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], "Estimate_Report_Export.pdf", { type: "application/pdf" });

      formData.append("folder_id", folderId);
      formData.append("file", file);

      const res = await axios.post(`${BACKEND_URL}/api/upload-estimate-drive`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ Uploaded to Drive. File ID: " + res.data.file_id);
    } catch (x) {
      const detail = x.response?.data?.detail || x.response?.data?.error || x.message;
      console.error("❌ Drive upload failed:", detail);
      alert(`❌ Drive upload failed: ${detail}`);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Estimate Tools</h1>

      {loading && (
        <div className="text-blue-600 flex gap-2 items-center mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-600 border-solid border-r-transparent"></div>
          <span>Processing your files...</span>
        </div>
      )}

      <input
        type="file"
        multiple
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="mb-2"
      />

      <select
        value={mode}
        onChange={e => setMode(e.target.value)}
        className="border px-2 py-1 mb-4 ml-2"
      >
        <option value="estimate">Estimate</option>
        <option value="barlist">Barlist</option>
        <option value="drawing">Drawings</option>
      </select>

      <input
        type="email"
        placeholder="Customer Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <textarea
        placeholder="AI Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-4"
      />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>

      {pdfBlob && (
        <>
          <h3 className="text-lg font-semibold mt-4">📄 Estimate Preview</h3>
          <iframe
            title="Estimate Preview"
            src={URL.createObjectURL(pdfBlob)}
            width="100%"
            height="600px"
            className="border rounded my-2"
          />

          <div className="flex gap-2 mt-2 flex-wrap">
            <a
              href={URL.createObjectURL(pdfBlob)}
              download="Estimate_Report_Export.pdf"
              className="bg-gray-200 text-blue-700 px-3 py-1 rounded"
            >
              📥 Download PDF
            </a>
            <button
              onClick={handleSendEmail}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              ✅ Confirm & Send to Client
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={folderId}
                onChange={e => setFolderId(e.target.value)}
                placeholder="Google Drive Folder ID"
                className="border px-2 py-1"
              />
              <button
                onClick={handleUploadDrive}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                Upload to Google Drive
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
