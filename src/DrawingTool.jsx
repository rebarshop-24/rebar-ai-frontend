import React, { useState } from 'react';
import axios from 'axios';

export default function DrawingTool() {
  const [file, setFile] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(null);

    const formData = new FormData();
    formData.append("file_path", file);
    formData.append("mode", "drawing");

    try {
      const response = await axios.post("/api/parse-blueprints", formData);
      setDrawings(response.data);
    } catch {
      setError("Failed to generate drawings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Drawing Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input type="file" onChange={handleFileChange} />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Generate Drawings
        </button>
      </form>

      {loading && <p>Generating drawings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {drawings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drawings.map((item, idx) => (
            <div key={idx} className="p-4 border rounded shadow bg-white">
              <p className="font-semibold mb-2">MARK: {item.MARK}</p>
              {item.file ? (
                <img src={`/${item.file}`} alt={`Drawing ${item.MARK}`} className="w-full" />
              ) : (
                <p className="text-red-500">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}