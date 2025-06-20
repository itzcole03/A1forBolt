import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { formatCurrency, formatPercentage, formatTimeAgo } from '../utils/formatters';
import type { BettingStats as BettingStatsType, ModelPerformance } from '../types/betting';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';

interface BettingStatsProps {
  stats: BettingStatsType;
  modelPerformance: ModelPerformance[];
}

const BettingStats: React.FC<BettingStatsProps> = ({ stats, modelPerformance }) => {
  const getTrendIcon = (value: number) => {
    return value >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography gutterBottom variant="h5">
        Performance Overview
        <Tooltip title="Statistics for the selected time period">
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* Overall Stats */}
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6">
              Overall Performance
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
              }}
            >
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Bets
                </Typography>
                <Typography variant="h6">{stats.total_bets}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Win Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{formatPercentage(stats.win_rate)}</Typography>
                  {getTrendIcon(stats.win_rate - 0.5)}
                </Box>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Profit
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{formatCurrency(stats.total_profit)}</Typography>
                  {getTrendIcon(stats.total_profit)}
                </Box>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  ROI
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{formatPercentage(stats.roi)}</Typography>
                  {getTrendIcon(stats.roi)}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6">
              Model Performance
            </Typography>
            {modelPerformance.map(model => (
              <Box key={model.model_name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{model.model_name}</Typography>
                  <Typography
                    color={model.roi >= 0 ? 'success.main' : 'error.main'}
                    variant="body2"
                  >
                    {formatPercentage(model.roi)}
                  </Typography>
                </Box>
                <LinearProgress
                  color={model.roi >= 0 ? 'success' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                  value={Math.abs(model.roi) * 100}
                  variant="determinate"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography color="text.secondary" variant="caption">
                    {model.wins}W / {model.losses}L
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    Updated {formatTimeAgo(new Date(model.last_updated))}
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Best/Worst Models */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography gutterBottom variant="subtitle1">
                  Best Performing Model
                </Typography>
                <Typography color="success.main" variant="h6">
                  {stats.best_performing_model}
                </Typography>
              </Box>
              <Box>
                <Typography gutterBottom variant="subtitle1">
                  Worst Performing Model
                </Typography>
                <Typography color="error.main" variant="h6">
                  {stats.worst_performing_model}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default React.memo(BettingStats);
