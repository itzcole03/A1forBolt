import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useUnifiedAnalytics } from '../hooks/useUnifiedAnalytics.js';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry.js';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import InfoIcon from '@mui/icons-material/Info';
import { NoResultsFallback } from './NoResultsFallback.js';
import { motion, AnimatePresence } from 'framer-motion';
import type { PredictionStreamPayload } from '../../types/webSocket.js';
import { usePredictionService } from '../../hooks/usePredictionService.js';
import { useRiskProfile } from '../../hooks/useRiskProfile.js';
import { EventBus } from '../../unified/EventBus.js';
import { ErrorHandler } from '../../unified/ErrorHandler.js';
import { PerformanceMonitor } from '../../unified/PerformanceMonitor.js';
import { ModelVersioning } from '../../unified/ModelVersioning.js';
import { Prediction, RiskProfile, ErrorCategory, ErrorSeverity } from '../../types/core.js';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useFilterStore } from '../stores/filterStore.js';

const PredictionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const ConfidenceBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
  },
}));

const ShapContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  height: 300,
  position: 'relative',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ValueDisplay = styled(Box)<{ changed?: boolean }>(({ theme, changed }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: changed ? theme.palette.primary.light : 'transparent',
  transition: `background-color 0.3s`,
}));

const PredictionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

interface PredictionDisplayProps {
  eventId: string;
  marketId?: string;
  selectionId?: string;
  className?: string;
  showAdvancedMetrics?: boolean;
  onPredictionUpdate?: (prediction: any) => void;
}

type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'high-confidence' | 'recent' | 'profitable';

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  eventId,
  marketId,
  selectionId,
  className = '',
  showAdvancedMetrics = false,
  onPredictionUpdate,
}) => {
  const { ml } = useUnifiedAnalytics({ ml: { autoUpdate: false } });
  const predictionService = usePredictionService();
  const { riskProfile } = useRiskProfile();
  const eventBus = EventBus.getInstance();
  const errorHandler = ErrorHandler.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();
  const modelVersioning = ModelVersioning.getInstance();
  const filterStore = useFilterStore();

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [changedValues, setChangedValues] = useState<Set<string>>(new Set());
  const [showUncertaintyDetails, setShowUncertaintyDetails] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Connected' | 'Disconnected'>(
    'Disconnected'
  );
  const [error, setError] = useState<string | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [optimalStake, setOptimalStake] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const webSocketService = serviceRegistry.getService<any>('websocket');

  // Memoize prediction for performance
  const prediction = useMemo(() => {
    if (!ml || !ml.mlResult) return null;
    if (Array.isArray(ml.mlResult.predictions)) {
      return ml.mlResult.predictions.find((p: any) => p.eventId === eventId) || null;
    }
    return null;
  }, [ml, eventId]);

  // Calculate optimal stake when prediction or risk profile changes
  useEffect(() => {
    if (prediction && riskProfile) {
      predictionService
        .calculateOptimalStake(prediction, prediction.odds, riskProfile.level)
        .then(setOptimalStake)
        .catch(console.error);
    }
  }, [prediction, riskProfile, predictionService]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let isMounted = true;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000;

    const handlePredictionUpdate = useCallback(
      (data: PredictionStreamPayload) => {
        if (!isMounted) return;
        if (data.eventId === eventId) {
          setPredictionHistory(prev => [...prev, data].slice(-10)); // Keep last 10 predictions
          onPredictionUpdate?.(data);
          setConnectionStatus('Connected');
        }
      },
      [eventId, onPredictionUpdate]
    );

    const connectAndSubscribe = async () => {
      try {
        await webSocketService.connect();
        unsub = webSocketService.subscribe('predictions', handlePredictionUpdate);
        setConnectionStatus('Connected');
        reconnectAttempts = 0;
      } catch (error) {
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeout = setTimeout(connectAndSubscribe, reconnectInterval);
          reconnectAttempts++;
        } else {
          setError('WebSocket connection failed. Please refresh.');
          setConnectionStatus('Disconnected');
        }
      }
    };

    connectAndSubscribe();

    return () => {
      isMounted = false;
      if (unsub) unsub();
      webSocketService.disconnect();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [eventId, webSocketService, onPredictionUpdate]);

  // Handle prediction updates
  useEffect(() => {
    if (prediction) {
      const newChangedValues = new Set<string>();
      if (prediction.confidence) newChangedValues.add('confidence');
      if (prediction.recommended_stake) newChangedValues.add('stake');
      setChangedValues(newChangedValues);
      const timeout = setTimeout(() => setChangedValues(new Set()), 1000);
      return () => clearTimeout(timeout);
    }
  }, [prediction]);

  useEffect(() => {
    const componentId = 'prediction-display';
    const startTime = performance.now();

    const loadPredictions = async () => {
      try {
        const data = await predictionService.getPredictions({
          riskProfile: filterStore.riskProfile,
          sport: filterStore.sport,
          minOdds: filterStore.minOdds,
          maxOdds: filterStore.maxOdds,
          minConfidence: filterStore.minConfidence,
          maxConfidence: filterStore.maxConfidence,
          projectedReturn: filterStore.projectedReturn,
          // add any other filters as needed
        });
        setPredictions(data);
        setError(null);

        performanceMonitor.updateComponentMetrics(componentId, {
          renderCount: 1,
          renderTime: performance.now() - startTime,
          memoryUsage: JSON.stringify(data).length,
          errorCount: 0,
          lastUpdate: Date.now(),
        });
      } catch (err) {
        const error = err as Error;
        setError(error.message);

        errorHandler.handleError(error, {
          code: 'PREDICTION_LOAD_ERROR',
          category: 'BUSINESS',
          severity: 'HIGH',
          component: componentId,
          retryable: true,
          recoveryStrategy: {
            type: 'retry',
            maxRetries: 3,
            timeout: 1000,
          },
        });

        performanceMonitor.updateComponentMetrics(componentId, {
          renderCount: 0,
          renderTime: 0,
          memoryUsage: 0,
          errorCount: 1,
          lastUpdate: Date.now(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handlePredictionUpdate = (update: Prediction) => {
      setPredictions(prev => {
        const newPredictions = prev.map(p => (p.id === update.id ? { ...p, ...update } : p));

        performanceMonitor.updateComponentMetrics(componentId, {
          renderCount: 1,
          renderTime: performance.now() - startTime,
          memoryUsage: JSON.stringify(newPredictions).length,
          errorCount: 0,
          lastUpdate: Date.now(),
        });

        return newPredictions;
      });
    };

    const handleError = (error: Error) => {
      errorHandler.handleError(error, {
        code: 'PREDICTION_UPDATE_ERROR',
        category: 'BUSINESS',
        severity: 'MEDIUM',
        component: componentId,
        retryable: true,
      });

      performanceMonitor.updateComponentMetrics(componentId, {
        renderCount: 0,
        renderTime: 0,
        memoryUsage: 0,
        errorCount: 1,
        lastUpdate: Date.now(),
      });
    };

    // Subscribe to real-time updates
    const unsubscribe = predictionService.subscribeToUpdates(handlePredictionUpdate, handleError);

    // Load initial predictions
    loadPredictions();

    // Cleanup
    return () => {
      unsubscribe();
      performanceMonitor.updateComponentMetrics(componentId, {
        renderCount: 0,
        renderTime: 0,
        memoryUsage: 0,
        errorCount: 0,
        lastUpdate: Date.now(),
      });
    };
  }, [predictionService, filterStore]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, prediction: Prediction) => {
    setAnchorEl(event.currentTarget);
    setSelectedPrediction(prediction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPrediction(null);
  };

  if (ml?.isLoading) {
    return (
      <PredictionContainer className={className}>
        <Box alignItems="center" display="flex" justifyContent="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </PredictionContainer>
    );
  }

  if (ml?.error) {
    return (
      <PredictionContainer className={className}>
        <Alert severity="error">Failed to load prediction data: {ml.error.message}</Alert>
      </PredictionContainer>
    );
  }

  if (!prediction) {
    return <NoResultsFallback />;
  }

  const {
    prediction: value,
    confidence,
    uncertainty,
    kelly_fraction,
    model_predictions,
    shap_values,
    feature_importance,
    timestamp,
  } = prediction;

  return (
    <PredictionContainer className={className}>
      {/* Header with Connection Status and Controls */}
      <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Prediction Details</Typography>
        <Box alignItems="center" display="flex" gap={1}>
          <Chip
            color={connectionStatus === 'Connected' ? 'success' : 'warning'}
            label={connectionStatus}
            size="small"
          />
          <ControlsContainer>
            <IconButton size="small" onClick={e => setFilterAnchorEl(e.currentTarget)}>
              <FilterListIcon />
            </IconButton>
            <IconButton size="small" onClick={e => setSortAnchorEl(e.currentTarget)}>
              <SortIcon />
            </IconButton>
          </ControlsContainer>
        </Box>
      </Box>

      {/* Main Prediction Display */}
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Box mb={3}>
            <Box alignItems="center" display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Prediction</Typography>
              <ValueDisplay changed={changedValues.has('value')}>
                <Typography variant="h5">{value.toFixed(2)}</Typography>
              </ValueDisplay>
            </Box>
            <Box alignItems="center" display="flex" gap={1}>
              <Typography color="textSecondary" variant="body2">
                Confidence:
              </Typography>
              <Box flex={1}>
                <ConfidenceBar
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        confidence > 0.7
                          ? 'success.main'
                          : confidence > 0.5
                            ? 'warning.main'
                            : 'error.main',
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
        </Grid>

        <Grid item md={6} xs={12}>
          <Box mb={3}>
            <Typography gutterBottom variant="subtitle1">
              Risk Profile
            </Typography>
            <Box alignItems="center" display="flex" gap={1}>
              <Typography variant="body2">Recommended Stake:</Typography>
              <Typography color="primary" variant="h6">
                {optimalStake ? `${(optimalStake * 100).toFixed(1)}%` : 'Calculating...'}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography color="textSecondary" variant="body2">
                Kelly Fraction: {kelly_fraction.toFixed(3)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Advanced Metrics */}
      {showAdvancedMetrics && (
        <Box mt={3}>
          <Typography gutterBottom variant="subtitle1">
            Advanced Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={6} xs={12}>
              <Box>
                <Typography gutterBottom color="textSecondary" variant="body2">
                  Uncertainty Analysis
                </Typography>
                <Box alignItems="center" display="flex" gap={1}>
                  <Typography variant="body2">
                    Total: {(uncertainty.total * 100).toFixed(1)}%
                  </Typography>
                  <Tooltip title="Epistemic: Model uncertainty, Aleatoric: Data uncertainty">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
            <Grid item md={6} xs={12}>
              <Box>
                <Typography gutterBottom color="textSecondary" variant="body2">
                  Model Contributions
                </Typography>
                <ResponsiveContainer height={100} width="100%">
                  <BarChart
                    data={Object.entries(model_predictions).map(([model, value]) => ({
                      model,
                      value: value * 100,
                    }))}
                  >
                    <XAxis dataKey="model" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Prediction History */}
      {predictionHistory.length > 0 && (
        <Box mt={3}>
          <Typography gutterBottom variant="subtitle1">
            Prediction History
          </Typography>
          <ResponsiveContainer height={200} width="100%">
            <LineChart data={predictionHistory}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Line dataKey="prediction" stroke="#8884d8" type="monotone" />
              <Line dataKey="confidence" stroke="#82ca9d" type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Menus */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setFilterType('all');
            setFilterAnchorEl(null);
          }}
        >
          All Predictions
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterType('high-confidence');
            setFilterAnchorEl(null);
          }}
        >
          High Confidence
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterType('recent');
            setFilterAnchorEl(null);
          }}
        >
          Recent
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterType('profitable');
            setFilterAnchorEl(null);
          }}
        >
          Profitable
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setSortOrder('desc');
            setSortAnchorEl(null);
          }}
        >
          Highest Confidence
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSortOrder('asc');
            setSortAnchorEl(null);
          }}
        >
          Lowest Confidence
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {predictions.map(prediction => (
          <Grid key={prediction.id} item md={4} sm={6} xs={12}>
            <PredictionCard>
              <CardHeader
                action={
                  <IconButton onClick={e => handleMenuOpen(e, prediction)}>
                    <MoreVertIcon />
                  </IconButton>
                }
                subheader={new Date(prediction.timestamp).toLocaleString()}
                title={prediction.event}
              />
              <CardContent>
                <Typography gutterBottom color="text.secondary" variant="body2">
                  Confidence: {prediction.confidence}%
                </Typography>
                <Typography gutterBottom color="text.secondary" variant="body2">
                  Recommended Bet: {prediction.recommendedBet}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Expected Value: {prediction.expectedValue}
                </Typography>
              </CardContent>
            </PredictionCard>
          </Grid>
        ))}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Track Performance</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
      </Menu>
    </PredictionContainer>
  );
};
