import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  size?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      <Typography color="text.secondary" variant="body1">
        {message}
      </Typography>
    </Box>
  );
};

export default React.memo(LoadingState);
