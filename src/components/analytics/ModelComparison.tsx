import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useModelPerformance } from '../../hooks/useModelPerformance';

interface ModelComparisonProps {
  modelNames: string[];
}

type MetricType =
  | 'roi'
  | 'winRate'
  | 'profitFactor'
  | 'sharpeRatio'
  | 'maxDrawdown'
  | 'kellyCriterion'
  | 'expectedValue'
  | 'calibrationScore';

export const ModelComparison: React.FC<ModelComparisonProps> = ({ modelNames }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('roi');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [viewMode, setViewMode] = useState<'table' | 'radar' | 'bar'>('table');

  const modelPerformances = modelNames.map(modelName => {
    const { performance, isLoading, error } = useModelPerformance(modelName, timeframe);
    return { modelName, performance, isLoading, error };
  });

  const formatMetric = (value: number, type: 'percentage' | 'currency' | 'number' = 'number') => {
    if (type === 'percentage') {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (type === 'currency') {
      return `$${value.toFixed(2)}`;
    }
    return value.toFixed(2);
  };

  const getMetricType = (metric: MetricType): 'percentage' | 'currency' | 'number' => {
    switch (metric) {
      case 'roi':
      case 'winRate':
      case 'maxDrawdown':
      case 'kellyCriterion':
        return 'percentage';
      case 'expectedValue':
        return 'currency';
      default:
        return 'number';
    }
  };

  const getMetricColor = (value: number, metric: MetricType) => {
    if (metric === 'maxDrawdown') {
      return value > 0.2 ? 'error.main' : value > 0.1 ? 'warning.main' : 'success.main';
    }
    if (metric === 'calibrationScore') {
      return value > 0.8 ? 'success.main' : value > 0.6 ? 'warning.main' : 'error.main';
    }
    if (metric === 'kellyCriterion') {
      return value > 0.1 ? 'success.main' : value > 0.05 ? 'warning.main' : 'error.main';
    }
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.primary';
  };

  const metrics: { value: MetricType; label: string }[] = [
    { value: 'roi', label: 'ROI' },
    { value: 'winRate', label: 'Win Rate' },
    { value: 'profitFactor', label: 'Profit Factor' },
    { value: 'sharpeRatio', label: 'Sharpe Ratio' },
    { value: 'maxDrawdown', label: 'Max Drawdown' },
    { value: 'kellyCriterion', label: 'Kelly Criterion' },
    { value: 'expectedValue', label: 'Expected Value' },
    { value: 'calibrationScore', label: 'Calibration Score' },
  ];

  const radarData = modelPerformances
    .map(({ modelName, performance }) => {
      if (!performance) return null;
      return {
        model: modelName,
        ROI: performance.roi * 100,
        'Win Rate': performance.winRate * 100,
        'Profit Factor': performance.profitFactor,
        'Sharpe Ratio': performance.sharpeRatio,
        Calibration: performance.calibrationScore * 100,
      };
    })
    .filter((data): data is NonNullable<typeof data> => data !== null);

  const barData = modelPerformances
    .map(({ modelName, performance }) => {
      if (!performance) return null;
      return {
        model: modelName,
        value: performance[selectedMetric],
        formattedValue: formatMetric(performance[selectedMetric], getMetricType(selectedMetric)),
      };
    })
    .filter(Boolean);

  return (
    <Card>
      <CardContent>
        <Box alignItems="center" display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Model Comparison</Typography>
          <Box display="flex" gap={2}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
            >
              <ToggleButton value="table">Table</ToggleButton>
              <ToggleButton value="radar">Radar</ToggleButton>
              <ToggleButton value="bar">Bar</ToggleButton>
            </ToggleButtonGroup>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                label="Metric"
                value={selectedMetric}
                onChange={e => setSelectedMetric(e.target.value as MetricType)}
              >
                {metrics.map(metric => (
                  <MenuItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          </Box>
        </Box>

        {viewMode === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  {metrics.map(metric => (
                    <TableCell
                      key={metric.value}
                      sx={{
                        backgroundColor:
                          selectedMetric === metric.value ? 'action.selected' : 'inherit',
                      }}
                    >
                      {metric.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modelPerformances.map(({ modelName, performance, isLoading, error }) => (
                  <TableRow key={modelName}>
                    <TableCell>{modelName}</TableCell>
                    {metrics.map(metric => (
                      <TableCell
                        key={metric.value}
                        sx={{
                          color: performance
                            ? getMetricColor(performance[metric.value], metric.value)
                            : 'inherit',
                        }}
                      >
                        {isLoading
                          ? 'Loading...'
                          : error
                            ? 'Error'
                            : performance
                              ? formatMetric(performance[metric.value], getMetricType(metric.value))
                              : 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : viewMode === 'radar' ? (
          <Box height={500}>
            <ResponsiveContainer height="100%" width="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="model" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {radarData.map((data, index) => (
                  <Radar
                    key={data.model}
                    dataKey={Object.keys(data).filter(key => key !== 'model')[0]}
                    fill={`hsla(${(index * 360) / radarData.length}, 70%, 50%, 0.2)`}
                    name={data.model}
                    stroke={`hsl(${(index * 360) / radarData.length}, 70%, 50%)`}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box height={500}>
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatMetric(value, getMetricType(selectedMetric))}
                  labelFormatter={label =>
                    `${label} - ${metrics.find(m => m.value === selectedMetric)?.label}`
                  }
                />
                <Bar
                  dataKey="value"
                  fill={`hsl(${Math.random() * 360}, 70%, 50%)`}
                  name={metrics.find(m => m.value === selectedMetric)?.label}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
