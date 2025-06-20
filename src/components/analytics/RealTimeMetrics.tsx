import React, { useEffect, useState } from 'react';
import { Card, Badge, Icon, Spinner } from '../ui/UnifiedUI.js';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry.js';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService.js';
import { UnifiedWebSocketService } from '../../services/unified/UnifiedWebSocketService.js';
import { PerformanceMetrics, TrendDelta, RiskProfile } from '../../types/analytics.js';

interface RealTimeMetricsProps {
  eventId: string;
  marketId: string;
  selectionId: string;
  className?: string;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  eventId,
  marketId,
  selectionId,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trendDelta, setTrendDelta] = useState<TrendDelta | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const webSocketService = serviceRegistry.getService<UnifiedWebSocketService>('websocket');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!analyticsService) {
          setError('Analytics service is not available.');
          setIsLoading(false);
          return;
        }

        const [metricsData, trendData, riskData] = await Promise.all([
          analyticsService.getPerformanceMetrics(eventId, marketId, selectionId),
          analyticsService.getTrendDelta(eventId, marketId, selectionId, 'day'),
          analyticsService.getRiskProfile(eventId, marketId, selectionId),
        ]);

        setMetrics(metricsData);
        setTrendDelta(trendData);
        setRiskProfile(riskData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();

    // Subscribe to real-time updates
    let unsubscribe = () => { };
    if (webSocketService) {
      unsubscribe = webSocketService.subscribe('metrics', (data: unknown) => {
        // Type guard to ensure data has the expected structure
        if (
          data &&
          typeof data === 'object' &&
          'eventId' in data &&
          'marketId' in data &&
          'metrics' in data &&
          'trendDelta' in data &&
          'riskProfile' in data
        ) {
          const typedData = data as {
            eventId: string;
            marketId: string;
            metrics: PerformanceMetrics;
            trendDelta: TrendDelta;
            riskProfile: RiskProfile;
          };

          if (typedData.eventId === eventId && typedData.marketId === marketId) {
            setMetrics(typedData.metrics);
            setTrendDelta(typedData.trendDelta);
            setRiskProfile(typedData.riskProfile);
          }
        }
      });
    }
    return () => unsubscribe();
  }, [eventId, marketId, selectionId, analyticsService, webSocketService]);

  const getMetricColor = (value: number, type: 'positive' | 'negative'): string => {
    if (type === 'positive') {
      return value >= 0 ? 'text-green-500' : 'text-red-500';
    }
    return value <= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = (value: number): string => {
    if (value > 0) return 'arrow-trending-up';
    if (value < 0) return 'arrow-trending-down';
    return 'minus';
  };

  const getRiskBadgeVariant = (riskLevel: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <Card aria-live="polite" className={`p-6 ${className}`}>
        <div className="flex justify-center items-center h-32">
          <Spinner size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card aria-live="polite" className={`p-6 ${className}`}>
        <div className="text-red-500 text-center">
          <Icon className="w-8 h-8 mx-auto mb-2" name="exclamation-circle" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!metrics || !trendDelta || !riskProfile) {
    return null;
  }

  return (
    <Card aria-live="polite" className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Real-Time Metrics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Accuracy</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">{(metrics.accuracy * 100).toFixed(1)}%</p>
            <Icon
              aria-label={
                trendDelta.accuracyDelta > 0
                  ? 'Positive accuracy trend'
                  : trendDelta.accuracyDelta < 0
                    ? 'Negative accuracy trend'
                    : 'No accuracy trend'
              }
              className={`w-4 h-4 ${getMetricColor(trendDelta.accuracyDelta, 'positive')}`}
              name={getTrendIcon(trendDelta.accuracyDelta)}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Precision</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">{(metrics.precision * 100).toFixed(1)}%</p>
            <Icon
              className={`w-4 h-4 ${getMetricColor(trendDelta.precisionDelta, 'positive')}`}
              name={getTrendIcon(trendDelta.precisionDelta)}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Recall</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">{(metrics.recall * 100).toFixed(1)}%</p>
            <Icon
              className={`w-4 h-4 ${getMetricColor(trendDelta.recallDelta, 'positive')}`}
              name={getTrendIcon(trendDelta.recallDelta)}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Profit/Loss</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">${metrics.profitLoss.toFixed(2)}</p>
            <Icon
              className={`w-4 h-4 ${getMetricColor(metrics.profitLoss, 'positive')}`}
              name={getTrendIcon(metrics.profitLoss)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Risk Profile</h4>
          <div className="flex items-center space-x-2">
            <Badge variant={getRiskBadgeVariant(riskProfile.riskLevel)}>
              {riskProfile.riskLevel}
            </Badge>
            <p className="text-sm text-gray-600">{riskProfile.recommendation}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Top Risk Factors</h4>
          <div className="space-y-2">
            {Array.isArray(riskProfile.factors) && riskProfile.factors.length > 0 ? (
              riskProfile.factors.map((factor: string, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-sm">{factor}</p>
                  <Badge variant="warning">Risk Factor</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm">No risk factors available.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
