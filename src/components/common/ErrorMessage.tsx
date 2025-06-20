import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  error: Error | unknown;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
      }}
    >
      <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
      <Typography gutterBottom color="error" variant="h6">
        Error
      </Typography>
      <Typography paragraph color="text.secondary" variant="body1">
        {errorMessage}
      </Typography>
      {onRetry && (
        <Button color="primary" sx={{ mt: 2 }} variant="contained" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
};
