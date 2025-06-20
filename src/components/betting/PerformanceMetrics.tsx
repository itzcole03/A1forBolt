import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { BettingMetrics } from '../../types/betting';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PerformanceMetricsProps {
  metrics: BettingMetrics;
  loading: boolean;
  error: Error | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading metrics: {error.message}
      </Alert>
    );
  }

  const metricCards = [
    {
      title: 'Total Profit',
      value: formatCurrency(metrics.total_profit),
      color: metrics.total_profit >= 0 ? 'success.main' : 'error.main',
    },
    {
      title: 'ROI',
      value: formatPercentage(metrics.roi),
      color: metrics.roi >= 0 ? 'success.main' : 'error.main',
    },
    {
      title: 'Win Rate',
      value: formatPercentage(metrics.win_rate),
      color: metrics.win_rate >= 0.5 ? 'success.main' : 'warning.main',
    },
    {
      title: 'Total Bets',
      value: metrics.total_bets.toString(),
      color: 'text.primary',
    },
    {
      title: 'Average Stake',
      value: formatCurrency(metrics.average_stake),
      color: 'text.primary',
    },
    {
      title: 'Risk Score',
      value: formatPercentage(metrics.risk_score),
      color: metrics.risk_score <= 0.5 ? 'success.main' : 'warning.main',
    },
  ];

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        Performance Metrics
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {metricCards.map(card => (
          <Card key={card.title} sx={{ flex: '1 1 250px', maxWidth: '100%' }}>
            <CardContent>
              <Typography gutterBottom color="text.secondary" variant="subtitle2">
                {card.title}
              </Typography>
              <Typography color={card.color} variant="h6">
                {card.value}
              </Typography>
              {card.title === 'Win Rate' && (
                <LinearProgress
                  color={metrics.win_rate >= 0.5 ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                  value={metrics.win_rate * 100}
                  variant="determinate"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box mt={3}>
        <Typography gutterBottom variant="subtitle1">
          Recent Performance
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <Typography color="text.secondary" variant="body2">
                  Winning Bets
                </Typography>
                <Typography color="success.main" variant="h6">
                  {metrics.winning_bets}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <Typography color="text.secondary" variant="body2">
                  Losing Bets
                </Typography>
                <Typography color="error.main" variant="h6">
                  {metrics.losing_bets}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
