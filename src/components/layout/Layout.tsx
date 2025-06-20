import React, { ReactNode, useState } from 'react';
import { EliteSportsHeader } from './EliteSportsHeader';
import { AdvancedSidebar } from './AdvancedSidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // TODO: Replace with real data/context hooks
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isSidebarOpen] = useState(true); // Sidebar always open for desktop
  // Mocked data for demo; replace with real hooks/context
  const connectedSources = 3;
  const dataQuality = 0.92;
  const state = { darkMode: false };
  const toggleDarkMode = () => {};
  const refreshData = async () => {};
  const loading = false;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Sidebar */}
      <div className="hidden md:block">
        <AdvancedSidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          connectedSources={connectedSources}
          dataQuality={dataQuality}
          state={state}
        />
      </div>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <EliteSportsHeader
          connectedSources={connectedSources}
          dataQuality={dataQuality}
          state={state}
          toggleDarkMode={toggleDarkMode}
          refreshData={refreshData}
          loading={loading}
        />
        {/* Main content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 shadow-xl p-6 md:p-10 min-h-[70vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
