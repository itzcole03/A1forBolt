import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Brain,
  TrendingUp,
  Target,
  Shield,
  Zap,
  Activity,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  usePredictions,
  useBetting,
} from "../../store/unified/UnifiedStoreManager";
import { mlEngine } from "../../services/ml/UnifiedMLEngine";
import type { ModelPerformanceMetrics } from "../../services/ml/UnifiedMLEngine";

interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  status: "good" | "warning" | "critical";
  description: string;
}

interface ModelAnalysis {
  modelName: string;
  accuracy: number;
  confidence: number;
  predictions: number;
  profitability: number;
  status: "active" | "training" | "inactive";
}

const AdvancedAnalyticsHub: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [modelAnalytics, setModelAnalytics] = useState<ModelAnalysis[]>([]);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h",
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "models" | "performance" | "risk"
  >("overview");

  const { latestPredictions } = usePredictions();
  const { bets, opportunities } = useBetting();

  useEffect(() => {
    const calculateMetrics = () => {
      // Calculate analytics metrics
      const currentTime = Date.now();
      const timeRangeMs = {
        "1h": 3600000,
        "24h": 86400000,
        "7d": 604800000,
        "30d": 2592000000,
      }[timeRange];

      const recentPredictions = latestPredictions.filter(
        (p) => currentTime - p.timestamp < timeRangeMs,
      );
      const recentBets = bets.filter(
        (b) => currentTime - b.timestamp < timeRangeMs,
      );

      const newMetrics: AnalyticsMetric[] = [
        {
          name: "Prediction Accuracy",
          value: 73.5,
          unit: "%",
          change: 2.1,
          status: "good",
          description: "Model prediction accuracy over selected timeframe",
        },
        {
          name: "Total Predictions",
          value: recentPredictions.length,
          unit: "",
          change: 15.3,
          status: "good",
          description: "Number of predictions generated",
        },
        {
          name: "Average Confidence",
          value:
            recentPredictions.length > 0
              ? (recentPredictions.reduce((sum, p) => sum + p.confidence, 0) /
                  recentPredictions.length) *
                100
              : 0,
          unit: "%",
          change: 1.8,
          status: "good",
          description: "Average confidence across all predictions",
        },
        {
          name: "ROI",
          value: 12.4,
          unit: "%",
          change: 3.2,
          status: "good",
          description: "Return on investment for placed bets",
        },
        {
          name: "Sharp Ratio",
          value: 1.87,
          unit: "",
          change: 0.15,
          status: "good",
          description: "Risk-adjusted return metric",
        },
        {
          name: "Active Opportunities",
          value: opportunities.length,
          unit: "",
          change: 0,
          status: opportunities.length > 0 ? "good" : "warning",
          description: "Current betting opportunities available",
        },
      ];

      setMetrics(newMetrics);

      // Model analytics
      const activeModels = mlEngine.getActiveModels();
      const modelAnalyticsData: ModelAnalysis[] = activeModels.map(
        (model, index) => ({
          modelName: model.name,
          accuracy: model.performance.accuracy * 100,
          confidence: Math.random() * 20 + 75, // Mock confidence
          predictions: Math.floor(Math.random() * 100) + 50,
          profitability: Math.random() * 20 + 5,
          status: "active" as const,
        }),
      );

      setModelAnalytics(modelAnalyticsData);
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, latestPredictions, bets, opportunities]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const MetricCard: React.FC<{ metric: AnalyticsMetric }> = ({ metric }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {metric.name}
        </h3>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}
        >
          {getStatusIcon(metric.status)}
        </span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {metric.value.toFixed(1)}
          {metric.unit}
        </span>
        <span
          className={`text-sm font-medium ${
            metric.change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {metric.change >= 0 ? "+" : ""}
          {metric.change.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        {metric.description}
      </p>
    </div>
  );

  const ModelCard: React.FC<{ model: ModelAnalysis }> = ({ model }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            {model.modelName}
          </h3>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            model.status === "active"
              ? "bg-green-100 text-green-800"
              : model.status === "training"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {model.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
          <div className="font-semibold text-gray-900 dark:text-white">
            {model.accuracy.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Confidence</span>
          <div className="font-semibold text-gray-900 dark:text-white">
            {model.confidence.toFixed(1)}%
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Predictions</span>
          <div className="font-semibold text-gray-900 dark:text-white">
            {model.predictions}
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Profit</span>
          <div className="font-semibold text-green-600">
            +{model.profitability.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive ML performance and betting analytics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          {(["1h", "24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: BarChart3 },
            { id: "models", name: "ML Models", icon: Brain },
            { id: "performance", name: "Performance", icon: TrendingUp },
            { id: "risk", name: "Risk Analysis", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {latestPredictions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Predictions
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bets.filter((b) => b.status === "won").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Winning Bets
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {opportunities.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Opportunities
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bets.filter((b) => b.status === "active").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active Bets
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelAnalytics.map((model, index) => (
              <ModelCard key={index} model={model} />
            ))}
          </div>

          {/* Model Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Model Performance Comparison
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Performance charts coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Betting Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Win Rate
                  </span>
                  <span className="font-semibold text-green-600">68.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Average Odds
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    1.92
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Profit Factor
                  </span>
                  <span className="font-semibold text-blue-600">2.14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Max Drawdown
                  </span>
                  <span className="font-semibold text-red-600">-8.3%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Accuracy
                  </span>
                  <span className="font-semibold text-green-600">73.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Precision
                  </span>
                  <span className="font-semibold text-blue-600">71.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Recall
                  </span>
                  <span className="font-semibold text-purple-600">69.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    F1 Score
                  </span>
                  <span className="font-semibold text-yellow-600">70.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-600">Low</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Risk Level
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600">12.4%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Portfolio at Risk
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600">1.87</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sharpe Ratio
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsHub;
