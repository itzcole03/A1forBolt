import React from 'react';
import { Tooltip } from '../ui/UnifiedUI';

interface ShapValueBarProps {
  name: string;
  value: number;
  className?: string;
}

export const ShapValueBar: React.FC<ShapValueBarProps> = ({ name, value, className = '' }) => {
  const absValue = Math.abs(value);
  const isPositive = value > 0;
  const color = isPositive ? 'bg-green-500' : 'bg-red-500';
  const formattedName = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Tooltip content={`${value.toFixed(4)} (${isPositive ? 'Positive' : 'Negative'} Impact)`}>
      <div className={`space-y-1 ${className}`}>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">{formattedName}</span>
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {value.toFixed(4)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${Math.min(absValue * 100, 100)}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
