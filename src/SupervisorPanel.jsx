import { useState } from "react";
import axios from "axios";

export default function SupervisorPanel() {
  const [alertMsg, setAlertMsg] = useState("");

  const sendAlert = async () => {
    await axios.post("/api/log-alert", {
      message: alertMsg || "Manual alert from Supervisor",
    });
    setAlertMsg("");
    alert("✅ Alert sent to Odoo");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supervisor Panel</h2>
      <input
        value={alertMsg}
        onChange={(e) => setAlertMsg(e.target.value)}
        placeholder="Type alert..."
        className="border px-2 py-1 mr-2"
      />
      <button onClick={sendAlert} className="bg-red-600 text-white px-4 py-2 rounded">
        Send Alert
      </button>
    </div>
  );
}
