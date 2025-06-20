import React from 'react';
import GlassCard from '../components/ui/GlassCard';

const LineupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <GlassCard className="max-w-4xl w-full p-10">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-6">Betting Lineups</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-2">Today's Top Picks</h2>
            {/* Add your lineup content here */}
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
};

export default LineupPage;
