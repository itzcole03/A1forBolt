import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sound: false,
    },
    display: {
      darkMode: true,
      compactView: false,
    },
    betting: {
      defaultStake: 10,
      maxStake: 100,
      currency: 'USD',
    },
    privacy: {
      sharePredictions: false,
      showStats: true,
    },
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleNotificationChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting as keyof typeof prev.notifications],
      },
    }));
  };
  const handleDisplayChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [setting]: !prev.display[setting as keyof typeof prev.display],
      },
    }));
  };
  const handleBettingChange = (setting: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      betting: {
        ...prev.betting,
        [setting]: value,
      },
    }));
  };
  const handlePrivacyChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting as keyof typeof prev.privacy],
      },
    }));
  };
  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success',
    });
  };
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <GlassCard className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Notifications</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.email} onChange={() => handleNotificationChange('email')} />
                Email Notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.push} onChange={() => handleNotificationChange('push')} />
                Push Notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications.sound} onChange={() => handleNotificationChange('sound')} />
                Sound Notifications
              </label>
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Display</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.display.darkMode} onChange={() => handleDisplayChange('darkMode')} />
                Dark Mode
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.display.compactView} onChange={() => handleDisplayChange('compactView')} />
                Compact View
              </label>
            </div>
          </GlassCard>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Betting Preferences</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1">Default Stake</label>
                <input
                  className="modern-input w-full"
                  type="number"
                  value={settings.betting.defaultStake}
                  onChange={e => handleBettingChange('defaultStake', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Maximum Stake</label>
                <input
                  className="modern-input w-full"
                  type="number"
                  value={settings.betting.maxStake}
                  onChange={e => handleBettingChange('maxStake', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Currency</label>
                <select
                  className="modern-input w-full"
                  value={settings.betting.currency}
                  onChange={e => handleBettingChange('currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Privacy</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.privacy.sharePredictions} onChange={() => handlePrivacyChange('sharePredictions')} />
                Share Predictions
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.privacy.showStats} onChange={() => handlePrivacyChange('showStats')} />
                Show Statistics
              </label>
            </div>
          </GlassCard>
        </div>
        <div className="flex justify-end">
          <GlowButton onClick={handleSave}>Save Settings</GlowButton>
        </div>
        {snackbar.open && (
          <div className={`mt-4 p-3 rounded-lg ${snackbar.severity === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{snackbar.message}</div>
        )}
      </GlassCard>
    </div>
  );
};

export default Settings;
