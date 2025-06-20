import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Skeleton,
  Alert,
} from '@mui/material';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { BetRecommendation } from '@/types';

interface BettingOpportunitiesProps {
  opportunities: BetRecommendation[];
  onBetPlacement: (recommendation: BetRecommendation) => void;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    metadata: any;
  }>;
  isLoading: boolean;
}

export const BettingOpportunities: React.FC<BettingOpportunitiesProps> = ({
  opportunities,
  onBetPlacement,
  alerts,
  isLoading,
}) => {
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
          gap: 2,
        }}
      >
        {[1, 2, 3].map(index => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton height={100} sx={{ mt: 2 }} variant="rectangular" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Alert severity="info">
        No betting opportunities available at the moment. Please check back later.
      </Alert>
    );
  }

  return (
    <Box>
      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {alerts.length} active alert{alerts.length === 1 ? '' : 's'} require your attention
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {opportunities.map((opportunity, index) => {
          const hasAlert = alerts.some(alert => alert.metadata?.gameId === opportunity.event_id);

          return (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {hasAlert && (
                <Chip
                  color="warning"
                  label="Alert"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {opportunity.event_id}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom color="text.secondary" variant="body2">
                    Confidence
                  </Typography>
                  <LinearProgress
                    color={opportunity.confidence_score >= 0.8 ? 'success' : 'warning'}
                    sx={{ height: 8, borderRadius: 4 }}
                    value={opportunity.confidence_score * 100}
                    variant="determinate"
                  />
                  <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                    {formatPercentage(opportunity.confidence_score)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography color="text.secondary" variant="body2">
                    Expected ROI: {formatPercentage(opportunity.expected_roi)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Recommended Stake: {formatCurrency(opportunity.recommended_stake)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  color="primary"
                  disabled={hasAlert}
                  variant="contained"
                  onClick={() => onBetPlacement(opportunity)}
                >
                  Place Bet
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
