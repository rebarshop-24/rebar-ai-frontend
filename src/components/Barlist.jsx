import React from 'react';

export default function Barlist({ data }) {
  if (!data) return null;

  // Extract barlist data from the API response
  const barlist = data.barlist || data.bars || [];
  
  if (barlist.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
        No barlist data available. Please ensure you've uploaded a valid drawing with rebar details.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Barlist Details</h3>
      <div className="bg-white shadow-sm rounded-lg overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bar Mark</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Length</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {barlist.map((bar, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bar.mark || bar.bar_mark || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bar.size || bar.bar_size || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bar.type || bar.bar_type || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bar.length || bar.bar_length || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bar.quantity || bar.count || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(bar.total_length || (bar.length && bar.quantity ? bar.length * bar.quantity : null) || '-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}