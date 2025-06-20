import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useModelPerformance } from '../../hooks/useModelPerformance';
import { PerformanceAlerts } from './PerformanceAlerts';
import { PerformanceExport } from './PerformanceExport';
import { ModelComparison } from './ModelComparison';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';

interface ModelPerformanceDashboardProps {
  modelName: string;
  availableModels?: string[];
}

export const ModelPerformanceDashboard: React.FC<ModelPerformanceDashboardProps> = ({
  modelName,
  availableModels = [],
}) => {
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { performance, history, isLoading, error, timeframe, setTimeframe } =
    useModelPerformance(modelName);

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!performance) {
    return (
      <Box p={2}>
        <Alert severity="info">No performance data available for this model.</Alert>
      </Box>
    );
  }

  const formatMetric = (value: number, type: 'percentage' | 'currency' | 'number' = 'number') => {
    if (type === 'percentage') {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (type === 'currency') {
      return `$${value.toFixed(2)}`;
    }
    return value.toFixed(2);
  };

  const getMetricColor = (value: number, label: string) => {
    if (label === 'Max Drawdown') {
      return value > 0.2 ? 'error.main' : value > 0.1 ? 'warning.main' : 'success.main';
    }
    if (label === 'Calibration Score') {
      return value > 0.8 ? 'success.main' : value > 0.6 ? 'warning.main' : 'error.main';
    }
    if (label === 'Kelly Criterion') {
      return value > 0.1 ? 'success.main' : value > 0.05 ? 'warning.main' : 'error.main';
    }
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.primary';
  };

  const metrics = [
    { label: 'ROI', value: performance.roi, type: 'percentage' as const },
    { label: 'Win Rate', value: performance.winRate, type: 'percentage' as const },
    { label: 'Profit Factor', value: performance.profitFactor, type: 'number' as const },
    { label: 'Sharpe Ratio', value: performance.sharpeRatio, type: 'number' as const },
    { label: 'Max Drawdown', value: performance.maxDrawdown, type: 'percentage' as const },
    { label: 'Kelly Criterion', value: performance.kellyCriterion, type: 'percentage' as const },
    { label: 'Expected Value', value: performance.expectedValue, type: 'currency' as const },
    { label: 'Calibration Score', value: performance.calibrationScore, type: 'number' as const },
    { label: 'Total Predictions', value: performance.totalPredictions, type: 'number' as const },
    { label: 'Total Stake', value: performance.totalStake, type: 'currency' as const },
    { label: 'Total Payout', value: performance.totalPayout, type: 'currency' as const },
  ];

  return (
    <Box p={2}>
      <Box alignItems="center" display="flex" justifyContent="space-between" mb={3}>
        <Typography component="h2" variant="h5">
          Model Performance Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              label="Timeframe"
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as 'day' | 'week' | 'month' | 'all')}
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={() => setShowExport(true)}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      <Tabs sx={{ mb: 3 }} value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label="Performance Overview" />
        {availableModels.length > 0 && <Tab label="Model Comparison" />}
      </Tabs>

      {activeTab === 0 ? (
        <>
          <Grid container mb={4} spacing={3}>
            {metrics.map(metric => (
              <Grid key={metric.label} item md={3} sm={6} xs={12}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom color="textSecondary">
                      {metric.label}
                    </Typography>
                    <Typography
                      color={getMetricColor(metric.value, metric.label)}
                      component="div"
                      variant="h6"
                    >
                      {formatMetric(metric.value, metric.type)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item md={8} xs={12}>
              <Card>
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    Performance History
                  </Typography>
                  <Box height={400}>
                    <ResponsiveContainer height="100%" width="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={timestamp => new Date(timestamp).toLocaleDateString()}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis orientation="right" yAxisId="right" />
                        <Tooltip
                          formatter={(value: number) => formatMetric(value, 'percentage')}
                          labelFormatter={timestamp => new Date(timestamp).toLocaleString()}
                        />
                        <Legend />
                        <Line
                          dataKey="metrics.roi"
                          name="ROI"
                          stroke="#8884d8"
                          type="monotone"
                          yAxisId="left"
                        />
                        <Line
                          dataKey="metrics.winRate"
                          name="Win Rate"
                          stroke="#82ca9d"
                          type="monotone"
                          yAxisId="left"
                        />
                        <Line
                          dataKey="metrics.profitFactor"
                          name="Profit Factor"
                          stroke="#ffc658"
                          type="monotone"
                          yAxisId="right"
                        />
                        <Line
                          dataKey="metrics.calibrationScore"
                          name="Calibration Score"
                          stroke="#ff8042"
                          type="monotone"
                          yAxisId="right"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item md={4} xs={12}>
              <PerformanceAlerts modelName={modelName} />
            </Grid>
          </Grid>
        </>
      ) : (
        <ModelComparison modelNames={[modelName, ...availableModels]} />
      )}

      {showExport && (
        <PerformanceExport modelName={modelName} onClose={() => setShowExport(false)} />
      )}
    </Box>
  );
};
