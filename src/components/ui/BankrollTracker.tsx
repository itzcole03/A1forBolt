// BankrollTracker.tsx
// Visualizes the user's current bankroll, profit/loss, and stats

import React from 'react';
import { useBankrollStore } from '../../store/slices/bankrollSlice';

export const BankrollTracker: React.FC = () => {
  const stats = useBankrollStore((s) => s.stats);
  const refreshStats = useBankrollStore((s) => s.refreshStats);

  React.useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <section className="w-full p-4 bg-white shadow rounded mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-2">Bankroll Tracker</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>Current Balance: <b>${stats.currentBalance.toFixed(2)}</b></div>
          <div>Net Profit: <b className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>${stats.netProfit.toFixed(2)}</b></div>
          <div>ROI: <b>{(stats.roi * 100).toFixed(2)}%</b></div>
          <div>Win Rate: <b>{(stats.winRate * 100).toFixed(1)}%</b></div>
          <div>Largest Win: <b>${stats.largestWin.toFixed(2)}</b></div>
          <div>Largest Loss: <b>${stats.largestLoss.toFixed(2)}</b></div>
        </div>
      </div>
    </section>
  );
};
