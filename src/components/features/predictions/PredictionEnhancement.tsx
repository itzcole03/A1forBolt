import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
  Button,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatPercentage, formatCurrency } from '../utils/formatters';
import { debounce } from 'lodash';
import type { ModelPrediction } from '../types/prediction';

interface PredictionEnhancementProps {
  predictions: ModelPrediction[];
  onStakeOptimize: (prediction: ModelPrediction) => void;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  bankroll: number;
  onRefresh?: () => Promise<void>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PredictionEnhancement: React.FC<PredictionEnhancementProps> = ({
  predictions,
  onStakeOptimize,
  riskProfile,
  bankroll,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 30000,
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<ModelPrediction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize confidence level calculation
  const getConfidenceLevel = useCallback((confidence: number) => {
    if (confidence >= 0.9) return { label: 'Safe', color: 'success' as const };
    if (confidence >= 0.7) return { label: 'Medium', color: 'warning' as const };
    return { label: 'Risky', color: 'error' as const };
  }, []);

  // Memoize Kelly stake calculation
  const calculateKellyStake = useCallback(
    (prediction: ModelPrediction) => {
      const { confidence, prediction: odds } = prediction;
      const q = 1 - confidence;
      const b = odds - 1;
      const kelly = (b * confidence - q) / b;

      const riskMultiplier = {
        conservative: 0.25,
        moderate: 0.5,
        aggressive: 0.75,
      }[riskProfile];

      return Math.max(0, Math.min(kelly * riskMultiplier * bankroll, bankroll * 0.1));
    },
    [riskProfile, bankroll]
  );

  // Debounced refresh handler
  const debouncedRefresh = useMemo(
    () =>
      debounce(async () => {
        if (!onRefresh) return;
        try {
          setIsRefreshing(true);
          setError(null);
          await onRefresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to refresh predictions');
        } finally {
          setIsRefreshing(false);
        }
      }, 1000),
    [onRefresh]
  );

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(debouncedRefresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh, refreshInterval, debouncedRefresh]);

  // Memoize sorted predictions
  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => b.confidence - a.confidence);
  }, [predictions]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Enhanced Predictions
          <Tooltip title="AI-powered predictions with multi-model consensus">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {onRefresh && (
          <Button
            disabled={isRefreshing}
            startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={debouncedRefresh}
          >
            Refresh
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        {sortedPredictions.map((prediction, index) => {
          const confidenceLevel = getConfidenceLevel(prediction.confidence);
          const suggestedStake = calculateKellyStake(prediction);

          return (
            <Card
              key={prediction.eventId + index}
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{prediction.modelName}</Typography>
                  <Chip
                    color={confidenceLevel.color}
                    icon={
                      confidenceLevel.color === 'success' ? (
                        <CheckCircleIcon />
                      ) : confidenceLevel.color === 'warning' ? (
                        <WarningIcon />
                      ) : (
                        <ErrorIcon />
                      )
                    }
                    label={confidenceLevel.label}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom color="text.secondary" variant="body2">
                    Confidence Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      color={confidenceLevel.color}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scaleY(1.2)',
                        },
                      }}
                      value={prediction.confidence * 100}
                      variant="determinate"
                    />
                    <Typography variant="body2">
                      {formatPercentage(prediction.confidence)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom color="text.secondary" variant="body2">
                    Model Performance
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Accuracy
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(prediction.performance.accuracy)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        ROI
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(prediction.performance.roi)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Win Rate
                      </Typography>
                      <Typography variant="body2">
                        {formatPercentage(prediction.performance.winRate)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom color="text.secondary" variant="body2">
                    Suggested Stake (Kelly Criterion)
                  </Typography>
                  <Typography color="primary" variant="h6">
                    {formatCurrency(suggestedStake)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    color="primary"
                    variant="contained"
                    onClick={() => onStakeOptimize(prediction)}
                  >
                    Optimize Stake
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedPrediction(prediction);
                      setShowDetails(!showDetails);
                    }}
                  >
                    Details
                  </Button>
                </Box>

                <Collapse in={showDetails && selectedPrediction === prediction}>
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom variant="subtitle2">
                      Top Contributing Features
                    </Typography>
                    {prediction.features.slice(0, 3).map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        }}
                      >
                        <Typography variant="body2">{feature.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {formatPercentage(feature.importance)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default React.memo(PredictionEnhancement);
