import { useState } from "react";
import axios from "axios";

export default function SupervisorPanel() {
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAlert = async () => {
    if (!alertMsg.trim()) {
      alert("Please enter an alert message");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/alert/log", {
        message: alertMsg,
        timestamp: new Date().toISOString(),
        severity: "high"
      });
      setAlertMsg("");
      alert("✅ Alert sent to Odoo successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send alert: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Supervisor Panel</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="alertMsg" className="block text-sm font-medium text-gray-700 mb-1">
              Alert Message
            </label>
            <textarea
              id="alertMsg"
              value={alertMsg}
              onChange={(e) => setAlertMsg(e.target.value)}
              placeholder="Type alert message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            />
          </div>
          
          <button 
            onClick={sendAlert}
            disabled={loading || !alertMsg.trim()}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading || !alertMsg.trim() ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Sending...' : 'Send Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}