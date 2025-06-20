import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Box,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { bankrollService } from '@/services/bankroll';
import { notificationService } from '@/services/notification';

interface BettingOpportunityProps {
  opportunity: {
    id: string;
    event: {
      homeTeam: string;
      awayTeam: string;
      startTime: string;
      sport: string;
    };
    market: string;
    selection: string;
    odds: number;
    probability: number;
    edge: number;
    confidence: number;
    volume: number;
    sentiment?: {
      score: number;
      volume: number;
    };
    stats?: {
      homeTeam: any;
      awayTeam: any;
    };
    arbitrage?: {
      roi: number;
      bookmakers: string[];
    };
  };
  onPlaceBet: (opportunity: any) => void;
}

export const BettingOpportunity: React.FC<BettingOpportunityProps> = ({
  opportunity,
  onPlaceBet,
}) => {
  const {
    event,
    market,
    selection,
    odds,
    probability,
    edge,
    confidence,
    volume,
    sentiment,
    stats,
    arbitrage,
  } = opportunity;

  const handlePlaceBet = () => {
    const maxBetAmount = bankrollService.getMaxBetAmount();
    const recommendedStake = Math.min(
      maxBetAmount,
      bankrollService.getBalance() * (edge / 100)
    );

    onPlaceBet({
      ...opportunity,
      stake: recommendedStake,
    });

    notificationService.notify(
      'success',
      'Bet Placed',
      `Placed bet of $${recommendedStake.toFixed(2)} on ${selection}`,
      opportunity
    );
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return 'success';
    if (value >= 0.6) return 'primary';
    if (value >= 0.4) return 'warning';
    return 'error';
  };

  const getEdgeColor = (value: number) => {
    if (value >= 10) return 'success';
    if (value >= 5) return 'primary';
    if (value >= 2) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {/* Event Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {event.homeTeam} vs {event.awayTeam}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(event.startTime).toLocaleString()}
            </Typography>
            <Chip
              label={event.sport}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* Market and Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              {market}
            </Typography>
            <Typography variant="h5" color="primary">
              {selection}
            </Typography>
          </Grid>

          {/* Odds and Probability */}
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Odds
            </Typography>
            <Typography variant="h6">
              {odds.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Probability
            </Typography>
            <Typography variant="h6">
              {(probability * 100).toFixed(1)}%
            </Typography>
          </Grid>

          {/* Edge and Confidence */}
          <Grid item xs={12}>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">
                Edge
              </Typography>
              <Tooltip title={`${edge.toFixed(2)}% advantage over bookmaker odds`}>
                <Chip
                  label={`${edge.toFixed(2)}%`}
                  color={getEdgeColor(edge) as any}
                  size="small"
                />
              </Tooltip>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Confidence
              </Typography>
              <Tooltip title={`${(confidence * 100).toFixed(1)}% confidence in this prediction`}>
                <Chip
                  label={`${(confidence * 100).toFixed(1)}%`}
                  color={getConfidenceColor(confidence) as any}
                  size="small"
                />
              </Tooltip>
            </Box>
          </Grid>

          {/* Sentiment Analysis */}
          {sentiment && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Sentiment Analysis
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress
                  variant="determinate"
                  value={sentiment.score * 100}
                  sx={{ flexGrow: 1 }}
                />
                <Typography variant="body2">
                  {sentiment.score.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Volume: {sentiment.volume}
              </Typography>
            </Grid>
          )}

          {/* Statistical Analysis */}
          {stats && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Statistical Analysis
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption">
                    {event.homeTeam}
                  </Typography>
                  <Typography variant="body2">
                    {Object.entries(stats.homeTeam)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">
                    {event.awayTeam}
                  </Typography>
                  <Typography variant="body2">
                    {Object.entries(stats.awayTeam)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Arbitrage Information */}
          {arbitrage && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Arbitrage Opportunity
              </Typography>
              <Typography variant="body2">
                ROI: {arbitrage.roi.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Bookmakers: {arbitrage.bookmakers.join(', ')}
              </Typography>
            </Grid>
          )}

          {/* Action Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePlaceBet}
              disabled={!bankrollService.getBalance()}
            >
              Place Bet
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 