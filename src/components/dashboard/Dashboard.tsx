import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { predictionService } from '../../services/predictionService';
import useStore from '../../store/useStore';
import { UnifiedStrategyConfig } from '../strategy/UnifiedStrategyConfig';
import EnhancedPropCard from '../ui/EnhancedPropCard';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import { NotificationCenter } from '../ui/NotificationCenter';
import Tooltip from '../ui/Tooltip';

const Dashboard: React.FC = () => {
  const { darkMode } = useStore();

  // Fetch recent predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => predictionService.getRecentPredictions(),
    staleTime: 30000,
  });

  // Fetch engine metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => predictionService.getEngineMetrics(),
    staleTime: 30000,
  });

  // Performance chart data
  const chartData = {
    labels: predictions?.map(p => new Date(p.timestamp).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'Prediction Accuracy',
        data: predictions?.map(p => p.prediction) || [],
        borderColor: '#5D5CDE',
        backgroundColor: 'rgba(93, 92, 222, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Confidence',
        data: predictions?.map(p => p.confidence) || [],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Notification Center */}
      <div className="flex justify-end mb-2">
        <NotificationCenter />
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <Tooltip content="Total number of predictions made by the engine.">
              <span className="text-sm text-gray-500 cursor-help">Total Predictions</span>
            </Tooltip>
            <span className="text-3xl font-bold text-primary-500">
              {metricsLoading ? '...' : metrics?.total_predictions || 0}
            </span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <Tooltip content="Average accuracy of all predictions.">
              <span className="text-sm text-gray-500 cursor-help">Avg Accuracy</span>
            </Tooltip>
            <span className="text-3xl font-bold text-primary-500">
              {metricsLoading ? '...' : metrics?.average_accuracy ? `${(metrics.average_accuracy * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <Tooltip content="Success rate of predictions (win %).">
              <span className="text-sm text-gray-500 cursor-help">Success Rate</span>
            </Tooltip>
            <span className="text-3xl font-bold text-primary-500">
              {metricsLoading ? '...' : metrics?.success_rate ? `${(metrics.success_rate * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <Tooltip content="Return on investment from all predictions.">
              <span className="text-sm text-gray-500 cursor-help">ROI</span>
            </Tooltip>
            <span className="text-3xl font-bold text-primary-500">
              {metricsLoading ? '...' : metrics?.roi ? `${metrics.roi.toFixed(2)}%` : '0%'}
            </span>
          </div>
        </GlassCard>
      </div>
      {/* Performance Chart */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <Tooltip content="Refresh chart data">
            <GlowButton onClick={() => window.location.reload()}>
              Refresh
            </GlowButton>
          </Tooltip>
        </div>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </GlassCard>
      {/* Recent Predictions */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Recent Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {predictionsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            ))
            : predictions?.slice(0, 6).map(prediction => (
              <EnhancedPropCard
                key={prediction.id}
                playerName={prediction.playerName}
                statType={prediction.statType}
                line={prediction.line}
                overOdds={prediction.overOdds}
                underOdds={prediction.underOdds}
                sentiment={prediction.sentiment}
                aiBoost={prediction.aiBoost}
                patternStrength={prediction.patternStrength}
                bonusPercent={prediction.bonusPercent}
                enhancementPercent={prediction.enhancementPercent}
                onSelect={() => { }}
                onViewDetails={() => { }}
              />
            ))}
        </div>
      </GlassCard>
      {/* Strategy Compositor */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Strategy Compositor</h2>
        <UnifiedStrategyConfig />
      </GlassCard>
    </div>
  );
};

// DEPRECATED: Use UnifiedDashboard.tsx instead. This file is no longer used.
const Dashboard = () => null;
export default Dashboard;
