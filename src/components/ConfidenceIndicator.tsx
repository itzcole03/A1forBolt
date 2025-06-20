import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface ConfidenceIndicatorProps {
  confidence: number;
  kellyCriterion: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  kellyCriterion,
}) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return '#4caf50';
    if (value >= 0.6) return '#ff9800';
    return '#f44336';
  };

  const getKellyColor = (value: number) => {
    if (value >= 0.1) return '#4caf50';
    if (value >= 0.05) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography color="textSecondary" variant="subtitle2">
          Model Confidence
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getConfidenceColor(confidence),
                },
              }}
              value={confidence * 100}
              variant="determinate"
            />
          </Box>
          <Typography color="textSecondary" variant="body2">
            {(confidence * 100).toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography color="textSecondary" variant="subtitle2">
          Kelly Criterion
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getKellyColor(kellyCriterion),
                },
              }}
              value={Math.min(kellyCriterion * 100, 100)}
              variant="determinate"
            />
          </Box>
          <Typography color="textSecondary" variant="body2">
            {(kellyCriterion * 100).toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
