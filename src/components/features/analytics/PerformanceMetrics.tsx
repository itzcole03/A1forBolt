import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Skeleton } from '@mui/material';
import { formatPercentage } from '@/utils/formatters';

interface PerformanceMetricsProps {
  performance: {
    winRate: number;
    roi: number;
    edgeRetention: number;
    totalBets: number;
    averageOdds: number;
    profitLoss: number;
  };
  isLoading: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  performance,
  isLoading,
}) => {
  const metrics = [
    {
      label: 'Win Rate',
      value: performance.winRate,
      format: formatPercentage,
      color: performance.winRate >= 0.55 ? 'success' : 'warning',
    },
    {
      label: 'ROI',
      value: performance.roi,
      format: formatPercentage,
      color: performance.roi > 0 ? 'success' : 'error',
    },
    {
      label: 'Edge Retention',
      value: performance.edgeRetention,
      format: formatPercentage,
      color: performance.edgeRetention >= 0.7 ? 'success' : 'warning',
    },
    {
      label: 'Total Bets',
      value: performance.totalBets,
      format: (value: number) => value.toString(),
      color: 'primary',
    },
    {
      label: 'Average Odds',
      value: performance.averageOdds,
      format: (value: number) => value.toFixed(2),
      color: 'primary',
    },
    {
      label: 'Profit/Loss',
      value: performance.profitLoss,
      format: (value: number) => `$${value.toFixed(2)}`,
      color: performance.profitLoss > 0 ? 'success' : 'error',
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {metrics.map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton height={40} sx={{ mt: 2 }} variant="rectangular" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent>
            <Typography gutterBottom color="text.secondary" variant="subtitle2">
              {metric.label}
            </Typography>
            <Typography gutterBottom component="div" variant="h4">
              {metric.format(metric.value)}
            </Typography>
            <LinearProgress
              color={metric.color as any}
              sx={{ height: 8, borderRadius: 4 }}
              value={Math.min(Math.abs(metric.value) * 100, 100)}
              variant="determinate"
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
