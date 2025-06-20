import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { formatPercentage, formatTimeAgo } from '../utils/formatters';

interface Pattern {
  name: string;
  description: string;
  confidence: number;
  matchScore: number;
  lastOccurrence: Date;
  successRate: number;
  sampleSize: number;
}

interface LineMovement {
  initial: number;
  current: number;
  change: number;
  timestamp: Date;
  significance: 'high' | 'medium' | 'low';
}

interface PatternRecognitionProps {
  patterns: Pattern[];
  lineMovement: LineMovement;
  onPatternSelect: (pattern: Pattern) => void;
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({
  patterns,
  lineMovement,
  onPatternSelect,
}) => {
  const getSignificanceColor = (significance: LineMovement['significance']) => {
    switch (significance) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  };

  const getSignificanceIcon = (significance: LineMovement['significance']) => {
    switch (significance) {
      case 'high':
        return <TrendingUpIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
        return <TrendingDownIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography gutterBottom variant="h5">
        Pattern Recognition
        <Tooltip title="Historical patterns and line movement analysis">
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
        {/* Line Movement Card */}
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6">
              Line Movement
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Initial Line
                </Typography>
                <Typography variant="body2">{lineMovement.initial}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Current Line
                </Typography>
                <Typography variant="body2">{lineMovement.current}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Change
                </Typography>
                <Typography
                  color={lineMovement.change > 0 ? 'success.main' : 'error.main'}
                  variant="body2"
                >
                  {lineMovement.change > 0 ? '+' : ''}
                  {lineMovement.change}
                </Typography>
              </Box>
            </Box>
            <Chip
              color={getSignificanceColor(lineMovement.significance)}
              icon={getSignificanceIcon(lineMovement.significance)}
              label={`${lineMovement.significance.toUpperCase()} Significance`}
            />
            <Typography color="text.secondary" sx={{ display: 'block', mt: 1 }} variant="caption">
              Updated {formatTimeAgo(lineMovement.timestamp)}
            </Typography>
          </CardContent>
        </Card>

        {/* Patterns Card */}
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6">
              Identified Patterns
            </Typography>
            {patterns.map((pattern, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => onPatternSelect(pattern)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{pattern.name}</Typography>
                  <Chip
                    color={pattern.matchScore >= 0.8 ? 'success' : 'warning'}
                    label={`${formatPercentage(pattern.matchScore)} Match`}
                    size="small"
                  />
                </Box>
                <Typography gutterBottom color="text.secondary" variant="body2">
                  {pattern.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography gutterBottom color="text.secondary" variant="caption">
                    Success Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      color={pattern.successRate >= 0.6 ? 'success' : 'warning'}
                      sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                      value={pattern.successRate * 100}
                      variant="determinate"
                    />
                    <Typography variant="caption">
                      {formatPercentage(pattern.successRate)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                  variant="caption"
                >
                  Last seen {formatTimeAgo(pattern.lastOccurrence)} • {pattern.sampleSize} samples
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default React.memo(PatternRecognition);
