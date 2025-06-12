import React from 'react';

export default function EstimatePreview({ pdfBlob, onSendEmail, onUploadDrive, loading, folderId, setFolderId }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!pdfBlob) {
      setPdfUrl(null);
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfBlob]);

  if (!pdfBlob) return null;

  return (
    <>
      <h3 className="text-lg font-semibold mt-4">📄 Estimate Preview</h3>
      <iframe
        title="Estimate Preview"
        src={pdfUrl}
        width="100%"
        height="600px"
        className="border rounded my-2"
      />

      <div className="flex gap-2 mt-2 flex-wrap">
        <a
          href={pdfUrl}
          download="Estimate_Report_Export.pdf"
          className="bg-gray-200 text-blue-700 px-3 py-1 rounded"
        >
          📥 Download PDF
        </a>
        <button
          onClick={onSendEmail}
          disabled={loading}
          className={`bg-green-600 text-white px-3 py-1 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
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
            onClick={onUploadDrive}
            disabled={loading}
            className={`bg-gray-700 text-white px-3 py-1 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            Upload to Google Drive
          </button>
        </div>
      </div>
    </>
  );
}
