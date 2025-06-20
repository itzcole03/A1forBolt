import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedPredictionService } from '../../services/unified/UnifiedPredictionService';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { useEventAnalytics } from '../../hooks/useUnifiedAnalytics';
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
} from '../ui/UnifiedUI';

interface StrategyConfig {
  investmentAmount: number;
  modelSet: {
    [key: string]: {
      enabled: boolean;
      weight: number;
    };
  };
  confidenceThreshold: number;
  strategyMode:
    | 'maximum_profit'
    | 'balanced'
    | 'conservative'
    | 'aggressive'
    | 'arbitrage'
    | 'ai_adaptive';
  portfolioSize: number;
  sportsUniverse: {
    all: boolean;
    selected: string[];
  };
  timeHorizon: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  riskProfile: {
    maxDrawdown: number;
    maxExposure: number;
    correlationLimit: number;
  };
}

interface ModelInfo {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  profitFactor: number;
  description: string;
  lastUpdated: string;
}

interface PortfolioRecommendation {
  legs: Array<{
    eventId: string;
    marketType: string;
    selection: string;
    odds: number;
    confidence: number;
    expectedValue: number;
    kellyFraction: number;
  }>;
  totalOdds: number;
  expectedValue: number;
  riskScore: number;
  confidence: number;
}

export const UnifiedStrategyConfig: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const predictionService = serviceRegistry.getService<UnifiedPredictionService>('prediction');
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');
  const webSocketService = serviceRegistry.getService<any>('websocket');

  // State
  const [config, setConfig] = useState<StrategyConfig>({
    investmentAmount: 1000,
    modelSet: {},
    confidenceThreshold: 85,
    strategyMode: 'balanced',
    portfolioSize: 3,
    sportsUniverse: {
      all: true,
      selected: [],
    },
    timeHorizon: {
      value: 1,
      unit: 'hours',
    },
    riskProfile: {
      maxDrawdown: 20,
      maxExposure: 50,
      correlationLimit: 0.7,
    },
  });
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'risk' | 'models'>('basic');

  // Analytics state
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedSelection, setSelectedSelection] = useState<string | null>(null);

  const analytics = useEventAnalytics(
    selectedEvent || '',
    selectedMarket || '',
    selectedSelection || ''
  );

  const {
    metrics,
    trendDelta,
    riskProfile,
    explainabilityMap,
    modelMetadata,
    isLoading: analyticsLoading,
    error: analyticsError,
    getMetricColor,
    getTrendIcon,
    getRiskLevelColor,
  } = analytics;

  // Load available models
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const availableModels = await predictionService.getAvailableModels();
      setModels(availableModels);

      // Initialize model set with default weights
      const modelSet = availableModels.reduce(
        (acc, model) => ({
          ...acc,
          [model.id]: {
            enabled: true,
            weight: 1 / availableModels.length,
          },
        }),
        {}
      );

      setConfig(prev => ({ ...prev, modelSet }));
    } catch (error) {
      handleError('Failed to load models', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof StrategyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleModelWeightChange = (modelId: string, weight: number) => {
    setConfig(prev => ({
      ...prev,
      modelSet: {
        ...prev.modelSet,
        [modelId]: {
          ...prev.modelSet[modelId],
          weight,
        },
      },
    }));
  };

  const handleModelToggle = (modelId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      modelSet: {
        ...prev.modelSet,
        [modelId]: {
          ...prev.modelSet[modelId],
          enabled,
        },
      },
    }));
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const recommendations = await predictionService.generatePortfolioRecommendations(config);
      setRecommendations(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      handleError('Failed to generate recommendations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'STRATEGY_CONFIG_ERROR',
      source: 'UnifiedStrategyConfig',
      details: { message },
    });
  };

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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedEvent || !selectedMarket || !selectedSelection) return;

    const unsubscribe = webSocketService?.subscribe?.('analytics', (data: any) => {
      if (data.eventId === selectedEvent && data.marketId === selectedMarket) {
        // Analytics hook will auto-update via its own effect
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [selectedEvent, selectedMarket, selectedSelection, webSocketService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Strategy Configuration</h1>

        {/* Analytics Overview */}
        {selectedEvent && selectedMarket && selectedSelection && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Strategy Configuration</h2>

            {/* Analytics Overview */}
            {analyticsLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="medium" />
              </div>
            ) : analyticsError ? (
              <div className="text-red-500 text-center">
                <p>{analyticsError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">
                          {(metrics.accuracy * 100).toFixed(1)}%
                        </p>
                        {trendDelta && (
                          <Icon
                            className={`w-4 h-4 ${getMetricColor(trendDelta.accuracyDelta, 'positive')}`}
                            name={getTrendIcon(trendDelta.accuracyDelta)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Precision</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">
                          {(metrics.precision * 100).toFixed(1)}%
                        </p>
                        {trendDelta && (
                          <Icon
                            className={`w-4 h-4 ${getMetricColor(trendDelta.precisionDelta, 'positive')}`}
                            name={getTrendIcon(trendDelta.precisionDelta)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Recall</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">
                          {(metrics.recall * 100).toFixed(1)}%
                        </p>
                        {trendDelta && (
                          <Icon
                            className={`w-4 h-4 ${getMetricColor(trendDelta.recallDelta, 'positive')}`}
                            name={getTrendIcon(trendDelta.recallDelta)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Profit/Loss</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">{metrics.profitLoss.toFixed(2)}%</p>
                        <Icon
                          className={`w-4 h-4 ${getMetricColor(metrics.profitLoss, 'positive')}`}
                          name={getTrendIcon(metrics.profitLoss)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Risk Profile */}
            {riskProfile && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Risk Profile</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant={riskProfile.riskLevel.toLowerCase() as any}>
                    {riskProfile.riskLevel}
                  </Badge>
                  <p className="text-sm text-gray-600">{riskProfile.recommendation}</p>
                </div>
              </div>
            )}

            {/* Model Stability */}
            {modelMetadata && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Model Stability</h4>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      modelMetadata.stability > 0.8
                        ? 'success'
                        : modelMetadata.stability > 0.6
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {modelMetadata.stability > 0.8
                      ? 'High'
                      : modelMetadata.stability > 0.6
                        ? 'Medium'
                        : 'Low'}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(modelMetadata.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs className="mb-8" value={activeTab} onChange={setActiveTab}>
          <Tab label="Basic Settings" value="basic" />
          <Tab label="Advanced Settings" value="advanced" />
          <Tab label="Risk Management" value="risk" />
          <Tab label="Model Selection" value="models" />
        </Tabs>

        {/* Basic Settings Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-bold mb-4">Investment & Strategy</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investment Amount
                  </label>
                  <Input
                    max="100000"
                    min="10"
                    type="number"
                    value={config.investmentAmount}
                    onChange={e =>
                      handleConfigChange('investmentAmount', parseFloat(e.target.value))
                    }
                  />
                  <p className="mt-1 text-sm text-gray-500">Range: $10 - $100,000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Strategy Mode
                  </label>
                  <Select
                    options={[
                      { value: 'maximum_profit', label: 'Maximum Profit' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'conservative', label: 'Conservative' },
                      { value: 'aggressive', label: 'Aggressive' },
                      { value: 'arbitrage', label: 'Arbitrage' },
                      { value: 'ai_adaptive', label: 'AI-Adaptive' },
                    ]}
                    value={config.strategyMode}
                    onChange={e => handleConfigChange('strategyMode', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio Size
                  </label>
                  <Select
                    options={[
                      { value: 2, label: '2 Legs' },
                      { value: 3, label: '3 Legs' },
                      { value: 4, label: '4 Legs' },
                      { value: 5, label: '5 Legs' },
                      { value: 6, label: '6 Legs' },
                    ]}
                    value={config.portfolioSize}
                    onChange={e => handleConfigChange('portfolioSize', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Sports & Time Horizon</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sports Universe
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        checked={config.sportsUniverse.all}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        type="checkbox"
                        onChange={e =>
                          handleConfigChange('sportsUniverse', {
                            ...config.sportsUniverse,
                            all: e.target.checked,
                            selected: e.target.checked ? [] : config.sportsUniverse.selected,
                          })
                        }
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        All Sports
                      </label>
                    </div>
                    {!config.sportsUniverse.all && (
                      <Select
                        multiple
                        options={[
                          { value: 'football', label: 'Football' },
                          { value: 'basketball', label: 'Basketball' },
                          { value: 'baseball', label: 'Baseball' },
                          { value: 'hockey', label: 'Hockey' },
                          { value: 'soccer', label: 'Soccer' },
                          { value: 'tennis', label: 'Tennis' },
                        ]}
                        value={config.sportsUniverse.selected}
                        onChange={e =>
                          handleConfigChange('sportsUniverse', {
                            ...config.sportsUniverse,
                            selected: Array.from(e.target.selectedOptions, option => option.value),
                          })
                        }
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Horizon
                  </label>
                  <div className="flex space-x-4">
                    <Input
                      className="w-24"
                      min="1"
                      type="number"
                      value={config.timeHorizon.value}
                      onChange={e =>
                        handleConfigChange('timeHorizon', {
                          ...config.timeHorizon,
                          value: parseInt(e.target.value),
                        })
                      }
                    />
                    <Select
                      options={[
                        { value: 'minutes', label: 'Minutes' },
                        { value: 'hours', label: 'Hours' },
                        { value: 'days', label: 'Days' },
                      ]}
                      value={config.timeHorizon.unit}
                      onChange={e =>
                        handleConfigChange('timeHorizon', {
                          ...config.timeHorizon,
                          unit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Advanced Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confidence Threshold
                </label>
                <div className="space-y-2">
                  <Slider
                    max={99}
                    min={80}
                    value={config.confidenceThreshold}
                    onChange={value => handleConfigChange('confidenceThreshold', value)}
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>80%</span>
                    <span>Current: {config.confidenceThreshold}%</span>
                    <span>99%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Model Weights</h3>
                <div className="space-y-4">
                  {models.map(model => (
                    <div key={model.id} className="flex items-center space-x-4">
                      <input
                        checked={config.modelSet[model.id]?.enabled}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        type="checkbox"
                        onChange={e => handleModelToggle(model.id, e.target.checked)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Accuracy: {formatPercentage(model.accuracy)}
                          </span>
                        </div>
                        <Slider
                          disabled={!config.modelSet[model.id]?.enabled}
                          max={100}
                          min={0}
                          value={config.modelSet[model.id]?.weight * 100}
                          onChange={value => handleModelWeightChange(model.id, value / 100)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Risk Management</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Drawdown
                </label>
                <div className="space-y-2">
                  <Slider
                    max={50}
                    min={5}
                    value={config.riskProfile.maxDrawdown}
                    onChange={value =>
                      handleConfigChange('riskProfile', {
                        ...config.riskProfile,
                        maxDrawdown: value,
                      })
                    }
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>5%</span>
                    <span>Current: {config.riskProfile.maxDrawdown}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Exposure
                </label>
                <div className="space-y-2">
                  <Slider
                    max={100}
                    min={10}
                    value={config.riskProfile.maxExposure}
                    onChange={value =>
                      handleConfigChange('riskProfile', {
                        ...config.riskProfile,
                        maxExposure: value,
                      })
                    }
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>10%</span>
                    <span>Current: {config.riskProfile.maxExposure}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correlation Limit
                </label>
                <div className="space-y-2">
                  <Slider
                    max={1}
                    min={0}
                    step={0.1}
                    value={config.riskProfile.correlationLimit}
                    onChange={value =>
                      handleConfigChange('riskProfile', {
                        ...config.riskProfile,
                        correlationLimit: value,
                      })
                    }
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>0.0</span>
                    <span>Current: {config.riskProfile.correlationLimit}</span>
                    <span>1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Model Selection Tab */}
        {activeTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {models.map(model => (
              <Card key={model.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">{model.name}</h3>
                  <Badge
                    variant={
                      model.accuracy >= 90 ? 'success' : model.accuracy >= 80 ? 'warning' : 'danger'
                    }
                  >
                    {formatPercentage(model.accuracy)} Accuracy
                  </Badge>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">{model.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                      <p className="font-medium">{model.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</p>
                      <p className="font-medium">{model.profitFactor.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                    </span>
                    <input
                      checked={config.modelSet[model.id]?.enabled}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      type="checkbox"
                      onChange={e => handleModelToggle(model.id, e.target.checked)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              // Reset to default configuration
              loadModels();
            }}
          >
            Reset
          </Button>
          <Button disabled={loading} variant="primary" onClick={generateRecommendations}>
            {loading ? <Spinner size="small" /> : 'Generate Recommendations'}
          </Button>
        </div>
      </div>

      {/* Recommendations Modal */}
      <Modal
        isOpen={showRecommendations}
        title="Portfolio Recommendations"
        onClose={() => setShowRecommendations(false)}
      >
        <div className="space-y-6">
          {recommendations.map((recommendation, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Portfolio {index + 1}</h3>
                <Badge
                  variant={
                    recommendation.expectedValue > 0
                      ? 'success'
                      : recommendation.expectedValue < 0
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {formatPercentage(recommendation.expectedValue)} Expected Value
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Legs</h4>
                  <div className="space-y-2">
                    {recommendation.legs.map((leg, legIndex) => (
                      <div key={legIndex} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{leg.selection}</span>
                          <span>{leg.odds.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{leg.marketType}</span>
                          <span>Confidence: {formatPercentage(leg.confidence)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Odds</p>
                    <p className="font-medium">{recommendation.totalOdds.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
                    <p className="font-medium">{recommendation.riskScore.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className="font-medium">{formatPercentage(recommendation.confidence)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected Value</p>
                    <p
                      className={`font-medium ${
                        recommendation.expectedValue > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(recommendation.expectedValue)}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => {
                    // Handle portfolio selection
                    setShowRecommendations(false);
                  }}
                >
                  Select Portfolio
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
