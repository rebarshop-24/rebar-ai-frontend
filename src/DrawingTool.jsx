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
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("mode", mode);
      const res = await axios.post(`${BACKEND_URL}/api/parse-blueprint-estimate`, formData);
      setJsonOutput(res.data);

      if (mode === "estimate") {
        const exportRes = await axios.post(`${BACKEND_URL}/api/export-pdf`, res.data, {
          responseType: "blob"
        });
        setPdfBlob(exportRes.data);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !projectName || !pdfBlob) {
      return alert("Missing email, project name, or PDF.");
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

      alert("✅ Email sent.");
    } catch (err) {
      console.error(err);
      alert("❌ Email failed.");
    }
  };

  const handleUploadDrive = async () => {
    if (!folderId || !pdfBlob) return alert("Missing folder ID or PDF file.");

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], "Estimate_Report_Export.pdf", { type: "application/pdf" });

      formData.append("folder_id", folderId);
      formData.append("file", file);

      const res = await axios.post(`${BACKEND_URL}/api/upload-estimate-drive`, formData);
      alert("✅ Uploaded to Drive: " + res.data.file_id);
    } catch (err) {
      console.error(err);
      alert("❌ Drive upload failed.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Estimate Tools</h1>
      {loading && (
        <div className="text-blue-600 flex gap-2 items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-600 border-solid border-r-transparent"></div>
          <span>Processing your files...</span>
        </div>
      )}

      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <select value={mode} onChange={e => setMode(e.target.value)} className="border px-2 py-1 mb-4 ml-2">
        <option value="estimate">Estimate</option>
        <option value="barlist">Barlist</option>
        <option value="drawing">Drawings</option>
      </select>

      <input type="email" placeholder="Customer Email" value={email} onChange={e => setEmail(e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
      <input type="text" placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
      <textarea placeholder="AI Notes" value={notes} onChange={e => setNotes(e.target.value)} className="border px-2 py-1 rounded w-full mb-4" />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>

      {jsonOutput && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 capitalize">{mode} Output</h2>
          <div className="overflow-auto bg-white p-4 shadow rounded">
            <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(jsonOutput, null, 2)}</pre>
          </div>

          {mode === "estimate" && (
            <div className="mt-4 space-y-3">
              {pdfBlob && (
                <a
                  href={URL.createObjectURL(pdfBlob)}
                  download="Estimate_Report_Export.pdf"
                  className="bg-gray-200 inline-block text-blue-700 px-3 py-1 rounded"
                >
                  📄 Download PDF
                </a>
              )}
              <button onClick={handleSendEmail} className="bg-green-600 text-white px-3 py-1 rounded ml-2">Send PDF via Gmail</button>
              <div>
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
