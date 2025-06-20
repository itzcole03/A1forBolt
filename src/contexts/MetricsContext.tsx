import React, { createContext } from 'react';
import { UnifiedMetrics } from '../unified/metrics/types';

export const MetricsContext = createContext<UnifiedMetrics | null>(null);

interface MetricsProviderProps {
  metrics: UnifiedMetrics;
  children: React.ReactNode;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ metrics, children }) => {
  return <MetricsContext.Provider value={metrics}>{children}</MetricsContext.Provider>;
};
