import React from 'react';

interface ConfidenceIndicatorProps {
  value: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({ value, size = 'md' }: ConfidenceIndicatorProps) {
  const getColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    if (value >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-1 w-16';
      case 'lg':
        return 'h-3 w-32';
      default:
        return 'h-2 w-24';
    }
  };

  return (
    <div className={`${getSize(size)} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
      <div
        className={`${getColor(value)} h-full transition-all duration-300 ease-in-out`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
}
