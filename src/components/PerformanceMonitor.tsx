import React, { useState, useEffect } from "react";
import { Activity, Clock, Zap, AlertCircle } from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "error";
  threshold: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: PerformanceMetric[] = [
        {
          name: "Response Time",
          value: Math.random() * 200 + 50,
          unit: "ms",
          status: "good",
          threshold: 200,
        },
        {
          name: "Memory Usage",
          value: Math.random() * 40 + 30,
          unit: "%",
          status: "good",
          threshold: 80,
        },
        {
          name: "API Calls/min",
          value: Math.random() * 100 + 50,
          unit: "req",
          status: "good",
          threshold: 200,
        },
        {
          name: "ML Predictions/min",
          value: Math.random() * 20 + 10,
          unit: "pred",
          status: "good",
          threshold: 50,
        },
      ];

      // Update status based on thresholds
      newMetrics.forEach((metric) => {
        if (metric.value > metric.threshold * 0.9) {
          metric.status = "error";
        } else if (metric.value > metric.threshold * 0.7) {
          metric.status = "warning";
        }
      });

      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <Zap className="w-3 h-3" />;
      case "warning":
        return <Clock className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {metric.name}
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {metric.value.toFixed(0)}
                  {metric.unit}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
