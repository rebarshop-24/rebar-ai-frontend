import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://rebar-ai-backend.onrender.com';

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
  const [barlistData, setBarlistData] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError(null);
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
    setBarlistData(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("mode", mode);

      const res = await axios.post(`${BACKEND_URL}/api/parse-blueprint-${mode}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setJsonOutput(res.data);

      if (mode === "barlist") {
        if (!res.data?.bars?.length) {
          throw new Error("No rebar data found in the uploaded files. Please check the files and try again.");
        }
        setBarlistData(res.data);
      } else if (mode === "estimate") {
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

        const exportRes = await axios.post(`${BACKEND_URL}/api/export-pdf`, res.data, {
          responseType: "blob"
        });
        setPdfBlob(exportRes.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to process files");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      setEmailError("Please enter a recipient email address");
      return;
    }
    if (!projectName) {
      setEmailError("Please enter a project name");
      return;
    }
    if (!pdfBlob) {
      setEmailError("No PDF file available to send");
      return;
    }

    setEmailSending(true);
    setEmailError(null);

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], `${projectName}_Estimate.pdf`, { type: "application/pdf" });

      formData.append("recipient", email);
      formData.append("project_name", projectName);
      formData.append("ai_message", notes);
      formData.append("file", file);

      const response = await axios.post(`${BACKEND_URL}/api/send-estimate-email`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        timeout: 60000, // 60 second timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Don't reject if the status code is < 500
        }
      });

      if (response.status === 200) {
        alert("✅ Email sent successfully!");
      } else {
        throw new Error(response.data?.detail || "Failed to send email");
      }
    } catch (err) {
      console.error("Email error:", err);
      const errorMessage = err.response?.data?.detail || err.message;
      setEmailError(
        errorMessage.includes("Gmail authentication") 
          ? "Email service is temporarily unavailable. Please try again later or download the PDF manually."
          : `Failed to send email: ${errorMessage}`
      );
    } finally {
      setEmailSending(false);
    }
  };

  const handleUploadDrive = async () => {
    if (!folderId || !pdfBlob) return alert("❌ Missing folder ID or PDF file.");

    try {
      const formData = new FormData();
      const file = new File([pdfBlob], "Estimate_Report_Export.pdf", { type: "application/pdf" });

      formData.append("folder_id", folderId);
      formData.append("file", file);

      const res = await axios.post(`${BACKEND_URL}/api/upload-estimate-drive`, formData);
      alert("✅ Uploaded to Drive. File ID: " + res.data.file_id);
    } catch (x) {
      const detail = x.response?.data?.detail || x.message;
      alert(`❌ Drive upload failed: ${detail}`);
    }
  };

  const renderBarlist = () => {
    if (!barlistData) return null;

    // RSIC standard weights in lb/ft
    const weightPerFoot = {
      '10M': 0.528,
      '15M': 1.055,
      '20M': 1.583,
      '25M': 2.638,
      '30M': 3.693,
      '35M': 5.275,
      '45M': 7.912,
      '55M': 13.188
    };

    return (
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bar List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bar Mark</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bar Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (ft)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Length (ft)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (lb/ft)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Weight (lb)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shape</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barlistData.bars?.map((bar, index) => {
                const weight = weightPerFoot[bar.size] || 0;
                const lengthInFeet = bar.length / 12; // Convert inches to feet
                const totalLength = lengthInFeet * bar.count;
                const totalWeight = weight * totalLength;

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{bar.mark}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bar.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bar.type || 'Straight'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{lengthInFeet.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bar.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{totalLength.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{weight.toFixed(3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{totalWeight.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bar.shape || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
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
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          ❌ {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <input 
          type="file" 
          multiple 
          accept=".pdf,image/*" 
          onChange={handleFileChange} 
          className="flex-grow"
        />
        <select 
          value={mode} 
          onChange={e => setMode(e.target.value)} 
          className="border px-2 py-1 rounded"
        >
          <option value="estimate">Estimate</option>
          <option value="barlist">Barlist</option>
          <option value="drawing">Drawings</option>
        </select>
      </div>

      <input 
        type="email" 
        placeholder="Customer Email" 
        value={email} 
        onChange={e => {
          setEmail(e.target.value);
          setEmailError(null);
        }} 
        className={`border px-2 py-1 rounded w-full mb-2 ${emailError && !email ? 'border-red-500' : ''}`}
      />
      <input 
        type="text" 
        placeholder="Project Name" 
        value={projectName} 
        onChange={e => {
          setProjectName(e.target.value);
          setEmailError(null);
        }} 
        className={`border px-2 py-1 rounded w-full mb-2 ${emailError && !projectName ? 'border-red-500' : ''}`}
      />
      <textarea 
        placeholder="AI Notes" 
        value={notes} 
        onChange={e => setNotes(e.target.value)} 
        className="border px-2 py-1 rounded w-full mb-4" 
      />

      <button 
        onClick={handleSubmit} 
        disabled={loading || !files.length}
        className={`bg-blue-600 text-white px-4 py-2 rounded ${loading || !files.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        Submit
      </button>

      {mode === "estimate" && pdfBlob && (
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
              download={`${projectName}_Estimate.pdf`}
              className="bg-gray-200 text-blue-700 px-3 py-1 rounded"
            >
              📥 Download PDF
            </a>
            <button
              onClick={handleSendEmail}
              disabled={emailSending}
              className={`${
                emailSending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white px-3 py-1 rounded flex items-center gap-2`}
            >
              {emailSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid border-r-transparent"></div>
                  Sending...
                </>
              ) : (
                '✅ Confirm & Send to Client'
              )}
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

          {emailError && (
            <div className="mt-2 bg-red-50 text-red-800 p-3 rounded-md">
              ❌ {emailError}
            </div>
          )}
        </>
      )}

      {mode === "barlist" && renderBarlist()}
    </div>
  );
}