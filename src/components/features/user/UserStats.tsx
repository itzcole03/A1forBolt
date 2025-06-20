import React from 'react';
import { calculateUserStats } from '../../utils/analyticsHelpers'; 
import { useAppStore } from '../../store/useAppStore';


const UserStats: React.FC = () => {
  const { entries, user } = useAppStore(state => ({ 
    entries: state.entries,
    user: state.user,
  }));

  const stats = calculateUserStats(entries, user?.id);
  // Placeholder data removed
  // const stats = {
  //   totalBets: entries.length || 0,
  //   winRate: 0,
  //   totalProfitLoss: 0,
  //   roi: 0,
  // };

  if (!user) {
    return <p className="text-text-muted">Please log in to see your stats.</p>;
  }
  
  if (!Array.isArray(entries) || entries.length === 0) {
    return <p className="text-text-muted">No betting history to calculate stats.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="p-4 glass rounded-2xl bg-gradient-to-br from-blue-100/60 to-blue-300/30 shadow-md animate-fade-in">
        <p className="text-xs text-blue-700 font-semibold mb-1">Total Bets</p>
        <p className="text-2xl font-extrabold text-blue-900">{stats.totalBets}</p>
      </div>
      <div className="p-4 glass rounded-2xl bg-gradient-to-br from-green-100/60 to-green-300/30 shadow-md animate-fade-in">
        <p className="text-xs text-green-700 font-semibold mb-1">Win Rate</p>
        <p className="text-2xl font-extrabold text-green-700">{stats.winRate.toFixed(1)}%</p>
      </div>
      <div className="p-4 glass rounded-2xl bg-gradient-to-br from-yellow-100/60 to-yellow-300/30 shadow-md animate-fade-in">
        <p className="text-xs text-yellow-700 font-semibold mb-1">Profit/Loss</p>
        <p className={`text-2xl font-extrabold ${stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>${stats.totalProfitLoss.toFixed(2)}</p>
      </div>
      <div className="p-4 glass rounded-2xl bg-gradient-to-br from-purple-100/60 to-purple-300/30 shadow-md animate-fade-in">
        <p className="text-xs text-purple-700 font-semibold mb-1">ROI</p>
        <p className="text-2xl font-extrabold text-purple-700">{stats.roi.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default UserStats; 