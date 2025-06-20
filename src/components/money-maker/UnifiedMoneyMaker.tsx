import React, { useEffect, useCallback, useState } from 'react';
import { useMoneyMakerStore } from '@/stores/moneyMakerStore';
import {
  MoneyMakerConfig,
  MoneyMakerPrediction,
  MoneyMakerPortfolio,
  RiskLevel,
} from '@/types/money-maker';
import {
  Card,
  Button,
  Input,
  Select,
  Slider,
  Spinner,
  Toast,
  Badge,
  Modal,
  Tabs,
  Tab,
  Progress,
} from '../ui/UnifiedUI';

export const UnifiedMoneyMaker: React.FC = () => {
  const store = useMoneyMakerStore();
  const { config, predictions, portfolios, metrics, isLoading, error, lastUpdate, filters, sort } =
    store;

  const [activeTab, setActiveTab] = useState<'config' | 'predictions' | 'portfolios' | 'metrics'>(
    'config'
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        store.setLoading(true);
        // Load initial data from your backend
        // This is where you would integrate with your actual services
        store.setLoading(false);
      } catch (error) {
        handleError('Failed to load initial data', error);
      }
    };

    loadData();
  }, []);

  // Fetch predictions on mount and when filters/sort change
  useEffect(() => {
    store.fetchPredictions();
  }, [JSON.stringify(filters), JSON.stringify(sort)]);

  const handleError = useCallback((message: string, error: any) => {
    store.setError(message);
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    console.error(message, error);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as typeof activeTab);
  }, []);

  const handleConfigChange = useCallback(
    (key: keyof MoneyMakerConfig, value: string | number) => {
      try {
        store.updateConfig({ [key]: value });
        setToastMessage('Configuration updated successfully');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        handleError('Failed to update configuration', error);
      }
    },
    [store.updateConfig]
  );

  const handleInputChange = useCallback(
    (key: keyof MoneyMakerConfig) => (value: string) => {
      const numValue = key === 'timeHorizon' || key === 'investmentAmount' ? Number(value) : value;
      handleConfigChange(key, numValue);
    },
    [handleConfigChange]
  );

  const handleGeneratePortfolio = useCallback(async () => {
    try {
      store.setLoading(true);
      // Generate portfolio based on current predictions and config
      // This is where you would integrate with your portfolio generation logic
      store.setLoading(false);
    } catch (error) {
      handleError('Failed to generate portfolio', error);
    }
  }, [config, predictions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const handleShowDetails = useCallback((prediction: MoneyMakerPrediction) => {
    // TODO: Implement details modal
    console.log('Show details for prediction:', prediction);
  }, []);

  const handlePlaceBet = useCallback((prediction: MoneyMakerPrediction) => {
    // TODO: Implement bet placement
    console.log('Place bet for prediction:', prediction);
  }, []);

  const getBadgeVariant = (riskLevel: RiskLevel): 'success' | 'warning' | 'danger' => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'warning';
    }
  };

  // Sorting/filtering handlers
  const handleSortChange = (field: keyof MoneyMakerPrediction) => {
    store.updateSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
  };
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    store.updateFilters({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Money Maker</h1>
          <Badge variant="success">Active</Badge>
        </div>

        {/* Navigation Tabs */}
        <Tabs className="mb-8" value={activeTab} onChange={handleTabChange}>
          <Tab label="Configuration" value="config" />
          <Tab label="Predictions" value="predictions" />
          <Tab label="Portfolios" value="portfolios" />
          <Tab label="Metrics" value="metrics" />
        </Tabs>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Amount
                </label>
                <Input
                  max="100000"
                  min="0"
                  type="number"
                  value={String(config.investmentAmount)}
                  onChange={handleInputChange('investmentAmount')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Horizon (Hours)
                </label>
                <Input
                  max="72"
                  min="1"
                  type="number"
                  value={String(config.timeHorizon)}
                  onChange={handleInputChange('timeHorizon')}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-32"
                  options={[
                    { value: '', label: 'All Risks' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  value={filters.riskLevel || ''}
                  onChange={value => handleFilterChange('riskLevel', value || undefined)}
                />
                <Select
                  className="w-32"
                  options={[
                    { value: '', label: 'All Models' },
                    // Optionally map over available models
                  ]}
                  value={filters.modelId || ''}
                  onChange={value => handleFilterChange('modelId', value || undefined)}
                />
                <Select
                  className="w-32"
                  options={[
                    { value: 'confidence', label: 'Confidence' },
                    { value: 'expectedValue', label: 'Expected Value' },
                    { value: 'odds', label: 'Odds' },
                    { value: 'timestamp', label: 'Timestamp' },
                  ]}
                  value={sort.field}
                  onChange={value => handleSortChange(value as keyof MoneyMakerPrediction)}
                />
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Spinner size="large" />
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No predictions available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Label</th>
                      <th className="px-4 py-2 text-left">Confidence</th>
                      <th className="px-4 py-2 text-left">EV</th>
                      <th className="px-4 py-2 text-left">Model</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                      <th className="px-4 py-2 text-left">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map(pred => (
                      <tr key={pred.eventId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">
                          {pred.selection} ({pred.marketType})
                        </td>
                        <td className="px-4 py-2">{(pred.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2">{pred.expectedValue.toFixed(3)}</td>
                        <td className="px-4 py-2">
                          {pred.metadata.modelVersion ||
                            Object.keys(pred.modelContributions).join(', ')}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(pred.metadata.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          {pred.explanation &&
                          pred.explanation.decisionPath &&
                          pred.explanation.decisionPath.length > 0 ? (
                            <span>{pred.explanation.decisionPath.join(' → ')}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Portfolios Tab */}
        {activeTab === 'portfolios' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Portfolios</h2>
              <Button variant="primary" onClick={handleGeneratePortfolio}>
                Generate New Portfolio
              </Button>
            </div>
            <div className="space-y-4">
              {portfolios.map(portfolio => (
                <div key={portfolio.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Portfolio {portfolio.id}</h3>
                      <p className="text-sm text-gray-500">{portfolio.legs.length} legs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Total Odds: {portfolio.totalOdds.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        EV: {formatPercentage(portfolio.expectedValue)}
                      </p>
                    </div>
                  </div>
                  <Progress className="mt-2" value={portfolio.confidence} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Overall Performance</h3>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalProfit)}</p>
                <p className="text-sm text-gray-500">ROI: {formatPercentage(metrics.roi)}</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Success Rate</h3>
                <p className="text-2xl font-bold">{formatPercentage(metrics.successRate)}</p>
                <p className="text-sm text-gray-500">
                  {metrics.winningBets} / {metrics.totalBets} bets
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Risk Metrics</h3>
                <p className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Max Drawdown: {formatPercentage(metrics.maxDrawdown)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Toast Notifications */}
        {showToast && (
          <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  );
};
