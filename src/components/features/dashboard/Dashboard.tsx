import ESPNHeadlinesTicker from './ESPNHeadlinesTicker'; 
import EntryTracking from './EntryTracking'; 
import MLInsights from '../insights/MLInsights';
import MoneyMaker from './MoneyMaker';
import PerformanceChart from '../charts/PerformanceChart'; 
import PropCards from './PropCards'; 
import React, { useEffect } from 'react';
import UserStats from '../analytics/UserStats';
import { useAppStore } from '../../store/useAppStore';


const Dashboard: React.FC = () => {
  const {
    fetchProps,
    fetchEntries,
    fetchHeadlines,
    // fetchSentiments, // Removed as it was example, can be added if specific dashboard sentiment is needed
  } = useAppStore(state => ({ // Ensure to select from state for a smaller subscription scope
    fetchProps: state.fetchProps,
    fetchEntries: state.fetchEntries,
    fetchHeadlines: state.fetchHeadlines,
    // fetchSentiments: state.fetchSentiments,
  }));

  useEffect(() => {
    // Initial data fetching for the dashboard
    fetchProps(); 
    fetchEntries();
    fetchHeadlines();
    // fetchSentiments('general_market'); // Example for dashboard-specific sentiment if needed
  }, [fetchProps, fetchEntries, fetchHeadlines]);

  return (
    <div className="space-y-8">
      {/* Hero Card with Platform Stats */}
      <div className="w-full glass rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-primary-700/80 to-primary-500/80 flex flex-col md:flex-row items-center justify-between mb-6 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">AI Sports Analytics Platform</h1>
          <div className="text-lg text-primary-100/90 mb-4 font-medium">Real-time data • Advanced ML predictions • 84%+ win rates</div>
        </div>
        <div className="flex flex-row flex-wrap gap-6 items-center justify-end">
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-white">68.9%</span>
            <span className="text-xs text-primary-200/80">AI Accuracy</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-green-300">+$1.8K</span>
            <span className="text-xs text-primary-200/80">Monthly P&L</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-yellow-300">7</span>
            <span className="text-xs text-primary-200/80">Active Arbs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-200">41.3%</span>
            <span className="text-xs text-primary-200/80">Monthly ROI</span>
          </div>
        </div>
      </div>

      {/* Money Maker Callout */}
      <div className="w-full glass rounded-2xl shadow-xl p-6 bg-gradient-to-br from-green-700/80 to-green-500/80 mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-green-100 mb-2 flex items-center"><span className="mr-2">💰</span> Let's Get Money</h2>
        <div className="text-green-200 text-base font-medium mb-2">AI finds the highest-paying 84%+ win probability lineup</div>
        <MoneyMaker />
      </div>

      {/* Key Stats & Entry Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-text mb-3">Key Performance Indicators</h3>
            <UserStats />
          </div>
        </div>
        <EntryTracking />
      </div>

      {/* Prop Cards & Performance Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <PropCards />
        </div>
        <div className="p-6 glass rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-text mb-3">Performance Analytics</h3>
          <PerformanceChart />
        </div>
      </div>

      {/* ESPN Headlines & ML Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ESPNHeadlinesTicker />
        <div className="p-6 glass rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-text mb-3">AI/ML Insights</h3>
          <MLInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 