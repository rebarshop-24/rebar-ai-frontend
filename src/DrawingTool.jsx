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
    }
