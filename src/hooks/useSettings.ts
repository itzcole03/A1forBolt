import { useState, useEffect } from 'react';

interface Settings {
  darkMode: boolean;
  useMocks: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}

const defaultSettings: Settings = {
  darkMode: false,
  useMocks: false,
  logLevel: 'info',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
};
