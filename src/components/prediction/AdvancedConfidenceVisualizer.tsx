import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Gauge,
  Zap,
  Brain,
  Eye,
  Settings,
} from "lucide-react";
import { Line, Bar, Scatter, Radar } from "react-chartjs-2";
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
  Filler,
);

interface PredictionWithConfidence {
  prediction_id: string;
  final_prediction: number;
  confidence_score: number;
  uncertainty_bounds: [number, number];
  model_agreement: number;
  quantum_fidelity: number;
  prediction_interval: [number, number];
  individual_predictions: Record<string, number>;
  model_weights: Record<string, number>;
  feature_importance: Record<string, number>;
  shap_values: Record<string, number>;
  processing_time: number;
  timestamp: string;
  context: {
    sport: string;
    event_type: string;
    market_type: string;
  };
}

interface ConfidenceMetrics {
  overall_confidence: number;
  directional_confidence: number;
  magnitude_confidence: number;
  model_consensus: number;
  uncertainty_quality: number;
  calibration_score: number;
  prediction_sharpness: number;
  coverage_probability: number;
}

interface ConfidenceDistribution {
  confidence_bins: number[];
  frequency: number[];
  accuracy_by_bin: number[];
}

export const AdvancedConfidenceVisualizer: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionWithConfidence[]>(
    [],
  );
  const [confidenceMetrics, setConfidenceMetrics] =
    useState<ConfidenceMetrics | null>(null);
  const [confidenceDistribution, setConfidenceDistribution] =
    useState<ConfidenceDistribution | null>(null);
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionWithConfidence | null>(null);
  const [timeRange, setTimeRange] = useState("1h");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch prediction data with confidence metrics
  const fetchPredictionData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [predictionsRes, metricsRes, distributionRes] = await Promise.all([
        fetch(`/api/v3/predictions/with-confidence?timeRange=${timeRange}`),
        fetch("/api/v3/predictions/confidence-metrics"),
        fetch("/api/v3/predictions/confidence-distribution"),
      ]);

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setConfidenceMetrics(metricsData);
      }

      if (distributionRes.ok) {
        const distributionData = await distributionRes.json();
        setConfidenceDistribution(distributionData);
      }
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchPredictionData();
    const interval = setInterval(fetchPredictionData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPredictionData]);

  // Get confidence level styling
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.95)
      return {
        level: "EXCEPTIONAL",
        color: "text-purple-600",
        bg: "bg-purple-100",
        border: "border-purple-200",
      };
    if (confidence >= 0.9)
      return {
        level: "EXCELLENT",
        color: "text-green-600",
        bg: "bg-green-100",
        border: "border-green-200",
      };
    if (confidence >= 0.8)
      return {
        level: "HIGH",
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-200",
      };
    if (confidence >= 0.7)
      return {
        level: "GOOD",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        border: "border-yellow-200",
      };
    if (confidence >= 0.6)
      return {
        level: "MODERATE",
        color: "text-orange-600",
        bg: "bg-orange-100",
        border: "border-orange-200",
      };
    return {
      level: "LOW",
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
    };
  };

  // High confidence predictions
  const highConfidencePredictions = useMemo(() => {
    return predictions.filter((p) => p.confidence_score >= confidenceThreshold);
  }, [predictions, confidenceThreshold]);

  // Confidence trend chart data
  const confidenceTrendData = useMemo(() => {
    if (!predictions.length) return null;

    const sortedPredictions = [...predictions].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return {
      labels: sortedPredictions.map((p) =>
        new Date(p.timestamp).toLocaleTimeString(),
      ),
      datasets: [
        {
          label: "Confidence Score",
          data: sortedPredictions.map((p) => p.confidence_score * 100),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Model Agreement",
          data: sortedPredictions.map((p) => p.model_agreement * 100),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Quantum Fidelity",
          data: sortedPredictions.map((p) => p.quantum_fidelity * 100),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [predictions]);

  // Confidence distribution chart
  const confidenceDistributionData = useMemo(() => {
    if (!confidenceDistribution) return null;

    return {
      labels: confidenceDistribution.confidence_bins.map(
        (bin) => `${(bin * 100).toFixed(0)}%`,
      ),
      datasets: [
        {
          label: "Frequency",
          data: confidenceDistribution.frequency,
          backgroundColor: "rgba(99, 102, 241, 0.6)",
          yAxisID: "y",
        },
        {
          label: "Accuracy",
          data: confidenceDistribution.accuracy_by_bin.map((acc) => acc * 100),
          type: "line" as const,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          yAxisID: "y1",
        },
      ],
    };
  }, [confidenceDistribution]);

  // Uncertainty visualization data
  const uncertaintyScatterData = useMemo(() => {
    if (!predictions.length) return null;

    return {
      datasets: [
        {
          label: "High Confidence",
          data: predictions
            .filter((p) => p.confidence_score >= 0.8)
            .map((p) => ({
              x: p.confidence_score * 100,
              y: (p.uncertainty_bounds[1] - p.uncertainty_bounds[0]) * 100,
            })),
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          pointRadius: 6,
        },
        {
          label: "Medium Confidence",
          data: predictions
            .filter(
              (p) => p.confidence_score >= 0.6 && p.confidence_score < 0.8,
            )
            .map((p) => ({
              x: p.confidence_score * 100,
              y: (p.uncertainty_bounds[1] - p.uncertainty_bounds[0]) * 100,
            })),
          backgroundColor: "rgba(251, 191, 36, 0.7)",
          pointRadius: 6,
        },
        {
          label: "Low Confidence",
          data: predictions
            .filter((p) => p.confidence_score < 0.6)
            .map((p) => ({
              x: p.confidence_score * 100,
              y: (p.uncertainty_bounds[1] - p.uncertainty_bounds[0]) * 100,
            })),
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          pointRadius: 6,
        },
      ],
    };
  }, [predictions]);

  // Model contribution radar chart
  const modelContributionData = useMemo(() => {
    if (!selectedPrediction?.model_weights) return null;

    const models = Object.keys(selectedPrediction.model_weights);
    const weights = Object.values(selectedPrediction.model_weights);

    return {
      labels: models.map((name) => name.replace("_", " ").toUpperCase()),
      datasets: [
        {
          label: "Model Weights",
          data: weights.map((w) => w * 100),
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(99, 102, 241, 1)",
        },
      ],
    };
  }, [selectedPrediction]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading confidence analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Confidence Analysis
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time prediction confidence and uncertainty visualization
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchPredictionData} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {confidenceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overall Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(confidenceMetrics.overall_confidence * 100).toFixed(1)}%
              </div>
              <Progress
                value={confidenceMetrics.overall_confidence * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Average prediction confidence
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Model Consensus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(confidenceMetrics.model_consensus * 100).toFixed(1)}%
              </div>
              <Progress
                value={confidenceMetrics.model_consensus * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inter-model agreement
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Calibration Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(confidenceMetrics.calibration_score * 100).toFixed(1)}%
              </div>
              <Progress
                value={confidenceMetrics.calibration_score * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Confidence calibration quality
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Coverage Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(confidenceMetrics.coverage_probability * 100).toFixed(1)}%
              </div>
              <Progress
                value={confidenceMetrics.coverage_probability * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Prediction interval accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Confidence Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
          <TabsTrigger value="predictions">High Confidence</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
        </TabsList>

        {/* Confidence Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Real-time Confidence Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confidenceTrendData && (
                <div className="h-80">
                  <Line
                    data={confidenceTrendData}
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

        {/* Confidence Distribution */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Confidence Distribution & Calibration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confidenceDistributionData && (
                <div className="h-80">
                  <Bar
                    data={confidenceDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          type: "linear",
                          display: true,
                          position: "left",
                          title: {
                            display: true,
                            text: "Frequency",
                          },
                        },
                        y1: {
                          type: "linear",
                          display: true,
                          position: "right",
                          title: {
                            display: true,
                            text: "Accuracy (%)",
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
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

        {/* Uncertainty Analysis */}
        <TabsContent value="uncertainty">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Confidence vs Uncertainty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uncertaintyScatterData && (
                <div className="h-80">
                  <Scatter
                    data={uncertaintyScatterData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `Confidence: ${context.parsed.x.toFixed(1)}%, Uncertainty: ${context.parsed.y.toFixed(1)}%`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Confidence Score (%)",
                          },
                          min: 0,
                          max: 100,
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Uncertainty Range (%)",
                          },
                          min: 0,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* High Confidence Predictions */}
        <TabsContent value="predictions">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                High Confidence Predictions
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Threshold:</span>
                <select
                  value={confidenceThreshold}
                  onChange={(e) =>
                    setConfidenceThreshold(Number(e.target.value))
                  }
                  className="px-3 py-1 border rounded"
                >
                  <option value={0.95}>95%</option>
                  <option value={0.9}>90%</option>
                  <option value={0.85}>85%</option>
                  <option value={0.8}>80%</option>
                  <option value={0.75}>75%</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {highConfidencePredictions.map((prediction) => {
                const confidenceLevel = getConfidenceLevel(
                  prediction.confidence_score,
                );
                return (
                  <Card
                    key={prediction.prediction_id}
                    className={`${confidenceLevel.border} ${confidenceLevel.bg} cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setSelectedPrediction(prediction)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${confidenceLevel.color} ${confidenceLevel.bg}`}
                          >
                            {confidenceLevel.level}
                          </Badge>
                          <span className="font-medium">
                            {prediction.context.sport} -{" "}
                            {prediction.context.event_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(
                              prediction.timestamp,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Prediction</p>
                          <p className="text-lg font-bold text-gray-900">
                            {prediction.final_prediction.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-lg font-bold text-gray-900">
                            {(prediction.confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Model Agreement
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {(prediction.model_agreement * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Uncertainty Range
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            [{prediction.uncertainty_bounds[0].toFixed(2)},{" "}
                            {prediction.uncertainty_bounds[1].toFixed(2)}]
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress
                          value={prediction.confidence_score * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Detailed Analysis */}
        <TabsContent value="analysis">
          {selectedPrediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Contribution Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gauge className="w-5 h-5 mr-2 text-purple-600" />
                    Model Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {modelContributionData && (
                    <div className="h-64">
                      <Radar
                        data={modelContributionData}
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

              {/* Prediction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Prediction Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Final Prediction
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedPrediction.final_prediction.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Quantum Fidelity
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          {(selectedPrediction.quantum_fidelity * 100).toFixed(
                            1,
                          )}
                          %
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Prediction Interval
                      </p>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-center font-mono">
                          [
                          {selectedPrediction.prediction_interval[0].toFixed(3)}
                          ,{" "}
                          {selectedPrediction.prediction_interval[1].toFixed(3)}
                          ]
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Processing Time
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(selectedPrediction.processing_time * 1000).toFixed(1)}
                        ms
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Context
                      </p>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {selectedPrediction.context.sport}
                        </Badge>
                        <Badge variant="outline">
                          {selectedPrediction.context.event_type}
                        </Badge>
                        <Badge variant="outline">
                          {selectedPrediction.context.market_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  Select a prediction from the High Confidence tab to view
                  detailed analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedConfidenceVisualizer;
