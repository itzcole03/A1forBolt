import React from 'react';
import { motion } from 'framer-motion';
import { formatPercentage, formatCurrency } from '../../utils/formatters';

interface ModelMetrics {
  winRate: number;
  roi: number;
  totalBets: number;
  profitLoss: number;
  averageConfidence: number;
  accuracy: number;
  precision: number;
  recall: number;
}

interface ModelPerformanceProps {
  metrics: ModelMetrics;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ metrics }) => {
  const { winRate, roi, totalBets, profitLoss, averageConfidence, accuracy, precision, recall } =
    metrics;

  const metricsList = [
    { label: 'Win Rate', value: formatPercentage(winRate), color: 'text-green-500' },
    { label: 'ROI', value: formatPercentage(roi), color: 'text-blue-500' },
    { label: 'Total Bets', value: totalBets.toString(), color: 'text-purple-500' },
    {
      label: 'Profit/Loss',
      value: formatCurrency(profitLoss),
      color: profitLoss >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Avg Confidence',
      value: formatPercentage(averageConfidence),
      color: 'text-yellow-500',
    },
    { label: 'Accuracy', value: formatPercentage(accuracy), color: 'text-indigo-500' },
    { label: 'Precision', value: formatPercentage(precision), color: 'text-pink-500' },
    { label: 'Recall', value: formatPercentage(recall), color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {metricsList.map((metric, index) => (
          <motion.div
            key={metric.label}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
            <div className={`text-lg font-semibold ${metric.color}`}>{metric.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
