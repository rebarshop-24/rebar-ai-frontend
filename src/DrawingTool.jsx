import React, { useState } from 'react';
import axios from 'axios';
import Barlist from './components/Barlist';
import EstimatePreview from './components/EstimatePreview';

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
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError(null);
  };

  const getErrorMessage = (error) => {
    if (error.response?.status === 502) {
      return "The backend service is currently unavailable. This may be due to the service being in sleep mode. Please try again in a few minutes.";
    }
    if (error.response?.status === 500) {
      return "Internal server error. Please try again or contact support if the issue persists.";
    }
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    return error.response?.data?.detail || error.message || "An unexpected error occurred";
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError("Please select at least one file");
      return;
    }

    setLoading(true);
    setError(null);
    setJsonOutput(null);
    setPdfBlob(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("mode", mode);

      const res = await axios.post('/api/parse-blueprints', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setJsonOutput(res.data);

      if (mode === "estimate") {
        let smartNotes = "✅ AI Estimate generated successfully.";
        const aiNotes = res.data?.raw?.["NOTES & CLARIFICATIONS"] || "";
        const lowConfidence = res.data?.confidence < 0.95 || res.data?.inferred || res.data?.missingDimensions;
        if (lowConfidence) {
          smartNotes += "\n⚠️ Some dimensions (e.g., wall size) were inferred or unclear. Please confirm or upload a detailed drawing.";
        }
        if (aiNotes) {
          smartNotes += `\n\n${aiNotes}`;
        }
        setNotes(smartNotes);

        const exportRes = await axios.post('/api/export-pdf', res.data, {
          responseType: "blob"
        });
        setPdfBlob(exportRes.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !projectName || !jsonOutput) {
      setError("Please provide email, project name, and ensure data is processed");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jsonFile = new File([JSON.stringify(jsonOutput)], "EstimateData.json", { type: "application/json" });

      const formData = new FormData();
      formData.append("recipient", email);
      formData.append("project_name", projectName);
      formData.append("ai_message", notes);
      formData.append("file", jsonFile);

      await axios.post('/api/send-estimate-email', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ Email sent successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Email error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDrive = async () => {
    if (!folderId || !pdfBlob) {
      setError("Missing folder ID or PDF file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], "Estimate_Report_Export.pdf", { type: "application/pdf" });

      formData.append("folder_id", folderId);
      formData.append("file", file);

      const res = await axios.post('/api/upload-estimate-drive', formData);
      alert("✅ Uploaded to Drive. File ID: " + res.data.file_id);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Drive upload error:", err);
    } finally {
      setLoading(false);
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

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
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

      {mode === "estimate" && (
        <>
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
        </>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={loading} 
        className={`bg-blue-600 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        Submit
      </button>

      {mode === "barlist" && <Barlist data={jsonOutput} />}

      {mode === "estimate" && (
        <EstimatePreview
          pdfBlob={pdfBlob}
          onSendEmail={handleSendEmail}
          onUploadDrive={handleUploadDrive}
          loading={loading}
          folderId={folderId}
          setFolderId={setFolderId}
        />
      )}
    </div>
  );
}