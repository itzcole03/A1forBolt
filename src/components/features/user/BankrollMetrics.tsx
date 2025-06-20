import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BankrollIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { riskManagement } from '@/services/riskManagement';

const MetricsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(1),
}));

export const BankrollMetrics: React.FC = () => {
  const bankroll = riskManagement.getBankroll();
  const bets = riskManagement.getBets();

  const calculateWinRate = () => {
    if (bankroll.totalBets === 0) return 0;
    return (bankroll.winningBets / bankroll.totalBets) * 100;
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 10) return 'success.main';
    if (roi >= 0) return 'primary.main';
    return 'error.main';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 5) return 'success.main';
    if (streak >= 3) return 'primary.main';
    return 'warning.main';
  };

  return (
    <MetricsCard>
      <CardContent>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <BankrollIcon color="primary" />
              <Typography variant="h6">
                Bankroll Metrics
              </Typography>
            </Box>
          </Grid>

          {/* Current Bankroll */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Current Bankroll
              </Typography>
              <Typography variant="h4" color="primary">
                ${bankroll.current.toFixed(2)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Typography variant="body2" color="textSecondary">
                  Initial: ${bankroll.initial.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  color={bankroll.current >= bankroll.initial ? 'success.main' : 'error.main'}
                >
                  {bankroll.current >= bankroll.initial ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : (
                    <TrendingDownIcon fontSize="small" />
                  )}
                  {((bankroll.current - bankroll.initial) / bankroll.initial * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* ROI */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Return on Investment
              </Typography>
              <Typography
                variant="h4"
                color={getRoiColor(bankroll.roi)}
              >
                {bankroll.roi.toFixed(1)}%
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Typography variant="body2" color="textSecondary">
                  Total Profit: ${bankroll.totalProfit.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Win Rate */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Win Rate
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4">
                  {calculateWinRate().toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ({bankroll.winningBets}/{bankroll.totalBets})
                </Typography>
              </Box>
              <ProgressBar
                variant="determinate"
                value={calculateWinRate()}
                sx={{
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: calculateWinRate() >= 50 ? 'success.main' : 'error.main',
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Streaks */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Current Streak
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="h4"
                  color={getStreakColor(bankroll.currentStreak)}
                >
                  {bankroll.currentStreak}
                </Typography>
                <Chip
                  size="small"
                  label={bankroll.currentStreakType.toUpperCase()}
                  color={bankroll.currentStreakType === 'win' ? 'success' : 'error'}
                />
              </Box>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Tooltip title="Longest Win Streak">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrophyIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      {bankroll.winStreak}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Longest Loss Streak">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <WarningIcon fontSize="small" color="error" />
                    <Typography variant="body2">
                      {bankroll.lossStreak}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Betting Stats */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Betting Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Average Bet
                  </Typography>
                  <Typography variant="h6">
                    ${bankroll.averageBetSize.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Largest Bet
                  </Typography>
                  <Typography variant="h6">
                    ${bankroll.largestBet.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Largest Win
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${bankroll.largestWin.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Largest Loss
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ${Math.abs(bankroll.largestLoss).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </MetricsCard>
  );
}; 