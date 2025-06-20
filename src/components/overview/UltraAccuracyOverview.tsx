import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Brain,
  Zap,
  Atom,
  BarChart3,
  Activity,
  TrendingUp,
  Gauge,
  Eye,
  Settings,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Cpu,
  Network,
  Layers,
  Radar,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "beta" | "coming-soon";
  accuracy_boost: string;
  href: string;
  gradient: string;
  features: string[];
}

export const UltraAccuracyOverview: React.FC = () => {
  const [systemStats, setSystemStats] = useState({
    overall_accuracy: 0.94,
    models_active: 25,
    predictions_today: 1847,
    accuracy_improvement: 0.23,
  });

  const accuracyFeatures: FeatureCard[] = [
    {
      title: "Ultra ML Dashboard",
      description:
        "Real-time monitoring and optimization of prediction accuracy with cutting-edge ensemble models",
      icon: <Brain className="w-6 h-6" />,
      status: "active",
      accuracy_boost: "+15%",
      href: "#/ultra-ml-dashboard",
      gradient: "from-purple-600 to-blue-600",
      features: [
        "25+ Advanced ML Models",
        "Real-time Accuracy Tracking",
        "Intelligent Model Selection",
        "Dynamic Weight Optimization",
        "Meta-Learning Integration",
      ],
    },
    {
      title: "Confidence Visualizer",
      description:
        "Advanced prediction confidence analysis with uncertainty quantification and calibration",
      icon: <BarChart3 className="w-6 h-6" />,
      status: "active",
      accuracy_boost: "+12%",
      href: "#/confidence-visualizer",
      gradient: "from-blue-600 to-cyan-600",
      features: [
        "Uncertainty Quantification",
        "Confidence Calibration",
        "Prediction Intervals",
        "Model Agreement Analysis",
        "SHAP Explanations",
      ],
    },
    {
      title: "Real-time Monitor",
      description:
        "Continuous accuracy monitoring with automated optimization triggers and alert systems",
      icon: <Activity className="w-6 h-6" />,
      status: "active",
      accuracy_boost: "+18%",
      href: "#/accuracy-monitor",
      gradient: "from-green-600 to-emerald-600",
      features: [
        "Live Accuracy Tracking",
        "Automated Optimization",
        "Drift Detection",
        "Performance Alerts",
        "Trend Analysis",
      ],
    },
    {
      title: "Quantum Predictions",
      description:
        "Quantum-inspired prediction engine with superposition, entanglement, and coherence optimization",
      icon: <Atom className="w-6 h-6" />,
      status: "beta",
      accuracy_boost: "+25%",
      href: "#/quantum-predictions",
      gradient: "from-violet-600 to-purple-600",
      features: [
        "Quantum Superposition",
        "Feature Entanglement",
        "Coherence Optimization",
        "Decoherence Resistance",
        "Quantum Advantage",
      ],
    },
  ];

  const technicalFeatures = [
    {
      category: "Advanced Ensemble Methods",
      items: [
        "Multi-level Stacking",
        "Bayesian Model Averaging",
        "Neural Ensemble Combiners",
        "Attention-based Weighting",
        "Dynamic Selection",
      ],
    },
    {
      category: "Feature Engineering",
      items: [
        "Quantum-inspired Transformations",
        "Advanced Statistical Features",
        "Temporal Pattern Encoding",
        "Fractal Feature Extraction",
        "Information Theory Features",
      ],
    },
    {
      category: "Uncertainty Quantification",
      items: [
        "Deep Ensembles",
        "Bayesian Neural Networks",
        "Monte Carlo Dropout",
        "Conformal Prediction",
        "Distributional Regression",
      ],
    },
    {
      category: "Optimization Strategies",
      items: [
        "Bayesian Optimization",
        "Evolutionary Algorithms",
        "Neural Architecture Search",
        "Meta-Learning",
        "Reinforcement Learning",
      ],
    },
  ];

  // Animate stats on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setSystemStats({
        overall_accuracy: 0.947,
        models_active: 28,
        predictions_today: 2156,
        accuracy_improvement: 0.267,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800">Beta</Badge>;
      case "coming-soon":
        return <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Ultra-Accuracy Suite
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced machine learning and quantum-inspired prediction systems
          designed to achieve maximum accuracy in sports betting analytics
        </p>
      </div>

      {/* System Statistics */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="w-6 h-6 mr-2 text-purple-600" />
            Real-time System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(systemStats.overall_accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
              <Progress
                value={systemStats.overall_accuracy * 100}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {systemStats.models_active}
              </div>
              <p className="text-sm text-gray-600">Active Models</p>
              <Progress
                value={(systemStats.models_active / 30) * 100}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {systemStats.predictions_today.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Predictions Today</p>
              <Progress value={75} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                +{(systemStats.accuracy_improvement * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Accuracy Improvement</p>
              <Progress
                value={systemStats.accuracy_improvement * 100}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accuracyFeatures.map((feature, index) => (
          <Card
            key={index}
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => (window.location.hash = feature.href)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
            />

            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${feature.gradient} text-white`}
                >
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(feature.status)}
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    {feature.accuracy_boost}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 mb-3">
                  Key Features:
                </h4>
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full mt-4 bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white`}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.hash = feature.href;
                }}
              >
                Launch {feature.title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technical Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="w-6 h-6 mr-2 text-blue-600" />
            Advanced Technical Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Overview */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="w-6 h-6 mr-2 text-purple-600" />
            Ultra-Accuracy Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <Layers className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-800">Data Layer</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Multi-source Integration</li>
                <li>Quality Assessment</li>
                <li>Real-time Reconciliation</li>
                <li>Advanced Feature Engineering</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <Brain className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-800">ML Layer</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Ensemble Optimization</li>
                <li>Meta-Learning</li>
                <li>Uncertainty Quantification</li>
                <li>Quantum-inspired Models</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <Radar className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-800">
                  Monitoring Layer
                </h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Real-time Accuracy Tracking</li>
                <li>Performance Optimization</li>
                <li>Automated Alerts</li>
                <li>Continuous Learning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => (window.location.hash = "#/ultra-ml-dashboard")}
            >
              <Eye className="w-6 h-6 text-purple-600" />
              <span className="text-sm">Monitor Accuracy</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => (window.location.hash = "#/confidence-visualizer")}
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Analyze Confidence</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => (window.location.hash = "#/quantum-predictions")}
            >
              <Atom className="w-6 h-6 text-violet-600" />
              <span className="text-sm">Quantum Predict</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => (window.location.hash = "#/accuracy-monitor")}
            >
              <Activity className="w-6 h-6 text-green-600" />
              <span className="text-sm">Live Monitor</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraAccuracyOverview;
