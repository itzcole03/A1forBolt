import React, { useMemo } from 'react';
import { PredictionData } from '../types/betting';
import { StrategyRecommendation } from '../types/core';
import { motion } from 'framer-motion';

export interface MLInsight {
  factor: string;
  impact: number;
  confidence: number;
  description: string;
}

export interface MLFactorVizProps {
  playerId: string | null;
  metric: string | null;
  prediction?: PredictionData;
  strategy?: StrategyRecommendation;
}

const MLFactorViz: React.FC<MLFactorVizProps> = ({ playerId, metric, prediction, strategy }) => {
  const insights: MLInsight[] = useMemo(() => {
    if (!playerId || !metric || !prediction || !strategy) {
      return [];
    }

    return [
      {
        factor: 'Historical Performance',
        impact: strategy.confidence || 0,
        confidence: prediction.confidence,
        description: `Based on ${playerId}'s historical ${metric} performance`,
      },
      {
        factor: 'Market Trends',
        impact: strategy.expectedValue || 0,
        confidence: prediction.confidence * 0.9,
        description: 'Current market movement and betting patterns',
      },
      {
        factor: 'Player Condition',
        impact: 0.75,
        confidence: 0.85,
        description: 'Recent performance and health status',
      },
    ];
  }, [playerId, metric, prediction, strategy]);

  const getImpactColor = (impact: number) => {
    if (impact >= 0.7) return 'bg-green-500';
    if (impact >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!playerId || !metric) {
    return (
      <div className="p-4 text-gray-500">Select a player and metric to view ML factor analysis</div>
    );
  }

  if (!prediction || !strategy) {
    return <div className="p-4 text-gray-500">Loading ML factor analysis...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">ML Factor Analysis</h3>
      <div className="space-y-6">
        {insights.map((insight: MLInsight, index: number) => (
          <motion.div
            key={insight.factor}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{insight.factor}</h4>
              <span className={`text-sm ${getConfidenceColor(insight.confidence)}`}>
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <motion.div
                animate={{ width: `${insight.impact * 100}%` }}
                className={`h-2.5 rounded-full ${getImpactColor(insight.impact)}`}
                initial={{ width: 0 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(MLFactorViz);
