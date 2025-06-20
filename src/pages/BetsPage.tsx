import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';
import EnhancedPropCard from '../components/ui/EnhancedPropCard';
import { UnifiedBettingInterface } from '../components/betting/UnifiedBettingInterface';
import { LiveOddsTicker } from '../components/betting/LiveOddsTicker';
import { RiskProfileSelector } from '../components/betting/RiskProfileSelector';
import { StakeSizingControl } from '../components/betting/StakeSizingControl';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ToastProvider } from '../components/common/ToastProvider';
import BetsTable from '../components/betting/BetsTable.tsx';
import BetSlip from '../components/betting/BetSlip.tsx';
import BetHistoryChart from '../components/betting/BetHistoryChart.tsx';
import { GlobalErrorBoundary } from '../components/common/ErrorBoundary.tsx';
import { LoadingSpinner } from '../components/shared/ui/LoadingSpinner.tsx';
import ToastContainer from '../components/shared/feedback/Toast.tsx';
// Alpha1 Advanced Widgets
import ConfidenceBands from '../components/ui/ConfidenceBands.tsx';
import RiskHeatMap from '../components/ui/RiskHeatMap.tsx';
import SourceHealthBar from '../components/ui/SourceHealthBar.tsx';
import WhatIfSimulator from '../components/advanced/WhatIfSimulator.tsx';
// Personalization overlay
import { userPersonalizationService } from '../services/analytics/userPersonalizationService.ts';
// TODO: Add tests for new widgets

const BetsPage: React.FC = () => {
  // Example state hooks for risk profile, stake, and event selection
  const [riskProfile, setRiskProfile] = React.useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [stake, setStake] = React.useState(100);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [events, setEvents] = React.useState<any[]>([]); // Replace with real events from API/service
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Placeholder: fetch events (replace with real fetch/service logic)
  React.useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents([]); // Replace with real event list
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-green-900/80 to-green-700/80 dark:from-gray-900 dark:to-gray-800 transition-colors">
          <GlassCard className="mb-8">
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">Betting Interface</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <RiskProfileSelector currentProfile={riskProfile} onProfileChange={setRiskProfile} />
                <StakeSizingControl onStakeChange={setStake} defaultStake={stake} />
                <LiveOddsTicker events={events} onEventSelect={setSelectedEvent} loading={loading} error={error ? { message: error } : null} />
              </div>
              <div className="space-y-4">
                <UnifiedBettingInterface initialBankroll={1000} onBetPlaced={() => {}} darkMode={true} />
                <GlassCard className="p-4">
                  <h3 className="font-semibold mb-2">Your Bet Slip</h3>
                  {/* Example: Render EnhancedPropCard for each bet in slip */}
                  {/* Replace with real bet slip data */}
                  <EnhancedPropCard
                    playerName="LeBron James"
                    team="LAL"
                    position="F"
                    statType="Points"
                    line={27.5}
                    overOdds={1.8}
                    underOdds={1.9}
                    pickType="normal"
                    trendValue={156}
                    gameInfo={{ opponent: 'BOS', day: 'Fri', time: '7:30pm' }}
                    playerImageUrl="https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png"
                    onSelect={() => {}}
                    onViewDetails={() => {}}
                  />
                  <GlowButton className="w-full mt-4">Place Bet</GlowButton>
                </GlassCard>
                <BetsTable />
                <BetHistoryChart />
              </div>
            </div>
          </GlassCard>
          {/* Advanced Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <ConfidenceBands lower={42} upper={68} mean={55} />
              <Tooltip content="Model confidence interval (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
            </GlassCard>
            <GlassCard>
              <RiskHeatMap riskScores={[0.2, 0.6, 0.7]} />
              <Tooltip content="Risk heat map (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
            </GlassCard>
            <GlassCard>
              <SourceHealthBar sources={[
                { name: 'Sportradar', healthy: true },
                { name: 'Weather', healthy: true },
                { name: 'Injury', healthy: false },
              ]} />
              <Tooltip content="Source health status (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
            </GlassCard>
            <GlassCard>
              <WhatIfSimulator />
              <Tooltip content="What-if scenario simulator (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
            </GlassCard>
          </div>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
};

export default BetsPage;
