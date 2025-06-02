import { useState } from "react";
import axios from "axios";

export default function EstimatorPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateJob = async () => {
    setLoading(true);
    try {
      const payload = {
        title: "Job from BossPanel",
        description: "Auto-generated via sync-job",
        customer: "Some Client",
        status: "draft",
        created_at: new Date().toISOString()
      };
      
      const res = await axios.post("/api/sync-job", payload);
      setStatus(`✅ Job Created: ID ${res.data.job_id}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to create job: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Estimator Panel</h2>
        
        <button 
          onClick={handleCreateJob}
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Creating...' : 'Create Job in Odoo'}
        </button>
        
        {status && (
          <div className={`mt-4 p-3 rounded-md ${status.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}