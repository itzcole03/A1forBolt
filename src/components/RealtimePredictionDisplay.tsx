import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimePredictions } from '../hooks/useRealtimePredictions';
import { usePredictions } from '../hooks/usePredictions';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ShapValueDisplay } from './ShapValueDisplay';

interface RealtimePredictionDisplayProps {
  predictionId: string;
  className?: string;
}

export function RealtimePredictionDisplay({
  predictionId,
  className = '',
}: RealtimePredictionDisplayProps) {
  const { isConnected, isConnecting, lastMessageTimestamp, isStale } = useRealtimePredictions({
    channels: ['predictions'],
    onError: error => {
      console.error('WebSocket error:', error);
    },
  });

  const { getPrediction, getConfidenceColor } = usePredictions();
  const prediction = getPrediction(predictionId);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!prediction) {
    return (
      <div className={`p-4 rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Loading prediction...</span>
          {isConnecting && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${className}`}
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Real-time Prediction</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
            {Math.round(prediction.confidence * 100)}% Confidence
          </span>
          <ConfidenceIndicator value={prediction.confidence} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Prediction Value */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Predicted Value</span>
          <span className="text-xl font-bold">{prediction.value.toFixed(2)}</span>
        </div>

        {/* SHAP Values */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Feature Importance
          </h4>
          <div className="space-y-2">
            {prediction.factors.map(factor => (
              <ShapValueDisplay
                key={factor.name}
                name={factor.name}
                value={factor.impact}
                weight={factor.weight}
              />
            ))}
          </div>
        </div>

        {/* Connection Status and Timestamp */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isStale ? 'text-red-500' : 'text-green-500'}`}>
              {isStale ? 'Stale' : 'Live'}
            </span>
            <span className="text-gray-500">
              Last update: {formatTimestamp(lastMessageTimestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
