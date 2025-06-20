import BetSlipSidebar from '../components/modern/BetSlipSidebar'; // To be created
import React from 'react';
import Sidebar from '../components/modern/Sidebar'; // To be created
import { Outlet } from 'react-router-dom';

// import Navbar from '../components/navigation/Navbar'; // Optional: if you want a top navbar as well

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Optional: <Navbar /> */}
        <Outlet />
      </main>
      {/* Persistent BetSlip Sidebar (desktop), floating/modal on mobile */}
      <BetSlipSidebar />
    </div>
  );
};

export default MainLayout; 