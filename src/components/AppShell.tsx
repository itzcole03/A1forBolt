import Header from './Header';
import React from 'react';
import Sidebar from './Sidebar';
import useStore from '../../store/useStore';
import { Outlet, useLocation } from 'react-router-dom';

const AppShell: React.FC = () => {
  const location = useLocation();
  const darkMode = useStore(state => state.darkMode);
  const sidebarOpen = useStore(state => state.sidebarOpen);
  const toggleSidebar = useStore(state => state.toggleSidebar);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          currentPath={location.pathname}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          {/* Header */}
          <Header isSidebarOpen={sidebarOpen} onToggleSidebar={() => toggleSidebar()} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} BetPro AI. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  href="/terms"
                >
                  Terms
                </a>
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  href="/privacy"
                >
                  Privacy
                </a>
                <a
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  href="/support"
                >
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AppShell);
