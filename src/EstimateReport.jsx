import React from 'react';
import { generateEstimateReport } from './generatePDF';

export default function EstimateReport({ data }) {
  const handleGeneratePDF = () => {
    const doc = generateEstimateReport(data);
    doc.save('estimate-report.pdf');
  };

  return (
    <div className="p-4">
      <button 
        onClick={handleGeneratePDF}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate PDF Report
      </button>
    </div>
  );
}