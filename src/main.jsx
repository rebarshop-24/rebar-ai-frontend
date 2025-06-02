import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DrawingTool from './DrawingTool';
import SupervisorPanel from './SupervisorPanel';

function App() {
  const [role, setRole] = useState('Estimator');  // default role is Estimator

  return (
    <div className="flex flex-col min-h-screen">
      {/* Role selection dropdown */}
      <div className="bg-gray-100 p-4">
        <label htmlFor="roleSelect" className="mr-2 font-medium">Role:</label>
        <select
          id="roleSelect"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="Estimator">Estimator</option>
          <option value="Supervisor">Supervisor</option>
        </select>
      </div>

      {/* Conditional rendering of panels based on selected role */}
      <div className="flex-grow">
        {role === 'Supervisor' ? <SupervisorPanel /> : <DrawingTool />}
      </div>
    </div>
  );
}

// Render the App component into the root element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
