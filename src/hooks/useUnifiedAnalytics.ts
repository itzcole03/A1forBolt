import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UnifiedServiceRegistry } from '../services/unified/UnifiedServiceRegistry';
import { UnifiedAnalyticsService } from '../services/unified/UnifiedAnalyticsService';
import { webSocketManager } from '../services/unified/WebSocketManager';
import { UnifiedErrorService } from '../services/unified/UnifiedErrorService';

// Types
export interface AnalyticsConfig {
  ml?: {
    autoUpdate?: boolean;
    updateInterval?: number;
  };
  performance?: boolean;
  drift?: boolean;
  betting?: boolean;
  realtime?: boolean;
}

// Stronger typing for MLAnalyticsResult
export interface MLAnalyticsResult {
  predictions: number[];
  probabilities: number[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  insights: {
    featureImportance: Record<string, number>;
    shap: Record<string, number[]>;
    lime: Record<string, number>;
  };
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  mae: number;
  rmse: number;
}

export interface ModelPerformance {
  model: string;
  metrics: PerformanceMetrics;
  timestamp: string;
}

export interface DriftPoint {
  timestamp: string;
  value: number;
  threshold: number;
  is_drift: boolean;
  feature?: string;
}

export interface BettingAnalytics {
  roi: number;
  winRate: number;
  profitLoss: number;
  riskMetrics: {
    var: number;
    sharpe: number;
    sortino: number;
  };
  confidence: number;
}

export interface RealtimeMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface AnalyticsError {
  message: string;
  code?: string;
  context?: string;
}

export interface AnalyticsState {
  ml: {
    data: MLAnalyticsResult | null;
    loading: boolean;
    error: string | null;
  };
  performance: {
    data: ModelPerformance[] | null;
    loading: boolean;
    error: string | null;
  };
  drift: {
    data: DriftPoint[] | null;
    loading: boolean;
    error: string | null;
  };
  betting: {
    data: BettingAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  realtime: {
    data: RealtimeMetrics | null;
    loading: boolean;
    error: string | null;
  };
}

export const useUnifiedAnalytics = (config: AnalyticsConfig = {}) => {
  const [state, setState] = useState<AnalyticsState>({
    ml: { data: null, loading: false, error: null },
    performance: { data: null, loading: false, error: null },
    drift: { data: null, loading: false, error: null },
    betting: { data: null, loading: false, error: null },
    realtime: { data: null, loading: false, error: null },
  });

  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  // Use 'as any' to bypass BaseService constraint for errorService
  const errorService = serviceRegistry.getService('error') as UnifiedErrorService | undefined;

  // --- ML Analytics (using getModelPerformance as a proxy for ML analytics) ---
  const mlQuery = useQuery<ModelPerformance[] | null, AnalyticsError>({
    queryKey: ['mlAnalytics'],
    queryFn: async () => {
      if (!analyticsService) throw { message: 'Analytics service unavailable' };
      try {
        const result = await analyticsService.getModelPerformance('', '', '');
        setState(prev => ({
          ...prev,
          ml: {
            data: result
              ? {
                  predictions: [],
                  probabilities: [],
                  metrics: result,
                  insights: { featureImportance: {}, shap: {}, lime: {} },
                }
              : null,
            loading: false,
            error: null,
          },
        }));
        return result
          ? [{ model: 'default', metrics: result, timestamp: new Date().toISOString() }]
          : null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch ML analytics';
        if (errorService)
          errorService.handleError(new Error(errorMessage), {
            code: 'ML_ANALYTICS_ERROR',
            source: 'useUnifiedAnalytics',
            details: { context: 'mlAnalytics' },
          });
        setState(prev => ({
          ...prev,
          ml: { data: null, loading: false, error: errorMessage },
        }));
        throw {
          message: errorMessage,
          code: 'ML_ANALYTICS_ERROR',
          context: 'mlAnalytics',
        } as AnalyticsError;
      }
    },
    enabled: !!config.ml,
    refetchInterval: config.ml?.autoUpdate ? config.ml.updateInterval : false,
  });

  // --- Performance Metrics ---
  const performanceQuery = useQuery<PerformanceMetrics | null, AnalyticsError>({
    queryKey: ['performanceMetrics'],
    queryFn: async () => {
      if (!analyticsService) throw { message: 'Analytics service unavailable' };
      try {
        const result = await analyticsService.getPerformanceMetrics('week');
        setState(prev => ({
          ...prev,
          performance: {
            data: result
              ? [{ model: 'default', metrics: result, timestamp: new Date().toISOString() }]
              : null,
            loading: false,
            error: null,
          },
        }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch performance metrics';
        if (errorService)
          errorService.handleError(new Error(errorMessage), {
            code: 'PERFORMANCE_METRICS_ERROR',
            source: 'useUnifiedAnalytics',
            details: { context: 'performanceMetrics' },
          });
        setState(prev => ({
          ...prev,
          performance: { data: null, loading: false, error: errorMessage },
        }));
        throw {
          message: errorMessage,
          code: 'PERFORMANCE_METRICS_ERROR',
          context: 'performanceMetrics',
        } as AnalyticsError;
      }
    },
    enabled: !!config.performance,
  });

  // --- Drift Detection (not implemented in service, placeholder) ---
  const driftQuery = useQuery<DriftPoint[] | null, AnalyticsError>({
    queryKey: ['driftDetection'],
    queryFn: async () => {
      setState(prev => ({
        ...prev,
        drift: { data: null, loading: false, error: null },
      }));
      return null;
    },
    enabled: !!config.drift,
  });

  // --- Betting Analytics (using getBettingStats as a proxy) ---
  const bettingQuery = useQuery<BettingAnalytics | null, AnalyticsError>({
    queryKey: ['bettingAnalytics'],
    queryFn: async () => {
      if (!analyticsService) throw { message: 'Analytics service unavailable' };
      try {
        const result = await analyticsService.getBettingStats('', '', '');
        setState(prev => ({
          ...prev,
          betting: {
            data: result
              ? {
                  roi: 0, // Not available in result
                  winRate: result.winRate ?? 0,
                  profitLoss: result.profitLoss ?? 0,
                  riskMetrics: { var: 0, sharpe: 0, sortino: 0 },
                  confidence: 0,
                }
              : null,
            loading: false,
            error: null,
          },
        }));
        return result
          ? {
              roi: 0, // Not available in result
              winRate: result.winRate ?? 0,
              profitLoss: result.profitLoss ?? 0,
              riskMetrics: { var: 0, sharpe: 0, sortino: 0 },
              confidence: 0,
            }
          : null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch betting analytics';
        if (errorService)
          errorService.handleError(new Error(errorMessage), {
            code: 'BETTING_ANALYTICS_ERROR',
            source: 'useUnifiedAnalytics',
            details: { context: 'bettingAnalytics' },
          });
        setState(prev => ({
          ...prev,
          betting: { data: null, loading: false, error: errorMessage },
        }));
        throw {
          message: errorMessage,
          code: 'BETTING_ANALYTICS_ERROR',
          context: 'bettingAnalytics',
        } as AnalyticsError;
      }
    },
    enabled: !!config.betting,
  });

  // --- Realtime Metrics (not implemented in service, placeholder) ---
  const realtimeQuery = useQuery<RealtimeMetrics | null, AnalyticsError>({
    queryKey: ['realtimeMetrics'],
    queryFn: async () => {
      setState(prev => ({
        ...prev,
        realtime: { data: null, loading: false, error: null },
      }));
      return null;
    },
    enabled: !!config.realtime,
  });

  // --- WebSocket Updates ---
  /**
   * Subscribes to analytics WebSocket events via the unified webSocketManager.
   * Updates state in response to real-time analytics events.
   */
  useEffect(() => {
    function handleAnalyticsEvent(data: any) {
      switch (data.type) {
        case 'ml':
          setState(prev => ({
            ...prev,
            ml: { data: data.payload, loading: false, error: null },
          }));
          break;
        case 'performance':
          setState(prev => ({
            ...prev,
            performance: { data: data.payload, loading: false, error: null },
          }));
          break;
        case 'drift':
          setState(prev => ({
            ...prev,
            drift: { data: data.payload, loading: false, error: null },
          }));
          break;
        case 'betting':
          setState(prev => ({
            ...prev,
            betting: { data: data.payload, loading: false, error: null },
          }));
          break;
        case 'realtime':
          setState(prev => ({
            ...prev,
            realtime: { data: data.payload, loading: false, error: null },
          }));
          break;
        default:
          console.warn?.('Unknown analytics WebSocket type', data.type);
      }
    }
    webSocketManager.on('analytics', handleAnalyticsEvent);
    return () => {
      webSocketManager.off('analytics', handleAnalyticsEvent);
    };
  }, []);

  // --- Memoized return values ---
  const ml = useMemo(
    () => ({
      data: state.ml.data,
      loading: state.ml.loading,
      error: state.ml.error,
      refetch: mlQuery.refetch,
    }),
    [state.ml, mlQuery.refetch]
  );

  const performance = useMemo(
    () => ({
      data: state.performance.data,
      loading: state.performance.loading,
      error: state.performance.error,
      refetch: performanceQuery.refetch,
    }),
    [state.performance, performanceQuery.refetch]
  );

  const drift = useMemo(
    () => ({
      data: state.drift.data,
      loading: state.drift.loading,
      error: state.drift.error,
      refetch: driftQuery.refetch,
    }),
    [state.drift, driftQuery.refetch]
  );

  const betting = useMemo(
    () => ({
      data: state.betting.data,
      loading: state.betting.loading,
      error: state.betting.error,
      refetch: bettingQuery.refetch,
    }),
    [state.betting, bettingQuery.refetch]
  );

  const realtime = useMemo(
    () => ({
      data: state.realtime.data,
      loading: state.realtime.loading,
      error: state.realtime.error,
      refetch: realtimeQuery.refetch,
    }),
    [state.realtime, realtimeQuery.refetch]
  );

  // TODO: Add more granular loading/error states if needed
  // TODO: Add ARIA live region support for analytics-driven UI updates
  // TODO: Add more comprehensive test coverage for analytics hook

  return {
    ml,
    performance,
    drift,
    betting,
    realtime,
    isLoading:
      state.ml.loading ||
      state.performance.loading ||
      state.drift.loading ||
      state.betting.loading ||
      state.realtime.loading,
    error:
      state.ml.error ||
      state.performance.error ||
      state.drift.error ||
      state.betting.error ||
      state.realtime.error,
  };
};
// END useUnifiedAnalytics
