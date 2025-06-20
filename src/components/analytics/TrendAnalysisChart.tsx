import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';

const TrendAnalysisChart: React.FC = () => {
  const predictions = usePredictionStore(state => state.getLatestPredictions());
  // Collect pattern anomalies
  const anomalies = predictions.flatMap(p => p.analytics?.patterns?.inefficiencies || []);
  return (
    <div>
      <h3>Trend Analysis</h3>
      <ul>
        {anomalies.map((a, i) => (
          <li key={i}>{a.type} {a.detected ? 'Detected' : 'Not Detected'}</li>
        ))}
      </ul>
    </div>
  );
};
export default TrendAnalysisChart;
