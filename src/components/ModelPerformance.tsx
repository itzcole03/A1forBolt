import React from 'react';
import { ModelMetrics } from '../types/prediction';
import { motion } from 'framer-motion';

export interface ModelPerformanceProps {
  modelMetricsData: ModelMetrics; // Renamed prop
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ modelMetricsData }) => {
  const displayMetrics = [
    {
      label: 'Win Rate',
      value: `${(modelMetricsData.winRate * 100).toFixed(1)}%`,
      color: modelMetricsData.winRate >= 0.55 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'Profit Factor (ROI)',
      value: `${(modelMetricsData.profitFactor * 100).toFixed(1)}%`,
      color: modelMetricsData.profitFactor > 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'Total Predictions',
      value: modelMetricsData.totalPredictions.toString(),
      color: 'text-blue-600',
    },
    {
      label: 'Avg. Confidence',
      value: `${(modelMetricsData.averageConfidence * 100).toFixed(1)}%`,
      color: modelMetricsData.averageConfidence >= 0.7 ? 'text-green-600' : 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {displayMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ModelPerformance);
