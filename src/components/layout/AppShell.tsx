import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'fas fa-chart-line' },
  { path: '/money-maker', label: 'Money Maker', icon: 'fas fa-bolt' },
  { path: '/props', label: 'Props', icon: 'fas fa-trophy' },
  { path: '/entries', label: 'Entries', icon: 'fas fa-list' },
  { path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
  { path: '/arbitrage', label: 'Arbitrage', icon: 'fas fa-exchange-alt' },
  { path: '/bankroll', label: 'Bankroll', icon: 'fas fa-wallet' },
  { path: '/risk', label: 'Risk', icon: 'fas fa-shield-alt' },
  { path: '/settings', label: 'Settings', icon: 'fas fa-cog' },
  { path: '/admin', label: 'Admin', icon: 'fas fa-user-shield' },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useStore();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30"
        initial={{ width: 280 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4">
            <Link className="flex items-center space-x-2" to="/">
              <img alt="Logo" className="w-8 h-8" src="/logo.png" />
              {sidebarOpen && (
                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  Elite Sports
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleSidebar}
            >
              <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isActive ? 'bg-primary-50 dark:bg-primary-900' : ''
                  }`}
                  to={item.path}
                >
                  <i className={`${item.icon} w-6`} />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleDarkModeToggle}
            >
              <i className={`fas fa-${darkMode ? 'sun' : 'moon'} w-6`} />
              {sidebarOpen && <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-280' : 'ml-80'}`}>
        <main className="h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default React.memo(AppShell);
