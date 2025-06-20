import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="rounded-full bg-white dark:bg-gray-800 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      type="button"
      onClick={toggleTheme}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'dark' ? (
        <SunIcon aria-hidden="true" className="h-6 w-6" />
      ) : (
        <MoonIcon aria-hidden="true" className="h-6 w-6" />
      )}
    </button>
  );
}
