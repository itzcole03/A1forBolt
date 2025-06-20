import { motion } from 'framer-motion';
import * as React from 'react';
import { useState } from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { PerformanceAnalyticsDashboard } from '../analytics/PerformanceAnalyticsDashboard';
import { MarketAnalysisDashboard } from '../MarketAnalysisDashboard';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { FeatureFlagIndicators } from '../ui/FeatureFlagIndicators';
import { ServiceStatusIndicators } from '../ui/ServiceStatusIndicators';
import { Skeleton } from '../ui/Skeleton';
import { Toast } from '../ui/UnifiedUI';
import { HeroSection } from './HeroSection';
import { LiveGamesDisplay } from './LiveGamesDisplay';
// ...existing code...
import { usePrizePicksLiveData } from '../../hooks/usePrizePicksLiveData';
import { ArbitrageOpportunities } from '../ArbitrageOpportunities';
import { PrizePicksEdgeDisplay } from '../betting/PrizePicksEdgeDisplay';
import MLFactorViz from '../MLFactorViz';
import { UnifiedMoneyMaker } from '../money-maker/UnifiedMoneyMaker';
import { QuantumPredictionsInterface } from '../prediction/QuantumPredictionsInterface';
import { RealTimePredictions } from './RealTimePredictions';
// ...existing code...
import { useStrategyEngineData } from '../../hooks/useStrategyEngineData';
import { SmartLineupBuilder } from '../lineup/SmartLineupBuilder';
import { UnifiedProfile } from '../profile/UnifiedProfile';
import { UnifiedSettingsInterface } from '../settings/UnifiedSettingsInterface';
import UnifiedStrategyEngineDisplay from '../strategy/UnifiedStrategyEngineDisplay';
import { BetSimulationTool } from '../ui/BetSimulationTool';

const SIDEBAR_TABS = [
  { key: 'overview', label: 'Overview', icon: React.createElement('span', { role: 'img', 'aria-label': 'overview', className: 'text-lg' }, '📊') },
  { key: 'analytics', label: 'Analytics', icon: React.createElement('span', { role: 'img', 'aria-label': 'analytics', className: 'text-lg' }, '📈') },
  { key: 'prizepicks', label: 'PrizePicks', icon: React.createElement('span', { role: 'img', 'aria-label': 'prizepicks', className: 'text-lg' }, '🎯') },
  { key: 'strategyEngine', label: 'Strategy Engine', icon: React.createElement('span', { role: 'img', 'aria-label': 'strategy', className: 'text-lg' }, '🧠') },
  { key: 'moneyMaker', label: 'Money Maker', icon: React.createElement('span', { role: 'img', 'aria-label': 'money', className: 'text-lg' }, '💰') },
  { key: 'arbitrage', label: 'Arbitrage', icon: React.createElement('span', { role: 'img', 'aria-label': 'arbitrage', className: 'text-lg' }, '🔀') },
  { key: 'ml', label: 'ML', icon: React.createElement('span', { role: 'img', 'aria-label': 'ml', className: 'text-lg' }, '🤖') },
  { key: 'quantum', label: 'Quantum', icon: React.createElement('span', { role: 'img', 'aria-label': 'quantum', className: 'text-lg' }, '🧬') },
  { key: 'simulator', label: 'Simulator', icon: React.createElement('span', { role: 'img', 'aria-label': 'simulator', className: 'text-lg' }, '🧪') },
  { key: 'lineup', label: 'Lineup', icon: React.createElement('span', { role: 'img', 'aria-label': 'lineup', className: 'text-lg' }, '📋') },
  { key: 'profile', label: 'Profile', icon: React.createElement('span', { role: 'img', 'aria-label': 'profile', className: 'text-lg' }, '👤') },
  { key: 'settings', label: 'Settings', icon: React.createElement('span', { role: 'img', 'aria-label': 'settings', className: 'text-lg' }, '⚙️') },
];

// Demo data for metrics and activity
const DEMO_METRICS = {
  winRate: 72.4,
  roi: 18.2,
  profitLoss: 1240.55,
};
const DEMO_ACTIVITY = [
  { id: '1', type: 'bet', description: 'Placed bet on Lakers', amount: 100, odds: 2.1, timestamp: Date.now(), status: 'success' },
  { id: '2', type: 'prediction', description: 'Predicted win for Warriors', amount: 50, odds: 1.8, timestamp: Date.now() - 3600000, status: 'pending' },
];

const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [recentActivity] = useState(DEMO_ACTIVITY);
  const [metrics] = useState(DEMO_METRICS);
  const winRate = useAnimatedValue(metrics.winRate, { duration: 1200 });
  const roi = useAnimatedValue(metrics.roi, { duration: 1200 });
  const profitLoss = useAnimatedValue(metrics.profitLoss, { duration: 1200 });
  // Dev/debug toggle for traceId, etc.
  const [showDebug] = useState(import.meta.env.MODE === 'development');
  const livePrizePicksData = usePrizePicksLiveData();
  const strategyRecommendations = useStrategyEngineData();

  // Sidebar navigation
  const Sidebar = () => (
    <aside className="h-full w-56 bg-gradient-to-b from-blue-700/80 to-purple-800/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 flex flex-col gap-4 text-white">
      <div className="mb-8 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <span role="img" aria-label="bolt" className="animate-pulse">⚡</span>
        A1Betting
      </div>
      {SIDEBAR_TABS.map(tab => (
        <button
          key={tab.key}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-lg ${activeTab === tab.key ? 'bg-white/20 shadow-lg ring-2 ring-yellow-400' : 'hover:bg-white/10'}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </aside>
  );

  // Main content area with animated transitions
  const tabContentVariants = {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.98 },
    transition: { duration: 0.25, ease: 'easeInOut' },
  };

  console.log("Rendering tab:", activeTab);
  return (
    <div className="flex-1 min-h-screen p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl shadow-2xl overflow-y-auto">
      <motion.div
        key={activeTab}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={tabContentVariants}
        transition={tabContentVariants.transition}
        className="space-y-8 min-h-[60vh]"
      >
        {activeTab === 'overview' && (
          <>
            <HeroSection
              connectedSources={50}
              totalSources={60}
              gamesCount={20}
              playersCount={100}
              dataQuality={85}
              dataReliability={90}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass bg-gradient-to-br from-blue-400/30 to-purple-400/20 border-0 shadow-xl">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">Win Rate</div>
                <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-300 animate-pulse">{winRate.value.toFixed(1)}%</div>
              </Card>
              <Card className="glass bg-gradient-to-br from-green-400/30 to-teal-400/20 border-0 shadow-xl">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">ROI</div>
                <div className="text-4xl font-extrabold text-green-600 dark:text-green-300 animate-pulse">{roi.value.toFixed(1)}%</div>
              </Card>
              <Card className="glass bg-gradient-to-br from-yellow-400/30 to-orange-400/20 border-0 shadow-xl">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">Profit/Loss</div>
                <div className={`text-4xl font-extrabold ${profitLoss.value >= 0 ? 'text-green-500' : 'text-red-500'} animate-pulse`}>{profitLoss.value.toFixed(2)}</div>
              </Card>
            </div>
            <LiveGamesDisplay games={[]} />
            <RealTimePredictions predictions={[]} loading={false} />
          </>
        )}
        {activeTab === 'analytics' && (
          <>
            <PerformanceAnalyticsDashboard />
            <MarketAnalysisDashboard />
          </>
        )}
        {activeTab === 'prizepicks' && (
          <>
            {console.log("Rendering component: PrizePicksEdgeDisplay")}
            {livePrizePicksData.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} height={180} className="w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {livePrizePicksData.map((pick, idx) => (
                  <PrizePicksEdgeDisplay key={pick.id || idx} {...pick} showDebug={showDebug} />
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'strategyEngine' && (
          <>
            {console.log("Rendering component: UnifiedStrategyEngineDisplay")}
            <UnifiedStrategyEngineDisplay recommendations={strategyRecommendations} showDebug={showDebug} />
          </>
        )}
        {activeTab === 'moneyMaker' && (
          <>
            {console.log("Rendering component: UnifiedMoneyMaker")}
            <UnifiedMoneyMaker />
          </>
        )}
        {activeTab === 'arbitrage' && (
          <ArbitrageOpportunities />
        )}
        {activeTab === 'ml' && (
          <>
            {console.log("Rendering component: MLFactorViz")}
            <MLFactorViz playerId={null} metric={null} />
          </>
        )}
        {activeTab === 'quantum' && (
          <QuantumPredictionsInterface />
        )}
        {activeTab === 'simulator' && (
          <BetSimulationTool />
        )}
        {activeTab === 'lineup' && (
          <SmartLineupBuilder />
        )}
        {activeTab === 'profile' && (
          <UnifiedProfile />
        )}
        {activeTab === 'settings' && (
          <UnifiedSettingsInterface />
        )}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass bg-white/70 dark:bg-gray-900/70 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-gray-400">No recent activity.</div>
              ) : recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center">
                    {typeof activity.amount === 'number' && (
                      <span className="font-medium">{activity.amount.toFixed(2)}</span>
                    )}
                    {typeof activity.odds === 'number' && (
                      <span className="text-gray-600">@{activity.odds.toFixed(2)}</span>
                    )}
                    <span className="ml-2 text-gray-500 text-xs">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        activity.status === 'success'
                          ? 'success'
                          : activity.status === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="glass bg-white/70 dark:bg-gray-900/70 shadow-lg">
            <ServiceStatusIndicators />
            <FeatureFlagIndicators />
          </Card>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </motion.div>
    </div>
  );

};

export default UnifiedDashboard;
