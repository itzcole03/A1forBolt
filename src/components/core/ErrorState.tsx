import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
        p: 3,
      }}
    >
      <ErrorIcon color="error" sx={{ fontSize: 48 }} />
      <Typography align="center" color="error" variant="h6">
        {message}
      </Typography>
      {onRetry && (
        <Button color="primary" sx={{ mt: 2 }} variant="contained" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default React.memo(ErrorState);
