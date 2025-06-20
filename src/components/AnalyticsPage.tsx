import React from 'react';
import { AdvancedAnalytics } from './analytics/AdvancedAnalytics';

const AnalyticsPage: React.FC = () => {
  return (
    <main className="section space-y-6 lg:space-y-8 animate-fade-in">
      <section className="glass-card rounded-2xl shadow-xl p-6 mb-8 animate-fade-in animate-scale-in">
        <h2 className="text-2xl font-bold text-blue-100 mb-4">Advanced Analytics</h2>
        <AdvancedAnalytics />
      </section>
      <div className="modern-card p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">📊 Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <div className="modern-card p-6">
            <h3 className="text-lg font-bold mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Win Rate</span>
                <span className="font-bold text-green-600">65.2%</span>
              </div>
              <div className="flex justify-between">
                <span>ROI</span>
                <span className="font-bold text-green-600">+23.4%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Bets</span>
                <span className="font-bold">342</span>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="modern-card p-6">
            <h3 className="text-lg font-bold mb-4">Recent Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Last 7 Days</span>
                <span className="font-bold text-green-600">+12.3%</span>
              </div>
              <div className="flex justify-between">
                <span>Last 30 Days</span>
                <span className="font-bold text-green-600">+18.7%</span>
              </div>
              <div className="flex justify-between">
                <span>Last 90 Days</span>
                <span className="font-bold text-green-600">+23.4%</span>
              </div>
            </div>
          </div>

          {/* Strategy Performance */}
          <div className="modern-card p-6">
            <h3 className="text-lg font-bold mb-4">Strategy Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Value Bets</span>
                <span className="font-bold text-green-600">+15.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Arbitrage</span>
                <span className="font-bold text-green-600">+8.7%</span>
              </div>
              <div className="flex justify-between">
                <span>Trend Following</span>
                <span className="font-bold text-red-600">-2.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="modern-card p-6">
            <h3 className="text-lg font-bold mb-4">Win Rate Over Time</h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              Chart Placeholder
            </div>
          </div>
          <div className="modern-card p-6">
            <h3 className="text-lg font-bold mb-4">ROI by Sport</h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              Chart Placeholder
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Bets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg. Odds
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">NBA</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">68.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">+25.4%</td>
                  <td className="px-6 py-4 whitespace-nowrap">156</td>
                  <td className="px-6 py-4 whitespace-nowrap">1.92</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">NFL</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">62.5%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">+18.7%</td>
                  <td className="px-6 py-4 whitespace-nowrap">98</td>
                  <td className="px-6 py-4 whitespace-nowrap">1.88</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">MLB</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">48.3%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">-5.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap">88</td>
                  <td className="px-6 py-4 whitespace-nowrap">2.05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default React.memo(AnalyticsPage);
