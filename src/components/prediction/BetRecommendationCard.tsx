import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { TrendingUp, Warning, Info, AttachMoney, Timeline } from '@mui/icons-material';
import { BetRecommendation } from '../../core/types/prediction';

interface BetRecommendationCardProps {
  recommendation: BetRecommendation;
  onViewDetails?: () => void;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const BetRecommendationCard: React.FC<BetRecommendationCardProps> = ({
  recommendation,
  onViewDetails,
}) => {
  const { prediction, confidence, stake, riskLevel, expectedValue, metadata } = recommendation;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
          <Typography component="div" variant="h6">
            {prediction.type}
          </Typography>
          <Chip color={getRiskColor(riskLevel)} label={riskLevel.toUpperCase()} size="small" />
        </Box>

        <Box mb={2}>
          <Typography gutterBottom color="text.secondary" variant="body2">
            Confidence
          </Typography>
          <Box alignItems="center" display="flex">
            <LinearProgress
              sx={{ flexGrow: 1, mr: 1 }}
              value={confidence * 100}
              variant="determinate"
            />
            <Typography color="text.secondary" variant="body2">
              {(confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography gutterBottom color="text.secondary" variant="body2">
              Recommended Stake
            </Typography>
            <Typography color="primary" variant="h6">
              {formatCurrency(stake)}
            </Typography>
          </Box>
          <Box>
            <Typography gutterBottom color="text.secondary" variant="body2">
              Expected Value
            </Typography>
            <Typography color={expectedValue >= 0 ? 'success.main' : 'error.main'} variant="h6">
              {formatCurrency(expectedValue)}
            </Typography>
          </Box>
        </Box>

        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Box display="flex" gap={1}>
            <Tooltip title="Model Agreement">
              <Chip
                icon={<Timeline />}
                label={`${(metadata.modelAgreement * 100).toFixed(0)}% Agreement`}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Bankroll Percentage">
              <Chip
                icon={<AttachMoney />}
                label={`${(metadata.bankrollPercentage * 100).toFixed(0)}% Bankroll`}
                size="small"
              />
            </Tooltip>
          </Box>
          {onViewDetails && (
            <IconButton size="small" onClick={onViewDetails}>
              <Info />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
