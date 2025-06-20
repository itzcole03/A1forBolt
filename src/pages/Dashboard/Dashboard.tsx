import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getActiveBets, getTotalWinnings, getWinRate } from '@services/bettingService';
import LoadingState from '@components/core/LoadingState';
import ErrorState from '@components/core/ErrorState';

const Dashboard = () => {
  const theme = useTheme();

  const {
    data: activeBets = 0,
    isLoading: isLoadingBets,
    error: betsError,
    refetch: refetchBets,
  } = useQuery({
    queryKey: ['activeBets'],
    queryFn: getActiveBets,
  });

  const {
    data: totalWinnings = 0,
    isLoading: isLoadingWinnings,
    error: winningsError,
    refetch: refetchWinnings,
  } = useQuery({
    queryKey: ['totalWinnings'],
    queryFn: getTotalWinnings,
  });

  const {
    data: winRate = 0,
    isLoading: isLoadingWinRate,
    error: winRateError,
    refetch: refetchWinRate,
  } = useQuery({
    queryKey: ['winRate'],
    queryFn: getWinRate,
  });

  if (isLoadingBets || isLoadingWinnings || isLoadingWinRate) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  if (betsError || winningsError || winRateError) {
    return (
      <ErrorState
        message="Failed to load dashboard data"
        onRetry={() => {
          refetchBets();
          refetchWinnings();
          refetchWinRate();
        }}
      />
    );
  }

  return (
    <Box>
      <Typography gutterBottom variant="h4">
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item lg={4} md={6} xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography gutterBottom variant="h6">
              Active Bets
            </Typography>
            <Typography color="primary" variant="h3">
              {activeBets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item lg={4} md={6} xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography gutterBottom variant="h6">
              Total Winnings
            </Typography>
            <Typography color="success.main" variant="h3">
              ${totalWinnings.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item lg={4} md={6} xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Typography gutterBottom variant="h6">
              Win Rate
            </Typography>
            <Typography color="info.main" variant="h3">
              {winRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
