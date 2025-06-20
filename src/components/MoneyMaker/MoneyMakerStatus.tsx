import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import { EngineStatus } from './types';

interface MoneyMakerStatusProps {
  status: EngineStatus;
  lastUpdate: string;
  isConnected: boolean;
}

export const MoneyMakerStatus: React.FC<MoneyMakerStatusProps> = ({
  status,
  lastUpdate,
  isConnected,
}) => {
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  return (
    <Box className="status-section mb-8">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">Engine Status</Typography>
        <Chip
          color={isConnected ? 'success' : 'error'}
          label={isConnected ? 'Connected' : 'Disconnected'}
          size="small"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              AI Confidence
            </Typography>
            <Typography className="text-green-500" variant="h4">
              {formatNumber(status.aiConfidence)}%
            </Typography>
          </Box>
        </Grid>

        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              Expected Payout
            </Typography>
            <Typography className="text-blue-500" variant="h4">
              ${formatNumber(status.expectedPayout)}
            </Typography>
          </Box>
        </Grid>

        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              Win Probability
            </Typography>
            <Typography className="text-purple-500" variant="h4">
              {formatNumber(status.winProbability)}%
            </Typography>
          </Box>
        </Grid>

        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              Kelly Signal
            </Typography>
            <Typography className="text-orange-500" variant="h4">
              {formatNumber(status.kellySignal)}x
            </Typography>
          </Box>
        </Grid>

        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              Market Edge
            </Typography>
            <Typography className="text-red-500" variant="h4">
              {formatNumber(status.marketEdge)}%
            </Typography>
          </Box>
        </Grid>

        <Grid item md={4} sm={6} xs={12}>
          <Box className="status-card p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Typography color="textSecondary" variant="subtitle2">
              ROI Projection
            </Typography>
            <Typography className="text-teal-500" variant="h4">
              {formatNumber(status.roiProjection)}%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography className="mt-4 block text-right" color="textSecondary" variant="caption">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </Typography>
    </Box>
  );
};
