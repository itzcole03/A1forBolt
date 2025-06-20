import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  const getConfidenceColor = (value: number): string => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (value: number): string => {
    if (value >= 0.8) return 'High';
    if (value >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Confidence</span>
        <span className="text-sm font-medium">{getConfidenceLabel(confidence)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getConfidenceColor(confidence)} transition-all duration-500`}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default React.memo(ConfidenceIndicator);
