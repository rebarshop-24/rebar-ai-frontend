import React, { useState } from 'react';

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

    setTimeout(() => {
      setDrawings([
        { MARK: 'A1', file: 'https://via.placeholder.com/400x300?text=MARK+A1' },
        { MARK: 'B2', file: 'https://via.placeholder.com/400x300?text=MARK+B2' },
        { MARK: 'C3', file: 'https://via.placeholder.com/400x300?text=MARK+C3' }
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rebar Drawing Generator (Mock Mode)</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input type="file" onChange={handleFileChange} />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Mock Drawings
        </button>
      </form>

      {loading && <p>Generating mock drawings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {drawings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drawings.map((item, idx) => (
            <div key={idx} className="p-4 border rounded shadow bg-white">
              <p className="font-semibold mb-2">MARK: {item.MARK}</p>
              <img src={item.file} alt={`Drawing ${item.MARK}`} className="w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}