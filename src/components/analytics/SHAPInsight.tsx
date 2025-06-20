import React from 'react';

interface SHAPInsightProps {
  modelName: string;
  shapData: Record<string, number>;
}

export const SHAPInsight: React.FC<SHAPInsightProps> = ({ modelName, shapData }) => {
  return (
    <div className="shap-insight border p-2 m-2 rounded bg-white shadow">
      <h4 className="font-semibold">{modelName} SHAP Feature Importance</h4>
      <ul>
        {Object.entries(shapData).map(([feature, value]) => (
          <li key={feature}>
            {feature}: {value.toFixed(3)}
          </li>
        ))}
      </ul>
    </div>
  );
};
