import React from 'react';
import { useUnifiedAnalytics } from '../hooks/useUnifiedAnalytics';
import PerformanceMetrics from './PerformanceMetrics';
import { NoResultsFallback } from './NoResultsFallback';

const PerformanceAnalytics: React.FC = () => {
  const { performance } = useUnifiedAnalytics({ performance: true });

  if (!performance || performance.loading) {
    return <div className="text-center py-8">Loading performance metrics...</div>;
  }
  if (performance.error) {
    return <NoResultsFallback />;
  }
  if (!performance.performance.length) {
    return <NoResultsFallback />;
  }

  // Transform performance data to metrics for the UI
  const metrics = performance.performance.map(modelPerf => ({
    label: modelPerf.model,
    trend: 'neutral' as const, // TODO: Add trend logic
    value: modelPerf.metrics.f1,
    change: 0, // TODO: Add change logic
  }));

  return <PerformanceMetrics metrics={metrics} />;
};

export default React.memo(PerformanceAnalytics);
