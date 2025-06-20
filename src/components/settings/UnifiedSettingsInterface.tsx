import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedSettingsService } from '../../services/unified/UnifiedSettingsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { Card, Button, Spinner, Input, Select, Toast, Modal } from '../ui/UnifiedUI';

interface SettingsSection {
  title: string;
  description: string;
  settings: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'color';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
  }[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Appearance',
    description: 'Customize the look and feel of the application',
    settings: [
      {
        key: 'theme',
        label: 'Theme',
        type: 'select',
        options: ['light', 'dark', 'system'],
      },
      {
        key: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'select',
        options: ['small', 'medium', 'large'],
      },
      {
        key: 'animations',
        label: 'Enable Animations',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Notifications',
    description: 'Configure how and when you receive notifications',
    settings: [
      {
        key: 'notifications.enabled',
        label: 'Enable Notifications',
        type: 'boolean',
      },
      {
        key: 'notifications.sound',
        label: 'Notification Sound',
        type: 'boolean',
      },
      {
        key: 'notifications.quietHours',
        label: 'Quiet Hours',
        type: 'select',
        options: ['off', 'custom', '10pm-7am', '11pm-8am'],
      },
    ],
  },
  {
    key: 'performance',
    title: 'Performance',
    description: 'Optimize application performance',
    settings: [
      {
        key: 'performance.cacheSize',
        label: 'Cache Size (MB)',
        type: 'number',
        min: 50,
        max: 1000,
        step: 50,
      },
      {
        key: 'performance.autoRefresh',
        label: 'Auto Refresh Interval (seconds)',
        type: 'number',
        min: 30,
        max: 300,
        step: 30,
      },
      {
        key: 'performance.lowBandwidth',
        label: 'Low Bandwidth Mode',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Betting',
    description: 'Configure betting preferences and limits',
    settings: [
      {
        key: 'betting.defaultStake',
        label: 'Default Stake',
        type: 'number',
        min: 1,
        max: 1000,
        step: 1,
      },
      {
        key: 'betting.maxStake',
        label: 'Maximum Stake',
        type: 'number',
        min: 1,
        max: 10000,
        step: 100,
      },
      {
        key: 'betting.autoConfirm',
        label: 'Auto Confirm Bets',
        type: 'boolean',
      },
      {
        key: 'betting.kellyFraction',
        label: 'Kelly Fraction',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
  },
];

export const UnifiedSettingsInterface: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const settingsService = serviceRegistry.getService<UnifiedSettingsService>('settings');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await settingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      handleError('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'SETTINGS_ERROR',
      source: 'UnifiedSettingsInterface',
      details: { message },
    });
  };

  const handleSettingChange = async (key: string, value: any) => {
    try {
      const newSettings = { ...settings };
      const keys = key.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      await settingsService.updateSettings(newSettings);
      setSettings(newSettings);
      setToast({
        message: 'Settings updated successfully',
        type: 'success',
      });
    } catch (error) {
      handleError('Failed to update settings', error);
    }
  };

  const handleReset = async () => {
    try {
      await settingsService.resetSettings();
      await loadSettings();
      setToast({
        message: 'Settings reset to defaults',
        type: 'success',
      });
      setShowResetModal(false);
    } catch (error) {
      handleError('Failed to reset settings', error);
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await settingsService.exportSettings();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'betting-app-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError('Failed to export settings', error);
    }
  };

  const handleImport = async () => {
    try {
      const importSettings = JSON.parse(importData);
      await settingsService.importSettings(importSettings);
      await loadSettings();
      setToast({
        message: 'Settings imported successfully',
        type: 'success',
      });
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      handleError('Failed to import settings', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadSettings}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <div className="flex space-x-4">
          <Button variant="primary" onClick={() => setShowResetModal(true)}>
            Reset to Defaults
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export Settings
          </Button>
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            Import Settings
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {SETTINGS_SECTIONS.map(section => (
          <Card key={section.title} title={section.title}>
            <p className="text-gray-600 mb-6">{section.description}</p>
            <div className="space-y-6">
              {section.settings.map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <label className="text-gray-700">{setting.label}</label>
                  <div className="w-64">
                    {setting.type === 'select' && (
                      <Select
                        options={setting.options || []}
                        value={settings[setting.key] || ''}
                        onChange={value => handleSettingChange(setting.key, value)}
                      />
                    )}
                    {setting.type === 'number' && (
                      <Input
                        max={setting.max}
                        min={setting.min}
                        step={setting.step}
                        type="number"
                        value={settings[setting.key] || ''}
                        onChange={e => handleSettingChange(setting.key, parseFloat(e.target.value))}
                      />
                    )}
                    {setting.type === 'boolean' && (
                      <input
                        checked={settings[setting.key] || false}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        type="checkbox"
                        onChange={e => handleSettingChange(setting.key, e.target.checked)}
                      />
                    )}
                    {setting.type === 'color' && (
                      <Input
                        type="color"
                        value={settings[setting.key] || '#000000'}
                        onChange={e => handleSettingChange(setting.key, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        title="Reset Settings"
        onClose={() => setShowResetModal(false)}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Are you sure you want to reset all settings to their default values? This action cannot
            be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Reset Settings
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Settings Modal */}
      <Modal
        isOpen={showImportModal}
        title="Import Settings"
        onClose={() => setShowImportModal(false)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">Paste your settings JSON below:</p>
          <textarea
            className="w-full h-48 p-2 border rounded"
            placeholder="Paste settings JSON here..."
            value={importData}
            onChange={e => setImportData(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
