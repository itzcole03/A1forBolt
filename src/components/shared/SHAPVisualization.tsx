import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { FeatureImportance } from '@/types/prediction';

interface FeatureImpact {
  feature: string;
  value: number;
  impact: number;
  direction: 'positive' | 'negative';
}

interface SHAPVisualizationProps {
  explanations: FeatureImpact[];
}

const SHAPVisualization = ({ explanations }: SHAPVisualizationProps) => {
  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {explanations.map((feat, idx) => (
        <Tooltip key={idx} title={`Impact: ${feat.impact.toFixed(2)}, Value: ${feat.value}`}>
          <Chip
            color={feat.direction === 'positive' ? 'success' : 'error'}
            label={`${feat.feature} (${feat.direction === 'positive' ? '+' : '−'}${feat.impact.toFixed(2)})`}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default SHAPVisualization;
