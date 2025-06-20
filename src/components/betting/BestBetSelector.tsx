import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Prediction {
  id: string;
  timestamp: string;
  prediction: number;
  confidence: number;
  shapValues: Record<string, number>;
  kellyValue: number;
  marketEdge: number;
}

interface BestBetSelectorProps {
  predictions: Prediction[];
}

const BestBetSelector: React.FC<BestBetSelectorProps> = ({ predictions }) => {
  const bestBets = useMemo(() => {
    if (!predictions.length) return [];

    // Score each prediction based on multiple factors
    const scoredPredictions = predictions.map(pred => {
      const confidenceScore = pred.confidence * 0.4;
      const edgeScore = pred.marketEdge * 0.3;
      const kellyScore = pred.kellyValue * 0.3;

      // Calculate feature importance score from SHAP values
      const shapScore =
        Object.values(pred.shapValues).reduce((sum, val) => sum + Math.abs(val), 0) /
        Object.keys(pred.shapValues).length;

      const totalScore = confidenceScore + edgeScore + kellyScore + shapScore * 0.2;

      return {
        ...pred,
        score: totalScore,
      };
    });

    // Sort by score and return top 3
    return scoredPredictions.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [predictions]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {bestBets.map((bet, index) => (
        <motion.div
          key={bet.id}
          animate={{ opacity: 1, y: 0 }}
          className="premium-input-container p-4"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-semibold">
                Prediction: {(bet.prediction * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                {new Date(bet.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(bet.score)}`}>
                Score: {(bet.score * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                Confidence: {(bet.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Edge</div>
              <div className="font-semibold">{(bet.marketEdge * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Kelly</div>
              <div className="font-semibold">{(bet.kellyValue * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">SHAP</div>
              <div className="font-semibold">
                {(
                  (Object.values(bet.shapValues).reduce((sum, val) => sum + Math.abs(val), 0) /
                    Object.keys(bet.shapValues).length) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Key Features</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(bet.shapValues)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .slice(0, 3)
                .map(([feature, value]) => (
                  <span
                    key={feature}
                    className={`px-2 py-1 rounded-full text-xs ${
                      value > 0 ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {feature}: {value.toFixed(2)}
                  </span>
                ))}
            </div>
          </div>
        </motion.div>
      ))}

      {!bestBets.length && (
        <div className="text-center text-gray-500 py-8">
          No predictions available. Generate some predictions to see the best bets.
        </div>
      )}
    </div>
  );
};

export default React.memo(BestBetSelector);
