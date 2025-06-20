import React from 'react';
import { motion } from 'framer-motion';
import { formatPercentage, formatCurrency } from '../../utils/formatters';
import type { Prediction } from '../../services/predictionService';

interface BettingOpportunitiesProps {
  predictions: Prediction[];
}

export const BettingOpportunities: React.FC<BettingOpportunitiesProps> = ({ predictions }) => {
  // Sort predictions by market edge
  const sortedPredictions = [...predictions].sort(
    (a, b) => (b.marketEdge ?? 0) - (a.marketEdge ?? 0)
  );

  return (
    <div className="space-y-4">
      {sortedPredictions.map(prediction => (
        <motion.div
          key={prediction.id}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{prediction.id}</h3>
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Market Edge: </span>
                  <span className="font-medium">
                    {formatPercentage(prediction.marketEdge ?? 0)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Kelly Value: </span>
                  <span className="font-medium">{prediction.kellyValue}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Confidence: </span>
                  <span className="font-medium">{formatPercentage(prediction.confidence)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {/* Odds, stake, potentialProfit not available in this Prediction type */}
                {/* Add more fields if needed */}
              </div>
              <button className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Place Bet
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
