import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DrawingTool from './DrawingTool';
import SupervisorPanel from './SupervisorPanel';
import EstimatorPanel from './EstimatorPanel';

function App() {
  const [role, setRole] = useState('Estimator');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">BossPanel</h1>
          <div className="flex items-center space-x-2">
            <label htmlFor="roleSelect" className="font-medium">Role:</label>
            <select
              id="roleSelect"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Estimator">Estimator</option>
              <option value="Inventory">Inventory</option>
              <option value="SprayTech">SprayTech</option>
              <option value="Driver">Driver</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-gray-50">
        {role === 'Estimator' && <DrawingTool />}
        {role === 'Supervisor' && <SupervisorPanel />}
        {['Inventory', 'SprayTech', 'Driver'].includes(role) && (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">{role} Panel</h2>
            <p>Coming soon in Phase 2</p>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);