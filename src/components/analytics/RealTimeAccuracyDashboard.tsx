import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Brain,
  Clock,
  Settings,
  RefreshCw,
  BarChart3,
  Gauge,
  Eye,
  Shield,
  Cpu,
  Server,
} from "lucide-react";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

interface RealTimeAccuracyMetrics {
  overall_accuracy: number;
  directional_accuracy: number;
  profit_correlation: number;
  prediction_confidence: number;
  model_agreement: number;
  uncertainty_quality: number;
  calibration_error: number;
  feature_drift_score: number;
  prediction_latency: number;
  models_active: number;
  predictions_count: number;
  accuracy_trend: number;
  performance_stability: number;
  optimization_score: number;
  timestamp: string;
}

interface AccuracyAlert {
  alert_id: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  severity:
    | "critical"
    | "warning"
    | "acceptable"
    | "good"
    | "excellent"
    | "exceptional";
  message: string;
  recommendations: string[];
  timestamp: string;
  resolved: boolean;
}

interface AlertsResponse {
  active_alerts: AccuracyAlert[];
  total_count: number;
  critical_count: number;
  warning_count: number;
  timestamp: string;
}

export const RealTimeAccuracyDashboard: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] =
    useState<RealTimeAccuracyMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<
    RealTimeAccuracyMetrics[]
  >([]);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  // Fetch current accuracy metrics
  const fetchCurrentMetrics = useCallback(async () => {
    try {
      setConnectionStatus("connecting");
      const response = await fetch("/api/v4/accuracy/current-metrics");
      if (response.ok) {
        const data = await response.json();
        setCurrentMetrics(data);
        setMetricsHistory((prev) => [...prev.slice(-100), data]); // Keep last 100 points
        setLastUpdate(new Date());
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      console.error("Error fetching accuracy metrics:", error);
      setConnectionStatus("disconnected");
    }
  }, []);

  // Fetch active alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/v4/accuracy/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, []);

  // Trigger accuracy optimization
  const triggerOptimization = useCallback(
    async (strategy: string = "quantum_ensemble") => {
      setIsOptimizing(true);
      try {
        const response = await fetch("/api/v4/accuracy/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy,
            target_accuracy: 0.95,
            ensemble_strategy: "multi_level_stacking",
            weight_optimization: "bayesian_optimization",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Optimization triggered:", result);
          // Refresh metrics after optimization
          setTimeout(() => {
            fetchCurrentMetrics();
            fetchAlerts();
          }, 2000);
        }
      } catch (error) {
        console.error("Error triggering optimization:", error);
      } finally {
        setIsOptimizing(false);
      }
    },
    [fetchCurrentMetrics, fetchAlerts],
  );

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const fetchData = async () => {
      await Promise.all([fetchCurrentMetrics(), fetchAlerts()]);
    };

    // Initial fetch
    fetchData();

    // Set up real-time polling
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, fetchCurrentMetrics, fetchAlerts]);

  // Get accuracy level styling
  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 0.97)
      return {
        level: "EXCEPTIONAL",
        color: "text-purple-600",
        bg: "bg-purple-100",
        border: "border-purple-500",
      };
    if (accuracy >= 0.92)
      return {
        level: "EXCELLENT",
        color: "text-green-600",
        bg: "bg-green-100",
        border: "border-green-500",
      };
    if (accuracy >= 0.85)
      return {
        level: "GOOD",
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-500",
      };
    if (accuracy >= 0.75)
      return {
        level: "ACCEPTABLE",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        border: "border-yellow-500",
      };
    if (accuracy >= 0.6)
      return {
        level: "WARNING",
        color: "text-orange-600",
        bg: "bg-orange-100",
        border: "border-orange-500",
      };
    return {
      level: "CRITICAL",
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-500",
    };
  };

  // Chart data for accuracy trends
  const accuracyTrendData = useMemo(() => {
    if (metricsHistory.length < 2) return null;

    const labels = metricsHistory.map((m) =>
      new Date(m.timestamp).toLocaleTimeString(),
    );

    return {
      labels,
      datasets: [
        {
          label: "Overall Accuracy",
          data: metricsHistory.map((m) => m.overall_accuracy * 100),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Directional Accuracy",
          data: metricsHistory.map((m) => m.directional_accuracy * 100),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Model Agreement",
          data: metricsHistory.map((m) => m.model_agreement * 100),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [metricsHistory]);

  // Performance radar chart data
  const performanceRadarData = useMemo(() => {
    if (!currentMetrics) return null;

    return {
      labels: [
        "Overall Accuracy",
        "Directional Accuracy",
        "Model Agreement",
        "Prediction Confidence",
        "Uncertainty Quality",
        "Performance Stability",
      ],
      datasets: [
        {
          label: "Current Performance",
          data: [
            currentMetrics.overall_accuracy * 100,
            currentMetrics.directional_accuracy * 100,
            currentMetrics.model_agreement * 100,
            currentMetrics.prediction_confidence * 100,
            currentMetrics.uncertainty_quality * 100,
            currentMetrics.performance_stability * 100,
          ],
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(99, 102, 241, 1)",
        },
      ],
    };
  }, [currentMetrics]);

  if (!currentMetrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Loading real-time accuracy dashboard...
          </p>
        </div>
      </div>
    );
  }

  const accuracyLevel = getAccuracyLevel(currentMetrics.overall_accuracy);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Live Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Accuracy Monitor
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600 capitalize">
                {connectionStatus}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsLive(!isLive)}
            variant={isLive ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Activity className={`w-4 h-4 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "Live" : "Paused"}
          </Button>
          <Button
            onClick={() => triggerOptimization("quantum_ensemble")}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? "Optimizing..." : "Optimize"}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts && alerts.active_alerts.length > 0 && (
        <Alert className="border-l-4 border-l-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {alerts.critical_count} critical alerts, {alerts.warning_count}{" "}
                warnings
              </span>
              <Badge variant="destructive">{alerts.total_count} total</Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Accuracy */}
        <Card
          className={`border-l-4 ${accuracyLevel.border} ${accuracyLevel.bg}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(currentMetrics.overall_accuracy * 100).toFixed(1)}%
                </div>
                <Badge
                  className={`${accuracyLevel.color} ${accuracyLevel.bg} mt-1`}
                >
                  {accuracyLevel.level}
                </Badge>
              </div>
              <div className="flex items-center">
                {currentMetrics.accuracy_trend > 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
            <Progress
              value={currentMetrics.overall_accuracy * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        {/* Model Agreement */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Model Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(currentMetrics.model_agreement * 100).toFixed(1)}%
            </div>
            <Progress
              value={currentMetrics.model_agreement * 100}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentMetrics.models_active} models active
            </p>
          </CardContent>
        </Card>

        {/* Prediction Confidence */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Prediction Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(currentMetrics.prediction_confidence * 100).toFixed(1)}%
            </div>
            <Progress
              value={currentMetrics.prediction_confidence * 100}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentMetrics.predictions_count} predictions
            </p>
          </CardContent>
        </Card>

        {/* Optimization Score */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(currentMetrics.optimization_score * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {currentMetrics.prediction_latency.toFixed(0)}ms latency
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
            <Progress
              value={currentMetrics.optimization_score * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Accuracy Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance Radar</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        {/* Accuracy Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Real-Time Accuracy Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accuracyTrendData && (
                <div className="h-80">
                  <Line
                    data={accuracyTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: function (value) {
                              return value + "%";
                            },
                          },
                        },
                      },
                      interaction: {
                        mode: "nearest",
                        axis: "x",
                        intersect: false,
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Radar */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-purple-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceRadarData && (
                <div className="h-80">
                  <Radar
                    data={performanceRadarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: function (value) {
                              return value + "%";
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Metrics */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Directional Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.directional_accuracy * 100).toFixed(1)}%
                </div>
                <Progress
                  value={currentMetrics.directional_accuracy * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uncertainty Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.uncertainty_quality * 100).toFixed(1)}%
                </div>
                <Progress
                  value={currentMetrics.uncertainty_quality * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Stability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.performance_stability * 100).toFixed(1)}%
                </div>
                <Progress
                  value={currentMetrics.performance_stability * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calibration Error</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.calibration_error * 100).toFixed(1)}%
                </div>
                <Progress
                  value={100 - currentMetrics.calibration_error * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Feature Drift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.feature_drift_score * 100).toFixed(1)}%
                </div>
                <Progress
                  value={100 - currentMetrics.feature_drift_score * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profit Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {(currentMetrics.profit_correlation * 100).toFixed(1)}%
                </div>
                <Progress
                  value={Math.abs(currentMetrics.profit_correlation) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Alerts */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts && alerts.active_alerts.length > 0 ? (
              alerts.active_alerts.map((alert) => (
                <Card
                  key={alert.alert_id}
                  className={`border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-red-500 bg-red-50"
                      : alert.severity === "warning"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">
                          {alert.metric_name.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-800 mb-2">
                      {alert.message}
                    </p>

                    <div className="text-xs text-gray-600 mb-3">
                      Current: {alert.current_value.toFixed(3)} | Threshold:{" "}
                      {alert.threshold_value.toFixed(3)}
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Recommendations:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold text-gray-700">
                    All Systems Optimal
                  </p>
                  <p className="text-gray-500">
                    No accuracy alerts at this time
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeAccuracyDashboard;
