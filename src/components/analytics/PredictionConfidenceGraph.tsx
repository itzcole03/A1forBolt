import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';

const PredictionConfidenceGraph: React.FC = () => {
  const predictions = usePredictionStore(state => state.getLatestPredictions());
  return (
    <div>
      <h3>Prediction Confidence Over Time</h3>
      <svg width="400" height="100">
        {predictions.map((p, i) => (
          <circle key={i} cx={i * 20 + 10} cy={100 - (p.confidence || 0) * 100} r={4} fill="blue" />
        ))}
      </svg>
    </div>
  );
};
export default PredictionConfidenceGraph;
