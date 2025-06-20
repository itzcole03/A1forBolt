import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';

const ModelComparisonChart: React.FC = () => {
  const predictions = usePredictionStore(state => state.getLatestPredictions());
  // Group by modelId
  const byModel = predictions.reduce((acc, p) => {
    const model = p.analytics?.modelId || 'unknown';
    if (!acc[model]) acc[model] = [];
    acc[model].push(p);
    return acc;
  }, {} as Record<string, any[]>);
  return (
    <div>
      <h3>Model Comparison</h3>
      <ul>
        {Object.entries(byModel).map(([model, preds]) => (
          <li key={model}>{model}: {preds.length} predictions</li>
        ))}
      </ul>
    </div>
  );
};
export default ModelComparisonChart;
