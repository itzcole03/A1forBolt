import React from 'react';
import { motion } from 'framer-motion';
import { formatPercentage, formatDate, formatTimeAgo } from '../../utils/formatters';
import type { Prediction } from '../../services/predictionService';

interface LivePredictionsProps {
  predictions: Prediction[];
}

export const LivePredictions: React.FC<LivePredictionsProps> = ({ predictions }) => {
  // Sort predictions by timestamp, most recent first
  const sortedPredictions = [...predictions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusColor = (status: Prediction['status']) => {
    switch (status) {
      case 'won':
        return 'text-green-500';
      case 'lost':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="space-y-4">
      {sortedPredictions.map(prediction => (
        <motion.div
          key={prediction.id}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, x: -20 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{prediction.id}</h3>
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Prediction: </span>
                  <span className="font-medium">{formatPercentage(prediction.prediction)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Confidence: </span>
                  <span className="font-medium">{formatPercentage(prediction.confidence)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Time: </span>
                  <span className="font-medium">
                    {formatTimeAgo(new Date(prediction.timestamp))}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-yellow-500">
                {/* Status not available in this Prediction type */}
                LIVE
              </div>
              <div className="mt-2">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
