import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import { usePredictionService } from '../../../hooks/usePredictionService';
import { useRiskProfile } from '../../../hooks/useRiskProfile';
import { EventBus } from '../../../unified/EventBus';
import { ErrorHandler } from '../../../unified/ErrorHandler';
import { PerformanceMonitor } from '../../../unified/PerformanceMonitor';
import { ModelVersioning } from '../../../unified/ModelVersioning';
import { Prediction, RiskProfile, ErrorCategory, ErrorSeverity } from '../../../types/core';
import { BettingOpportunity } from '../../../types/betting';
import { ShapExplanation } from '../../prediction/ShapExplanation';
import { ConfidenceIndicator } from '../../common/ConfidenceIndicator';
import { RiskLevelIndicator } from '../../common/RiskLevelIndicator';
import { ValidationStatus } from '../../common/ValidationStatus';
import { useFilterStore } from '../../../stores/filterStore';

interface RealtimePredictionDisplayProps {
  predictionId: string;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.6) return 'warning';
  return 'error';
};

const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    default:
      return 'default';
  }
};

export const RealtimePredictionDisplay: React.FC<RealtimePredictionDisplayProps> = ({
  predictionId,
}) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPredictions } = usePredictionService();
  const { currentProfile } = useRiskProfile();
  const eventBus = EventBus.getInstance();
  const errorHandler = ErrorHandler.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();
  const modelVersioning = ModelVersioning.getInstance();
  const filterStore = useFilterStore();

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setIsLoading(true);
        const results = await getPredictions({
          riskProfile: filterStore.riskProfile,
          sport: filterStore.sport,
          minOdds: filterStore.minOdds,
          maxOdds: filterStore.maxOdds,
          minConfidence: filterStore.minConfidence,
          maxConfidence: filterStore.maxConfidence,
          projectedReturn: filterStore.projectedReturn,
          // add any other filters as needed
        });
        const result = results.find(p => p.id === predictionId);
        setPrediction(result || null);
        setError(null);

        // Track performance
        performanceMonitor.recordOperation('fetchPrediction', performance.now());

        // Emit event for analytics
        if (result) {
          eventBus.emit('prediction:fetched', {
            predictionId,
            confidence: result.confidence,
            riskLevel: result.riskLevel,
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch prediction');
        errorHandler.handleError(error, 'RealtimePredictionDisplay', 'fetchPrediction', {
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
        });
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();

    // Subscribe to real-time updates
    const unsubscribe = eventBus.subscribe(`prediction:${predictionId}`, (data: any) => {
      setPrediction(prev => ({
        ...prev,
        ...data,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [predictionId, filterStore]);

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!prediction) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No prediction data available
      </Alert>
    );
  }

  const validationStatus = validatePrediction(prediction, currentProfile);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Prediction Details</Typography>
        <Box alignItems="center" display="flex" gap={1}>
          <ConfidenceIndicator value={prediction.confidence} />
          <RiskLevelIndicator level={prediction.riskLevel} />
          <ValidationStatus
            message={validationStatus.reason || 'Validated'}
            status={validationStatus.isValid ? 'valid' : 'invalid'}
          />
        </Box>
      </Box>

      <Box mb={3}>
        <Typography gutterBottom color="textSecondary" variant="subtitle2">
          Model Information
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={`Version: ${modelVersioning.getCurrentVersion()}`} size="small" />
          <Chip
            label={`Last Updated: ${new Date(prediction.timestamp).toLocaleString()}`}
            size="small"
          />
        </Stack>
      </Box>

      <Box mb={3}>
        <Typography gutterBottom color="textSecondary" variant="subtitle2">
          SHAP Values
        </Typography>
        <ShapExplanation explanation={prediction.explanation} />
      </Box>

      <Box>
        <Typography gutterBottom color="textSecondary" variant="subtitle2">
          Risk Profile Validation
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            color={prediction.stake <= currentProfile.max_stake_percentage ? 'success' : 'error'}
            label={`Max Stake: ${(currentProfile.max_stake_percentage * 100).toFixed(1)}%`}
            size="small"
          />
          <Chip
            color={
              prediction.confidence >= currentProfile.min_confidence_threshold ? 'success' : 'error'
            }
            label={`Min Confidence: ${(currentProfile.min_confidence_threshold * 100).toFixed(1)}%`}
            size="small"
          />
          <Chip
            color={
              prediction.volatility <= currentProfile.volatility_tolerance ? 'success' : 'error'
            }
            label={`Volatility: ${(prediction.volatility * 100).toFixed(1)}%`}
            size="small"
          />
        </Stack>
      </Box>
    </Paper>
  );
};

const validatePrediction = (
  prediction: Prediction,
  riskProfile: RiskProfile
): { isValid: boolean; reason?: string } => {
  if (prediction.confidence < riskProfile.min_confidence_threshold) {
    return {
      isValid: false,
      reason: `Confidence below threshold (${(riskProfile.min_confidence_threshold * 100).toFixed(1)}%)`,
    };
  }

  if (prediction.volatility > riskProfile.volatility_tolerance) {
    return {
      isValid: false,
      reason: `Volatility exceeds tolerance (${(riskProfile.volatility_tolerance * 100).toFixed(1)}%)`,
    };
  }

  if (prediction.riskScore > riskProfile.max_risk_score) {
    return {
      isValid: false,
      reason: `Risk score exceeds maximum (${(riskProfile.max_risk_score * 100).toFixed(1)}%)`,
    };
  }

  return { isValid: true };
};
