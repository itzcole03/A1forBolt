import React from 'react';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ComputerIcon from '@mui/icons-material/Computer';
import { useThemeContext } from './ThemeProvider';

const modes = [
  { value: 'light', label: 'Light', icon: <Brightness7Icon fontSize="medium" aria-label="Light mode" /> },
  { value: 'dark', label: 'Dark', icon: <Brightness4Icon fontSize="medium" aria-label="Dark mode" /> },
  { value: 'system', label: 'System', icon: <ComputerIcon fontSize="medium" aria-label="System mode" /> },
] as const;

type Mode = typeof modes[number]['value'];

export default function ThemeToggle() {
  const { mode, setThemeMode } = useThemeContext();

  return (
    <div className="flex gap-2 items-center">
      {modes.map(({ value, icon, label }) => (
        <button
          key={value}
          className={`rounded-full p-1 border ${mode === value ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'} text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300`}
          type="button"
          aria-label={`Switch to ${label} mode`}
          onClick={() => setThemeMode(value as Mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
