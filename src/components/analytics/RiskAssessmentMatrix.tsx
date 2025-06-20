import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';

const RiskAssessmentMatrix: React.FC = () => {
  const predictions = usePredictionStore(state => state.getLatestPredictions());
  const riskCounts = predictions.reduce((acc, p) => {
    const cat = p.analytics?.risk?.riskCategory || 'unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return (
    <div>
      <h3>Risk Assessment Matrix</h3>
      <ul>
        {Object.entries(riskCounts).map(([cat, count]) => (
          <li key={cat}>{cat}: {count}</li>
        ))}
      </ul>
    </div>
  );
};
export default RiskAssessmentMatrix;
