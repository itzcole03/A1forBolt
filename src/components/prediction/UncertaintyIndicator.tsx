import React from 'react';
import { Tooltip } from '../ui/UnifiedUI';

interface UncertaintyIndicatorProps {
  value: number;
  className?: string;
}

export const UncertaintyIndicator: React.FC<UncertaintyIndicatorProps> = ({
  value,
  className = '',
}) => {
  const getColor = (uncertainty: number) => {
    if (uncertainty <= 0.1) return 'bg-green-500';
    if (uncertainty <= 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = (uncertainty: number) => {
    if (uncertainty <= 0.1) return 'Low Uncertainty';
    if (uncertainty <= 0.2) return 'Medium Uncertainty';
    return 'High Uncertainty';
  };

  return (
    <Tooltip content={`${(value * 100).toFixed(1)}% Uncertainty`}>
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getColor(value)}`} />
        <span className="text-xs text-gray-600">{getLabel(value)}</span>
      </div>
    </Tooltip>
  );
};
