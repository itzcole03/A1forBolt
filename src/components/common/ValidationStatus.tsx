import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface ValidationStatusProps {
  status: 'valid' | 'invalid' | 'warning';
  message: string;
  showIcon?: boolean;
}

const getStatusConfig = (status: 'valid' | 'invalid' | 'warning') => {
  switch (status) {
    case 'valid':
      return {
        color: 'success' as const,
        icon: <CheckCircleIcon />,
      };
    case 'invalid':
      return {
        color: 'error' as const,
        icon: <ErrorIcon />,
      };
    case 'warning':
      return {
        color: 'warning' as const,
        icon: <WarningIcon />,
      };
  }
};

export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  status,
  message,
  showIcon = true,
}) => {
  const config = getStatusConfig(status);

  return (
    <Tooltip title={message}>
      <Chip
        className="transition-colors duration-300"
        color={config.color}
        icon={showIcon ? config.icon : undefined}
        label={message}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};
