import ESPNHeadlinesTicker from './ESPNHeadlinesTicker';
import React, { useMemo } from 'react';
import useStore from '@/store/useStore';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

// TODO: Integrate real trending games from state or API
interface TrendingGame {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string | number;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { darkMode, toggleDarkMode } = useStore();

  // Placeholder trending games
  const trendingGames: TrendingGame[] = useMemo(() => [], []); // TODO: Replace with real data

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>

          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-sm font-medium">Quick Actions:</span>
            <button className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30">
              New Entry
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleDarkMode}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white">
                U
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium">User</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
