import React from 'react';
import { Link } from 'react-router-dom';

const ToggleSidebar = ({ isOpen, onToggle }) => (
  <div className={isOpen ? "w-64 bg-gray-800 text-white min-h-screen" : "w-16 bg-gray-800 text-white min-h-screen"}>
    <button onClick={onToggle} className="p-2 hover:bg-gray-700 w-full text-left text-lg">
      {isOpen ? "⏴" : "☰"}
    </button>
    {isOpen && (
      <ul className="mt-4 space-y-2 pl-4">
        <li><Link to="/">🏠 Home</Link></li>
        <li><Link to="/lineup">🏆 Lineup</Link></li>
        <li><Link to="/analytics">📊 Analytics</Link></li>
        <li><Link to="/settings">⚙️ Settings</Link></li>
      </ul>
    )}
  </div>
);

export default ToggleSidebar;