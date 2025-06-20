import React from 'react';
import { AnalyticsMetrics } from '../types/betting';
import { motion } from 'framer-motion';

export interface ModelPerformanceProps {
  analytics: AnalyticsMetrics;
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ analytics }) => {
  const metrics = [
    {
      label: 'Win Rate',
      value: `${(analytics.winRate * 100).toFixed(1)}%`,
      color: analytics.winRate >= 0.55 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'ROI',
      value: `${(analytics.roi * 100).toFixed(1)}%`,
      color: analytics.roi > 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'Total Bets',
      value: analytics.totalBets.toString(),
      color: 'text-blue-600',
    },
    {
      label: 'Confidence',
      value: `${(analytics.confidence * 100).toFixed(1)}%`,
      color: analytics.confidence >= 0.7 ? 'text-green-600' : 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
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
