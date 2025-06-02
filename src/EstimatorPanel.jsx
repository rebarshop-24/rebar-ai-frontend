import { useState } from "react";
import axios from "axios";

export default function EstimatorPanel() {
  const [status, setStatus] = useState(null);

  const handleCreateJob = async () => {
    const payload = {
      title: "Job from BossPanel",
      description: "Auto-generated via sync-job",
      customer: "Some Client",
    };
    try {
      const res = await axios.post("/api/sync-job", payload);
      setStatus(`✅ Job Created: ID ${res.data.job_id}`);
    } catch (err) {
      setStatus("❌ Failed to create job");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Estimator Panel</h2>
      <button onClick={handleCreateJob} className="bg-blue-600 text-white px-4 py-2 rounded">
        Create Job in Odoo
      </button>
      {status && <p className="mt-3">{status}</p>}
    </div>
  );
}
