import React, { useState, useEffect } from 'react';
import { UnifiedInput } from './base/UnifiedInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';
import {
  FaMoon,
  FaSun,
  FaBell,
  FaDatabase,
  FaKey,
  FaGlobe,
  FaDownload,
  FaTrash,
} from 'react-icons/fa';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    sportsRadar: 'zi7atwynSXOAyizHo1L3fR5Yv8mfBX12LccJbCHb',
    theOddsApi: '8684be37505fc5ce63b0337d472af0ee',
  });

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'live_updates',
      label: 'Live Updates',
      description: 'Receive notifications for odds changes and game updates',
      enabled: true,
    },
    {
      id: 'arbitrage',
      label: 'Arbitrage Alerts',
      description: 'Get notified when profitable arbitrage opportunities arise',
      enabled: true,
    },
    {
      id: 'high_confidence',
      label: 'High Confidence Picks',
      description: 'Notifications for picks with >90% confidence',
      enabled: true,
    },
  ]);

  useEffect(() => {
    // Check system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Apply theme
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleNotificationToggle = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, enabled: !notification.enabled } : notification
      )
    );
  };

  const handleApiKeyChange = (key: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    const data = {
      settings: {
        isDarkMode,
        isCompactView,
        notifications,
        apiKeys,
      },
      // Add other data to export
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'betpro-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
      >
        <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDarkMode ? (
                <FaMoon className="w-5 h-5 text-primary-500" />
              ) : (
                <FaSun className="w-5 h-5 text-primary-500" />
              )}
              <span>Dark Mode</span>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
              onClick={handleThemeToggle}
            >
              <span
                className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaGlobe className="w-5 h-5 text-primary-500" />
              <span>Compact View</span>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
              onClick={() => setIsCompactView(!isCompactView)}
            >
              <span
                className={`${isCompactView ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaBell className="w-5 h-5 mr-2 text-primary-500" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          {notifications.map(notification => (
            <div key={notification.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{notification.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.description}
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                onClick={() => handleNotificationToggle(notification.id)}
              >
                <span
                  className={`${notification.enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaKey className="w-5 h-5 mr-2 text-primary-500" />
          API Keys
        </h3>
        <div className="space-y-4">
          <UnifiedInput
            label="SportRadar API Key"
            placeholder="Enter API key"
            type="text"
            value={apiKeys.sportsRadar}
            onChange={e => handleApiKeyChange('sportsRadar', e.target.value)}
          />
          <UnifiedInput
            label="TheOdds API Key"
            placeholder="Enter API key"
            type="text"
            value={apiKeys.theOddsApi}
            onChange={e => handleApiKeyChange('theOddsApi', e.target.value)}
          />
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaDatabase className="w-5 h-5 mr-2 text-primary-500" />
          Data Management
        </h3>
        <div className="space-y-4">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            onClick={handleExportData}
          >
            <FaDownload className="w-4 h-4" />
            <span>Export Settings</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleClearData}
          >
            <FaTrash className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Settings);
