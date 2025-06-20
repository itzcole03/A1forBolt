import { useState, useEffect } from 'react';



type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode') as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      return 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      if (mode === 'system') return getSystemTheme();
      return mode as 'light' | 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (mode === 'system') {
      const updateSystemTheme = () => setResolvedTheme(getSystemTheme());
      updateSystemTheme();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemTheme);
      return () => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateSystemTheme);
      };
    } else {
      setResolvedTheme(mode as 'light' | 'dark');
    }
  }, [mode]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    localStorage.setItem('theme-mode', mode);
  }, [resolvedTheme, mode]);

  const setThemeMode = (newMode: ThemeMode) => setMode(newMode);

  return {
    mode, // 'light' | 'dark' | 'system'
    theme: resolvedTheme, // 'light' | 'dark'
    setThemeMode,
  };
}