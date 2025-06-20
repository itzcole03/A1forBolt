import React from 'react';
import { Box, Paper, Typography, Chip, Tooltip, LinearProgress } from '@mui/material';
import { useBettingSettings } from '../../hooks/useBettingSettings';
import { formatCurrency } from '../../utils/formatters';

export const BettingSettingsSummary: React.FC = () => {
  const { settings } = useBettingSettings();

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'aggressive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography gutterBottom variant="h6">
        Current Settings
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography gutterBottom color="text.secondary" variant="subtitle2">
            Risk Profile
          </Typography>
          <Chip
            color={getRiskProfileColor(settings.riskProfile)}
            label={settings.riskProfile.charAt(0).toUpperCase() + settings.riskProfile.slice(1)}
            size="small"
          />
        </Box>

        <Box>
          <Typography gutterBottom color="text.secondary" variant="subtitle2">
            Stake Size
          </Typography>
          <Typography variant="body1">{formatCurrency(settings.stakeSize)}</Typography>
          <Tooltip title="Stake range">
            <Typography color="text.secondary" variant="caption">
              Range: {formatCurrency(settings.minStake)} - {formatCurrency(settings.maxStake)}
            </Typography>
          </Tooltip>
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <Typography gutterBottom color="text.secondary" variant="subtitle2">
            Confidence Threshold
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              sx={{ flex: 1 }}
              value={settings.confidenceThreshold * 100}
              variant="determinate"
            />
            <Typography variant="body2">
              {(settings.confidenceThreshold * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <Typography gutterBottom color="text.secondary" variant="subtitle2">
            Selected Model
          </Typography>
          <Typography noWrap variant="body1">
            {settings.modelId || 'No model selected'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
