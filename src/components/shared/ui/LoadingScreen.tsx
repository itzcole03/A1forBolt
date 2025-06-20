import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: 'primary.main',
          mb: 2,
        }}
        thickness={4}
      />
      <Typography
        color="text.secondary"
        sx={{
          mt: 2,
          textAlign: 'center',
        }}
        variant="h6"
      >
        {message}
      </Typography>
    </Box>
  );
};
