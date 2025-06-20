import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';

const ShapExplanation: React.FC<{ eventId: string }> = ({ eventId }) => {
  const prediction = usePredictionStore(state => state.predictionsByEvent[eventId]);
  const shap = prediction?.analytics?.shap;
  if (!shap) return <div>No SHAP data available.</div>;
  return (
    <div>
      <h3>SHAP Feature Importances</h3>
      <ul>
        {shap.featureImportances?.map((f: any) => (
          <li key={f.feature}>{f.feature}: {f.value}</li>
        ))}
      </ul>
    </div>
  );
};
export default ShapExplanation;
