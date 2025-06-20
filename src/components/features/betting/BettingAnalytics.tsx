import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBettingAnalytics } from '../hooks/useBettingAnalytics';
import { useSmartAlerts } from '../hooks/useSmartAlerts';
import { BettingOpportunity } from '../services/bettingStrategy';
import { PredictionResult } from '../services/predictionService';
import { Card } from './base/Card';
import { Progress } from './base/Progress';
import { Badge } from './base/Badge';
import { Alert } from './base/Alert';
import { Skeleton } from './base/Skeleton';
import { Table } from './base/Table';

interface BettingAnalyticsProps {
  onOpportunitySelect?: (opportunity: BettingOpportunity) => void;
}

interface PredictionFactor {
  name: string;
  impact: number;
  description: string;
}

export const BettingAnalytics: React.FC<BettingAnalyticsProps> = ({
  onOpportunitySelect
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [sortField, setSortField] = useState<string>('confidence');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const {
    opportunities,
    predictions,
    performance,
    isLoading,
    error
  } = useBettingAnalytics({
    minConfidence: confidenceThreshold,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const { alerts } = useSmartAlerts({
    wsEndpoint: import.meta.env.VITE_WS_ENDPOINT || '',
    enabledTypes: ['LINE_MOVEMENT', 'INJURY', 'WEATHER'],
    minSeverity: 'medium'
  });

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter(opp => selectedSport === 'all' || opp.sport === selectedSport)
      .sort((a, b) => {
        const aValue = a[sortField as keyof BettingOpportunity];
        const bValue = b[sortField as keyof BettingOpportunity];
        return sortDirection === 'asc' 
          ? (aValue > bValue ? 1 : -1)
          : (bValue > aValue ? 1 : -1);
      });
  }, [opportunities, selectedSport, sortField, sortDirection]);

  const handleOpportunityClick = useCallback((opportunity: BettingOpportunity) => {
    onOpportunitySelect?.(opportunity);
  }, [onOpportunitySelect]);

  const renderPerformanceMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
          <div className="mt-2 flex items-center">
            <span className="text-2xl font-semibold">
              {(performance.winRate * 100).toFixed(1)}%
            </span>
            <Badge
              variant={performance.winRate >= 0.55 ? 'success' : 'warning'}
              className="ml-2"
            >
              {performance.winRate >= 0.55 ? 'Profitable' : 'Monitor'}
            </Badge>
          </div>
          <Progress
            value={performance.winRate * 100}
            max={100}
            variant={performance.winRate >= 0.55 ? 'success' : 'warning'}
            className="mt-2"
          />
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">ROI</h3>
          <div className="mt-2 flex items-center">
            <span className="text-2xl font-semibold">
              {(performance.roi * 100).toFixed(1)}%
            </span>
            <Badge
              variant={performance.roi > 0 ? 'success' : 'danger'}
              className="ml-2"
            >
              {performance.roi > 0 ? 'Positive' : 'Negative'}
            </Badge>
          </div>
          <Progress
            value={Math.min(Math.max(performance.roi * 100, 0), 100)}
            max={100}
            variant={performance.roi > 0 ? 'success' : 'danger'}
            className="mt-2"
          />
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Edge Retention</h3>
          <div className="mt-2 flex items-center">
            <span className="text-2xl font-semibold">
              {(performance.edgeRetention * 100).toFixed(1)}%
            </span>
            <Badge
              variant={performance.edgeRetention >= 0.7 ? 'success' : 'warning'}
              className="ml-2"
            >
              {performance.edgeRetention >= 0.7 ? 'Strong' : 'Weak'}
            </Badge>
          </div>
          <Progress
            value={performance.edgeRetention * 100}
            max={100}
            variant={performance.edgeRetention >= 0.7 ? 'success' : 'warning'}
            className="mt-2"
          />
        </div>
      </Card>
    </div>
  );

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading Analytics"
        message={error.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        renderPerformanceMetrics()
      )}

      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Betting Opportunities</h2>
            <div className="flex space-x-2">
              <select
                className="form-select"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
              >
                <option value="all">All Sports</option>
                <option value="NBA">NBA</option>
                <option value="NFL">NFL</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
              </select>
              <select
                className="form-select"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              >
                <option value={0.6}>60%+ Confidence</option>
                <option value={0.7}>70%+ Confidence</option>
                <option value={0.8}>80%+ Confidence</option>
                <option value={0.9}>90%+ Confidence</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Alert
                  type="warning"
                  title="Active Alerts"
                  message={`${alerts.length} alert${alerts.length === 1 ? '' : 's'} require your attention`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Table
            data={filteredOpportunities}
            columns={[
              {
                key: 'sport',
                title: 'Sport',
                render: (value) => (
                  <Badge variant="default">{value}</Badge>
                )
              },
              {
                key: 'description',
                title: 'Opportunity',
                render: (value, item) => (
                  <div className="flex items-center">
                    <span>{value}</span>
                    {alerts.some(alert => 
                      alert.metadata.gameId === item.gameId
                    ) && (
                      <Badge variant="warning" className="ml-2">
                        Alert
                      </Badge>
                    )}
                  </div>
                )
              },
              {
                key: 'confidence',
                title: 'Confidence',
                render: (value) => (
                  <div className="w-32">
                    <Progress
                      value={value * 100}
                      max={100}
                      variant={value >= 0.8 ? 'success' : 'warning'}
                      showValue
                      size="sm"
                    />
                  </div>
                )
              },
              {
                key: 'expectedValue',
                title: 'Expected Value',
                render: (value) => (
                  <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
                    {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                  </span>
                )
              }
            ]}
            onRowClick={handleOpportunityClick}
            emptyMessage="No opportunities match your criteria"
            sortKey={sortField}
            sortDirection={sortDirection}
            onSort={(key) => {
              if (key === sortField) {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(key);
                setSortDirection('desc');
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}; 