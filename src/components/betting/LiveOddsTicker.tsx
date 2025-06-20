import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { BettingEvent } from '../../types/betting';
import { formatOdds, formatDateTime } from '../../utils/formatters';

interface LiveOddsTickerProps {
  events: BettingEvent[];
  onEventSelect: (event: BettingEvent) => void;
  loading: boolean;
  error: Error | null;
}

export const LiveOddsTicker: React.FC<LiveOddsTickerProps> = ({
  events,
  onEventSelect,
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
        Error loading live odds: {error.message}
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No live events available at the moment.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        Live Odds
      </Typography>

      <Stack spacing={2}>
        {events.map(event => (
          <Card
            key={event.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => onEventSelect(event)}
          >
            <CardContent>
              <Box alignItems="center" display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{event.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {formatDateTime(event.startTime)}
                  </Typography>
                </Box>

                <Box alignItems="center" display="flex" gap={1}>
                  <Typography variant="h6">{formatOdds(event.odds)}</Typography>
                  {event.animate && (
                    <Chip
                      color={event.odds > 0 ? 'success' : 'error'}
                      icon={event.odds > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={event.odds > 0 ? 'Up' : 'Down'}
                      size="small"
                    />
                  )}
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {event.prediction && (
                <Box mt={1}>
                  <Typography color="text.secondary" variant="body2">
                    Win Probability: {formatOdds(event.prediction.home_win_probability)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
