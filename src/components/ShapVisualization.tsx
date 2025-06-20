import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { formatPercentage } from '../utils/formatters';
import type { Feature } from '../types/prediction';

interface ShapFeature {
  name: string;
  value: number;
  impact: number;
}

interface ShapVisualizationProps {
  features: ShapFeature[];
  title: string;
  maxFeatures?: number;
  isLoading?: boolean;
}

const ShapVisualization: React.FC<ShapVisualizationProps> = ({
  features,
  title,
  maxFeatures = 8,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="60%" />
        {[...Array(3)].map((_, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton height={24} sx={{ mt: 1 }} variant="rectangular" />
          </Box>
        ))}
      </Box>
    );
  }

  const sortedFeatures = [...features]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, maxFeatures);

  const maxImpact = Math.max(...sortedFeatures.map(f => Math.abs(f.impact)));

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        {title}
      </Typography>
      {sortedFeatures.map((feature, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography color="text.secondary" variant="body2">
              {feature.name}
            </Typography>
            <Typography color={feature.impact > 0 ? 'success.main' : 'error.main'} variant="body2">
              {feature.impact > 0 ? '+' : ''}
              {feature.impact.toFixed(3)}
            </Typography>
          </Box>
          <LinearProgress
            color={feature.impact > 0 ? 'success' : 'error'}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                transform: feature.impact < 0 ? 'scaleX(-1)' : 'none',
              },
            }}
            value={(Math.abs(feature.impact) / maxImpact) * 100}
            variant="determinate"
          />
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(ShapVisualization);
