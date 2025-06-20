import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, color = 'primary' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
      }}
    >
      <CircularProgress color={color} size={size} />
    </Box>
  );
};

export default React.memo(LoadingSpinner);
