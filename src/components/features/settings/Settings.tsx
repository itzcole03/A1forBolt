import React, { useEffect, useState } from 'react';
import { Sun, Moon, ToggleLeft, ToggleRight, Loader2, AlertTriangle } from 'lucide-react';
import { UnifiedApplicationConfig } from '../../core/UnifiedConfig';
import { configService } from '../../services/configService';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../providers/ThemeProvider';


const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { addToast } = useAppStore();
  const [appConfig, setAppConfig] = useState<UnifiedApplicationConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoadingConfig(true);
      setConfigError(null);
      try {
        const config = await configService.fetchAppConfig();
        setAppConfig(config);
      } catch (error: any) {
        setConfigError(error.message || 'Failed to load application configuration.');
        addToast({ message: 'Error loading app configuration.', type: 'error' });
      } finally {
        setIsLoadingConfig(false);
      }
    };
    loadConfig();
  }, [addToast]);

  const handleFeatureToggle = (featureName: string) => {
    // In a real app, this would likely call a service to update user preferences or admin settings.
    // For now, this is a visual toggle only, actual feature flag state comes from config.
    addToast({ message: `Feature "${featureName}" toggle clicked. (This is a visual demo - persistence not implemented here)`, type: 'info' });
    // To make it truly dynamic IF the backend supports on-the-fly updates & UnifiedConfig could be refreshed:
    // 1. Call a service: await userService.updateFeatureFlag(featureName, !appConfig?.featureFlags[featureName]);
    // 2. Refresh config: const newConfig = await configService.fetchAppConfig(true); // force refresh
    // 3. setAppConfig(newConfig);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent drop-shadow-lg mb-6">⚙️ Appearance Settings</h3>
        <div className="p-8 glass modern-card rounded-2xl shadow-2xl bg-gradient-to-br from-primary-700/80 to-primary-500/60">
          <div className="flex items-center justify-between">
            <span className="text-lg text-primary-100 font-semibold">Theme</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl text-xl font-bold ${theme === 'light' ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/10 text-primary-200'}`}
                aria-label="Light theme"
              >
                <Sun size={24} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl text-xl font-bold ${theme === 'dark' ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/10 text-primary-200'}`}
                aria-label="Dark theme"
              >
                <Moon size={24} />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl text-xl font-bold ${theme === 'system' ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/10 text-primary-200'}`}
                aria-label="System theme"
              >
                System
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent drop-shadow-lg mb-6">🧪 Feature Flags</h3>
        <div className="p-8 glass modern-card rounded-2xl shadow-2xl bg-gradient-to-br from-primary-700/80 to-primary-500/60">
          {isLoadingConfig && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-7 h-7 animate-spin text-primary mr-3" />
              <span className="text-primary-100 font-semibold">Loading feature flags...</span>
            </div>
          )}
          {configError && (
            <div className="flex items-center text-red-400 bg-red-500/10 p-4 rounded-xl">
              <AlertTriangle size={24} className="mr-3" /> {configError}
            </div>
          )}
          {!isLoadingConfig && !configError && appConfig?.featureFlags && Object.keys(appConfig.featureFlags || {}).length > 0 ? (
            <ul className="space-y-4">
              {Object.entries(appConfig.featureFlags || {}).map(([flagName, isEnabled]) => (
                <li key={flagName} className="flex items-center justify-between">
                  <span className="text-lg text-primary-100 font-semibold capitalize">{flagName.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button onClick={() => handleFeatureToggle(flagName)} aria-label={`Toggle ${flagName}`} className="focus:outline-none">
                    {isEnabled ? (
                      <ToggleRight size={36} className="text-green-400 drop-shadow-lg" />
                    ) : (
                      <ToggleLeft size={36} className="text-gray-400" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !isLoadingConfig && !configError && <p className="text-primary-200">No feature flags configured or available.</p>
          )}
        </div>
      </div>
      {/* Add more settings sections as needed: Notifications, Account, Data Sources etc. */}
    </div>
  );
};

export default Settings; 