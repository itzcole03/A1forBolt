import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface RiskLevelIndicatorProps {
  level: 'low' | 'medium' | 'high';
  showIcon?: boolean;
}

const getRiskLevelConfig = (level: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low':
      return {
        color: 'success' as const,
        icon: <TrendingDownIcon />,
        label: 'Low Risk',
      };
    case 'medium':
      return {
        color: 'warning' as const,
        icon: <TrendingFlatIcon />,
        label: 'Medium Risk',
      };
    case 'high':
      return {
        color: 'error' as const,
        icon: <TrendingUpIcon />,
        label: 'High Risk',
      };
  }
};

export const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({
  level,
  showIcon = true,
}) => {
  const config = getRiskLevelConfig(level);

  return (
    <Tooltip title={`${config.label} - ${getRiskLevelDescription(level)}`}>
      <Chip
        className="transition-colors duration-300"
        color={config.color}
        icon={showIcon ? config.icon : undefined}
        label={config.label}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};

const getRiskLevelDescription = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'low':
      return 'High confidence, low volatility prediction';
    case 'medium':
      return 'Moderate confidence and risk level';
    case 'high':
      return 'High potential reward with increased risk';
  }
};
