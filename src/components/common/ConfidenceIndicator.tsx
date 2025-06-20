import React from 'react';
import Tooltip from '@mui/material/Tooltip';

interface ConfidenceIndicatorProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
}

const getConfidenceColor = (value: number): string => {
  if (value >= 0.8) return 'bg-green-500';
  if (value >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getSizeClasses = (size: 'small' | 'medium' | 'large'): string => {
  switch (size) {
    case 'small':
      return 'w-2 h-2';
    case 'large':
      return 'w-4 h-4';
    default:
      return 'w-3 h-3';
  }
};

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  value,
  size = 'medium',
}) => {
  const color = getConfidenceColor(value);
  const sizeClasses = getSizeClasses(size);

  return (
    <Tooltip title={`${Math.round(value * 100)}% Confidence`}>
      <div
        aria-label={`Confidence level: ${Math.round(value * 100)}%`}
        className={`${sizeClasses} ${color} rounded-full transition-colors duration-300`}
        role="status"
      />
    </Tooltip>
  );
};
