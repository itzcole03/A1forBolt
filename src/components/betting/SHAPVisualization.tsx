import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { ShapValue } from '../../types/explainability';

interface SHAPVisualizationProps {
  shapValues: Record<string, number>;
  baseValue?: number;
  confidence?: number;
  isLoading?: boolean;
  error?: string | null;
}

const SHAPVisualization: React.FC<SHAPVisualizationProps> = ({
  shapValues,
  baseValue,
  confidence,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" height="400px" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!shapValues || Object.keys(shapValues).length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No SHAP values available for this prediction
      </Alert>
    );
  }

  // Sort features by absolute SHAP value
  const sortedFeatures = Object.entries(shapValues)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 10); // Show top 10 features

  const chartData = {
    labels: sortedFeatures.map(([feature]) => feature),
    datasets: [
      {
        label: 'SHAP Value',
        data: sortedFeatures.map(([, value]) => value),
        backgroundColor: sortedFeatures.map(([, value]) =>
          value > 0 ? 'rgba(93, 92, 222, 0.8)' : 'rgba(255, 107, 53, 0.8)'
        ),
        borderColor: sortedFeatures.map(([, value]) =>
          value > 0 ? 'rgb(93, 92, 222)' : 'rgb(255, 107, 53)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `SHAP Value: ${value.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'SHAP Value',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Box>
      <Box className="h-96">
        <Bar data={chartData} options={options} />
      </Box>
      <Box mt={2}>
        <Typography color="text.secondary" variant="body2">
          SHAP (SHapley Additive exPlanations) values show how each feature contributes to the
          prediction. Positive values (blue) increase the prediction, while negative values (orange)
          decrease it.
        </Typography>
        {baseValue !== undefined && (
          <Typography color="text.secondary" mt={1} variant="body2">
            Base Value: {baseValue.toFixed(4)}
          </Typography>
        )}
        {confidence !== undefined && (
          <Typography color="text.secondary" mt={1} variant="body2">
            Prediction Confidence: {(confidence * 100).toFixed(1)}%
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(SHAPVisualization);
