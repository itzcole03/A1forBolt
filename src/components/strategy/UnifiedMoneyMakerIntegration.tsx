import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedPredictionService } from '../../services/unified/UnifiedPredictionService';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
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

interface MoneyMakerConfig {
  investmentAmount: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number;
  confidenceThreshold: number;
  modelWeights: {
    [key: string]: number;
  };
  arbitrageThreshold: number;
  maxExposure: number;
  correlationLimit: number;
}

interface MoneyMakerPrediction {
  eventId: string;
  marketType: string;
  selection: string;
  odds: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  modelContributions: {
    [key: string]: number;
  };
}

interface MoneyMakerPortfolio {
  legs: MoneyMakerPrediction[];
  totalOdds: number;
  expectedValue: number;
  riskScore: number;
  confidence: number;
  arbitrageOpportunity: boolean;
  optimalStakes: {
    [key: string]: number;
  };
}

export const UnifiedMoneyMakerIntegration: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const predictionService = serviceRegistry.getService<UnifiedPredictionService>('prediction');
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [config, setConfig] = useState<MoneyMakerConfig>({
    investmentAmount: 1000,
    riskProfile: 'moderate',
    timeHorizon: 24,
    confidenceThreshold: 85,
    modelWeights: {},
    arbitrageThreshold: 0.05,
    maxExposure: 50,
    correlationLimit: 0.7,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [portfolios, setPortfolios] = useState<MoneyMakerPortfolio[]>([]);
  const [showPortfolios, setShowPortfolios] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'arbitrage' | 'analysis'>(
    'basic'
  );
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Load initial configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const models = await predictionService.getAvailableModels();
      const modelWeights = models.reduce(
        (acc, model) => ({
          ...acc,
          [model.id]: 1 / models.length,
        }),
        {}
      );

      setConfig(prev => ({ ...prev, modelWeights }));
    } catch (error) {
      handleError('Failed to load configuration', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof MoneyMakerConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generatePortfolios = async () => {
    try {
      setLoading(true);
      const results = await predictionService.generateMoneyMakerPortfolios(config);
      setPortfolios(results.portfolios);
      setAnalysisResults(results.analysis);
      setShowPortfolios(true);
    } catch (error) {
      handleError('Failed to generate portfolios', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'MONEY_MAKER_ERROR',
      source: 'UnifiedMoneyMakerIntegration',
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Money Maker Integration</h1>
          <Badge variant="success">Advanced Mode</Badge>
        </div>

        {/* Navigation Tabs */}
        <Tabs className="mb-8" value={activeTab} onChange={setActiveTab}>
          <Tab label="Basic Settings" value="basic" />
          <Tab label="Advanced Settings" value="advanced" />
          <Tab label="Arbitrage" value="arbitrage" />
          <Tab label="Analysis" value="analysis" />
        </Tabs>

        {/* Basic Settings Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-bold mb-4">Investment & Risk</h2>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Profile
                  </label>
                  <Select
                    options={[
                      { value: 'conservative', label: 'Conservative' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'aggressive', label: 'Aggressive' },
                    ]}
                    value={config.riskProfile}
                    onChange={e => handleConfigChange('riskProfile', e.target.value)}
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
                    value={config.timeHorizon}
                    onChange={e => handleConfigChange('timeHorizon', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Model Configuration</h2>
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
                    {Object.entries(config.modelWeights).map(([modelId, weight]) => (
                      <div key={modelId} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{modelId}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPercentage(weight * 100)}
                            </span>
                          </div>
                          <Slider
                            max={100}
                            min={0}
                            value={weight * 100}
                            onChange={value =>
                              handleConfigChange('modelWeights', {
                                ...config.modelWeights,
                                [modelId]: value / 100,
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
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
                  Maximum Exposure
                </label>
                <div className="space-y-2">
                  <Slider
                    max={100}
                    min={10}
                    value={config.maxExposure}
                    onChange={value => handleConfigChange('maxExposure', value)}
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>10%</span>
                    <span>Current: {config.maxExposure}%</span>
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
                    value={config.correlationLimit}
                    onChange={value => handleConfigChange('correlationLimit', value)}
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>0.0</span>
                    <span>Current: {config.correlationLimit}</span>
                    <span>1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Arbitrage Tab */}
        {activeTab === 'arbitrage' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Arbitrage Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arbitrage Threshold
                </label>
                <div className="space-y-2">
                  <Slider
                    max={10}
                    min={1}
                    step={0.1}
                    value={config.arbitrageThreshold * 100}
                    onChange={value => handleConfigChange('arbitrageThreshold', value / 100)}
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>1%</span>
                    <span>Current: {formatPercentage(config.arbitrageThreshold)}</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                <h3 className="font-medium mb-2">Arbitrage Opportunities</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The system will automatically identify and prioritize arbitrage opportunities
                  based on the configured threshold. Higher thresholds will result in more
                  conservative arbitrage selections.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && analysisResults && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Performance Analysis</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <h3 className="font-medium mb-2">Win Rate</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(analysisResults.winRate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <h3 className="font-medium mb-2">ROI</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(analysisResults.roi)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <h3 className="font-medium mb-2">Profit Factor</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisResults.profitFactor.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Model Performance</h3>
                <div className="space-y-4">
                  {Object.entries(analysisResults.modelPerformance).map(
                    ([modelId, performance]: [string, any]) => (
                      <div key={modelId} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{modelId}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPercentage(performance.accuracy)}
                          </span>
                        </div>
                        <Progress className="h-2" max={100} value={performance.accuracy} />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <Button variant="secondary" onClick={loadConfiguration}>
            Reset
          </Button>
          <Button disabled={loading} variant="primary" onClick={generatePortfolios}>
            {loading ? <Spinner size="small" /> : 'Generate Portfolios'}
          </Button>
        </div>
      </div>

      {/* Portfolios Modal */}
      <Modal
        isOpen={showPortfolios}
        title="Money Maker Portfolios"
        onClose={() => setShowPortfolios(false)}
      >
        <div className="space-y-6">
          {portfolios.map((portfolio, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Portfolio {index + 1}</h3>
                <div className="flex space-x-2">
                  {portfolio.arbitrageOpportunity && <Badge variant="success">Arbitrage</Badge>}
                  <Badge
                    variant={
                      portfolio.expectedValue > 0
                        ? 'success'
                        : portfolio.expectedValue < 0
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {formatPercentage(portfolio.expectedValue)} Expected Value
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Legs</h4>
                  <div className="space-y-2">
                    {portfolio.legs.map((leg, legIndex) => (
                      <div key={legIndex} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{leg.selection}</span>
                          <span>{leg.odds.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span>Confidence: {formatPercentage(leg.confidence)}</span>
                          </div>
                          <div>
                            <span>Kelly: {formatPercentage(leg.kellyFraction)}</span>
                          </div>
                          <div>
                            <span>
                              Stake: {formatCurrency(portfolio.optimalStakes[leg.eventId])}
                            </span>
                          </div>
                          <div>
                            <span>EV: {formatPercentage(leg.expectedValue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Odds</p>
                    <p className="font-medium">{portfolio.totalOdds.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
                    <p className="font-medium">{portfolio.riskScore.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className="font-medium">{formatPercentage(portfolio.confidence)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expected Value</p>
                    <p
                      className={`font-medium ${
                        portfolio.expectedValue > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(portfolio.expectedValue)}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => {
                    // Handle portfolio selection
                    setShowPortfolios(false);
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
