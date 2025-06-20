import React from 'react';
import Settings from '../components/modern/Settings';


const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-semibold text-text mb-6">Settings</h1>
      <Settings />
    </div>
  );
};

export default SettingsPage; 