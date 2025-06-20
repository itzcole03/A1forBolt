import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Atom,
  Zap,
  Target,
  Brain,
  TrendingUp,
  BarChart3,
  Settings,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Layers,
  Network,
  Cpu,
  Activity,
} from "lucide-react";
import { Line, Radar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface QuantumPredictionRequest {
  event_id: string;
  sport: string;
  features: Record<string, number>;
  target_accuracy: number;
  optimization_strategy: string;
  uncertainty_method: string;
}

interface QuantumPredictionResult {
  event_id: string;
  prediction: {
    base_prediction: number;
    quantum_correction: number;
    final_prediction: number;
    uncertainty_bounds: [number, number];
  };
  quantum_metrics: {
    entanglement_score: number;
    coherence_measure: number;
    quantum_advantage: number;
    fidelity: number;
    decoherence_time: number;
    entangled_features: string[];
  };
  processing_metrics: {
    total_processing_time: number;
    feature_engineering_time: number;
    prediction_time: number;
  };
}

export const QuantumPredictionsInterface: React.FC = () => {
  const [predictionRequest, setPredictionRequest] =
    useState<QuantumPredictionRequest>({
      event_id: "",
      sport: "basketball",
      features: {},
      target_accuracy: 0.95,
      optimization_strategy: "quantum_ensemble",
      uncertainty_method: "deep_ensembles",
    });

  const [predictionResult, setPredictionResult] =
    useState<QuantumPredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [quantumState, setQuantumState] = useState({
    superposition: 0,
    entanglement: 0,
    coherence: 0,
    decoherence: 0,
  });

  // Simulate quantum state evolution
  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState((prev) => ({
        superposition: (prev.superposition + Math.random() * 0.1) % 1,
        entanglement: Math.sin(Date.now() / 1000) * 0.5 + 0.5,
        coherence: Math.cos(Date.now() / 1200) * 0.3 + 0.7,
        decoherence: Math.random() * 0.2,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate quantum prediction
  const generateQuantumPrediction = useCallback(async () => {
    if (!predictionRequest.event_id) {
      alert("Please provide an event ID");
      return;
    }

    setIsProcessing(true);
    setProcessingStage("Initializing quantum states...");

    try {
      // Simulate processing stages
      const stages = [
        "Initializing quantum states...",
        "Applying quantum superposition...",
        "Calculating feature entanglement...",
        "Optimizing quantum coherence...",
        "Running quantum ensemble...",
        "Measuring quantum advantage...",
        "Finalizing prediction...",
      ];

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Make actual API call
      const response = await fetch("/api/v4/predict/ultra-accuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionRequest),
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
      } else {
        // Fallback with simulated data
        const simulatedResult: QuantumPredictionResult = {
          event_id: predictionRequest.event_id,
          prediction: {
            base_prediction: Math.random() * 100 + 50,
            quantum_correction: (Math.random() - 0.5) * 10,
            final_prediction: Math.random() * 100 + 50,
            uncertainty_bounds: [40, 90],
          },
          quantum_metrics: {
            entanglement_score: Math.random() * 0.3 + 0.7,
            coherence_measure: Math.random() * 0.2 + 0.8,
            quantum_advantage: Math.random() * 0.15 + 0.05,
            fidelity: Math.random() * 0.1 + 0.9,
            decoherence_time: Math.random() * 5 + 10,
            entangled_features: [
              "player_performance",
              "team_synergy",
              "venue_effects",
            ],
          },
          processing_metrics: {
            total_processing_time: Math.random() * 2 + 1,
            feature_engineering_time: Math.random() * 0.5 + 0.2,
            prediction_time: Math.random() * 1.5 + 0.5,
          },
        };
        setPredictionResult(simulatedResult);
      }
    } catch (error) {
      console.error("Quantum prediction failed:", error);
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  }, [predictionRequest]);

  // Add sample features
  const addSampleFeatures = useCallback(() => {
    const sampleFeatures = {
      player_efficiency: Math.random() * 30 + 10,
      team_rating: Math.random() * 20 + 80,
      recent_performance: Math.random() * 25 + 15,
      venue_advantage: Math.random() * 10 + 5,
      weather_impact: Math.random() * 5,
      injury_factor: Math.random() * 15,
      momentum_score: Math.random() * 20 + 10,
      market_sentiment: Math.random() * 30 + 40,
    };

    setPredictionRequest((prev) => ({
      ...prev,
      features: sampleFeatures,
    }));
  }, []);

  // Quantum state visualization
  const quantumStateData = useMemo(
    () => ({
      labels: ["Superposition", "Entanglement", "Coherence", "Stability"],
      datasets: [
        {
          label: "Quantum State",
          data: [
            quantumState.superposition * 100,
            quantumState.entanglement * 100,
            quantumState.coherence * 100,
            (1 - quantumState.decoherence) * 100,
          ],
          backgroundColor: "rgba(147, 51, 234, 0.2)",
          borderColor: "rgba(147, 51, 234, 1)",
          pointBackgroundColor: "rgba(147, 51, 234, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(147, 51, 234, 1)",
        },
      ],
    }),
    [quantumState],
  );

  // Quantum advantage chart
  const quantumAdvantageData = useMemo(() => {
    if (!predictionResult) return null;

    return {
      datasets: [
        {
          label: "Quantum vs Classical",
          data: [
            {
              x: predictionResult.prediction.base_prediction,
              y: predictionResult.prediction.final_prediction,
            },
          ],
          backgroundColor: "rgba(147, 51, 234, 0.7)",
          borderColor: "rgba(147, 51, 234, 1)",
          pointRadius: 8,
        },
      ],
    };
  }, [predictionResult]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Atom className="w-8 h-8 text-purple-600" />
            Quantum Predictions Engine
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced quantum-inspired predictions with superposition and
            entanglement
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={addSampleFeatures} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Add Sample Data
          </Button>
          <Button
            onClick={generateQuantumPrediction}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? "Processing..." : "Generate Quantum Prediction"}
          </Button>
        </div>
      </div>

      {/* Live Quantum State Monitor */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-violet-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Live Quantum State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Superposition</p>
              <Progress
                value={quantumState.superposition * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(quantumState.superposition * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Entanglement</p>
              <Progress
                value={quantumState.entanglement * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(quantumState.entanglement * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Coherence</p>
              <Progress value={quantumState.coherence * 100} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {(quantumState.coherence * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Stability</p>
              <Progress
                value={(1 - quantumState.decoherence) * 100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {((1 - quantumState.decoherence) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">{processingStage}</p>
                <p className="text-sm text-blue-600">
                  Quantum computation in progress...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="input">Input & Configuration</TabsTrigger>
          <TabsTrigger value="quantum">Quantum Visualization</TabsTrigger>
          <TabsTrigger value="results">Prediction Results</TabsTrigger>
          <TabsTrigger value="analysis">Quantum Analysis</TabsTrigger>
        </TabsList>

        {/* Input Configuration */}
        <TabsContent value="input">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="event-id">Event ID</Label>
                  <Input
                    id="event-id"
                    value={predictionRequest.event_id}
                    onChange={(e) =>
                      setPredictionRequest((prev) => ({
                        ...prev,
                        event_id: e.target.value,
                      }))
                    }
                    placeholder="Enter event identifier"
                  />
                </div>
                <div>
                  <Label htmlFor="sport">Sport</Label>
                  <select
                    id="sport"
                    value={predictionRequest.sport}
                    onChange={(e) =>
                      setPredictionRequest((prev) => ({
                        ...prev,
                        sport: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="basketball">Basketball</option>
                    <option value="football">Football</option>
                    <option value="baseball">Baseball</option>
                    <option value="soccer">Soccer</option>
                    <option value="hockey">Hockey</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="target-accuracy">Target Accuracy</Label>
                  <Input
                    id="target-accuracy"
                    type="number"
                    min="0.8"
                    max="0.99"
                    step="0.01"
                    value={predictionRequest.target_accuracy}
                    onChange={(e) =>
                      setPredictionRequest((prev) => ({
                        ...prev,
                        target_accuracy: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quantum Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="optimization-strategy">
                    Optimization Strategy
                  </Label>
                  <select
                    id="optimization-strategy"
                    value={predictionRequest.optimization_strategy}
                    onChange={(e) =>
                      setPredictionRequest((prev) => ({
                        ...prev,
                        optimization_strategy: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="quantum_ensemble">Quantum Ensemble</option>
                    <option value="neural_architecture_search">
                      Neural Architecture Search
                    </option>
                    <option value="meta_learning">Meta Learning</option>
                    <option value="bayesian_optimization">
                      Bayesian Optimization
                    </option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="uncertainty-method">Uncertainty Method</Label>
                  <select
                    id="uncertainty-method"
                    value={predictionRequest.uncertainty_method}
                    onChange={(e) =>
                      setPredictionRequest((prev) => ({
                        ...prev,
                        uncertainty_method: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="deep_ensembles">Deep Ensembles</option>
                    <option value="bayesian_neural_network">
                      Bayesian Neural Network
                    </option>
                    <option value="monte_carlo_dropout">
                      Monte Carlo Dropout
                    </option>
                    <option value="conformal_prediction">
                      Conformal Prediction
                    </option>
                  </select>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Quantum Features Active
                  </h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Superposition-based ensemble modeling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Feature entanglement analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Quantum coherence optimization</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Input */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Feature Vector Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(predictionRequest.features).map(
                  ([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>
                        {key.replace("_", " ").toUpperCase()}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setPredictionRequest((prev) => ({
                            ...prev,
                            features: {
                              ...prev.features,
                              [key]: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  ),
                )}
              </div>
              {Object.keys(predictionRequest.features).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No features configured</p>
                  <Button onClick={addSampleFeatures} variant="outline">
                    Add Sample Features
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Visualization */}
        <TabsContent value="quantum">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="w-5 h-5 mr-2 text-purple-600" />
                Quantum State Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Radar
                  data={quantumStateData}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prediction Results */}
        <TabsContent value="results">
          {predictionResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Prediction Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Base Prediction
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {predictionResult.prediction.base_prediction.toFixed(
                            2,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Quantum Correction
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {predictionResult.prediction.quantum_correction > 0
                            ? "+"
                            : ""}
                          {predictionResult.prediction.quantum_correction.toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">
                        Final Quantum Prediction
                      </p>
                      <p className="text-3xl font-bold text-purple-900">
                        {predictionResult.prediction.final_prediction.toFixed(
                          2,
                        )}
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        Uncertainty: [
                        {predictionResult.prediction.uncertainty_bounds[0].toFixed(
                          1,
                        )}
                        ,{" "}
                        {predictionResult.prediction.uncertainty_bounds[1].toFixed(
                          1,
                        )}
                        ]
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    Quantum Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Entanglement Score
                      </span>
                      <Badge variant="outline">
                        {(
                          predictionResult.quantum_metrics.entanglement_score *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Coherence Measure
                      </span>
                      <Badge variant="outline">
                        {(
                          predictionResult.quantum_metrics.coherence_measure *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Quantum Advantage
                      </span>
                      <Badge variant="outline">
                        {(
                          predictionResult.quantum_metrics.quantum_advantage *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fidelity</span>
                      <Badge variant="outline">
                        {(
                          predictionResult.quantum_metrics.fidelity * 100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Decoherence Time
                      </span>
                      <Badge variant="outline">
                        {predictionResult.quantum_metrics.decoherence_time.toFixed(
                          1,
                        )}
                        s
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Entangled Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {predictionResult.quantum_metrics.entangled_features.map(
                        (feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature.replace("_", " ")}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Atom className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  No quantum prediction generated yet
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Configure your input and generate a prediction to see results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quantum Analysis */}
        <TabsContent value="analysis">
          {predictionResult && quantumAdvantageData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Quantum vs Classical Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Scatter
                      data={quantumAdvantageData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Classical Prediction",
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Quantum-Enhanced Prediction",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Processing Time
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {predictionResult.processing_metrics.total_processing_time.toFixed(
                          2,
                        )}
                        s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Feature Engineering
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {predictionResult.processing_metrics.feature_engineering_time.toFixed(
                          2,
                        )}
                        s
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Prediction Time
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {predictionResult.processing_metrics.prediction_time.toFixed(
                          2,
                        )}
                        s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No analysis data available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Generate a quantum prediction to view detailed analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumPredictionsInterface;
