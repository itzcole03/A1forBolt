import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import type {
  BarProps,
  XAxisProps,
  YAxisProps,
  TooltipProps,
  LegendProps,
  ScatterProps,
  LineProps,
} from 'recharts';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip as MuiTooltip,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
  ShapExplanation as ShapExplanationType,
  ModelExplanation,
} from '../../core/types/prediction';

interface ShapExplanationProps {
  explanation: ModelExplanation;
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      aria-labelledby={`shap-tab-${index}`}
      hidden={value !== index}
      id={`shap-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const ShapExplanation: React.FC<ShapExplanationProps> = ({
  explanation,
  className = '',
}) => {
  const [tabValue, setTabValue] = useState(0);
  const { shapExplanation, modelName, confidence } = explanation;

  // Prepare data for different visualizations
  const barChartData = (shapExplanation?.shapValues ?? []).map(value => ({
    feature: value.feature,
    impact: value.impact,
    direction: value.direction,
    value: value.value,
    confidence: value.confidence || 0.8,
  }));

  const scatterData = (shapExplanation?.shapValues ?? []).map(value => ({
    feature: value.feature,
    impact: value.impact,
    value: value.value,
    confidence: value.confidence || 0.8,
  }));

  const waterfallData = (shapExplanation?.shapValues ?? []).reduce(
    (acc, value, index) => {
      const prevValue = index === 0 ? shapExplanation.baseValue : acc[index - 1].end;
      return [
        ...acc,
        {
          feature: value.feature,
          start: prevValue,
          end: prevValue + value.impact,
          impact: value.impact,
          confidence: value.confidence || 0.8,
        },
      ];
    },
    [] as Array<{ feature: string; start: number; end: number; impact: number; confidence: number }>
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate feature impact statistics
  const positiveFeatures = barChartData.filter(f => f.impact > 0);
  const negativeFeatures = barChartData.filter(f => f.impact < 0);
  const totalImpact = barChartData.reduce((sum, f) => sum + Math.abs(f.impact), 0);
  const topFeatures = [...barChartData]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  return (
    <Paper className={`p-4 ${className}`} elevation={3}>
      <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">{modelName}</Typography>
        <Box alignItems="center" display="flex" gap={2}>
          <Chip
            color="success"
            icon={<TrendingUpIcon />}
            label={`${positiveFeatures.length} Positive Features`}
            size="small"
          />
          <Chip
            color="error"
            icon={<TrendingDownIcon />}
            label={`${negativeFeatures.length} Negative Features`}
            size="small"
          />
          <Chip color="primary" label={`Total Impact: ${totalImpact.toFixed(3)}`} size="small" />
        </Box>
      </Box>

      <Box mb={2}>
        <Typography gutterBottom color="textSecondary" variant="subtitle2">
          Top Influential Features
        </Typography>
        <Stack direction="row" spacing={1}>
          {topFeatures.map((feature, index) => (
            <Chip
              key={index}
              color={feature.impact > 0 ? 'success' : 'error'}
              label={`${feature.feature}: ${feature.impact.toFixed(3)}`}
              size="small"
            />
          ))}
        </Stack>
      </Box>

      <Tabs centered value={tabValue} onChange={handleTabChange}>
        <Tab label="Feature Impact" />
        <Tab label="Feature Dependence" />
        <Tab label="Waterfall" />
      </Tabs>

      <TabPanel index={0} value={tabValue}>
        <Box height={400}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={barChartData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="feature" tick={{ fontSize: 12 }} type="category" width={150} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const item = barChartData[props.payload.index];
                  return [
                    `${item.impact.toFixed(4)} (${item.impact > 0 ? 'Positive' : 'Negative'} Impact)`,
                    'Impact',
                  ];
                }}
                labelFormatter={(label: string) => `Feature: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="impact"
                fill="#8884d8"
                isAnimationActive={false}
                label={{ position: 'right' }}
              >
                {barChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact > 0 ? '#4caf50' : '#f44336'}
                    opacity={entry.confidence}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </TabPanel>

      <TabPanel index={1} value={tabValue}>
        <Box height={400}>
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart>
              <XAxis dataKey="value" name="Feature Value" />
              <YAxis dataKey="impact" name="Impact" />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const item = scatterData[props.payload.index];
                  return [
                    `${item.impact.toFixed(4)} (${item.impact > 0 ? 'Positive' : 'Negative'} Impact)`,
                    'Impact',
                  ];
                }}
                labelFormatter={(label: string) => `Feature: ${label}`}
              />
              <Legend />
              <Scatter data={scatterData} fill="#8884d8" isAnimationActive={false}>
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact > 0 ? '#4caf50' : '#f44336'}
                    opacity={entry.confidence}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </TabPanel>

      <TabPanel index={2} value={tabValue}>
        <Box height={400}>
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={waterfallData}>
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const item = waterfallData[props.payload.index];
                  return [
                    `${item.impact.toFixed(4)} (${item.impact > 0 ? 'Positive' : 'Negative'} Impact)`,
                    'Impact',
                  ];
                }}
                labelFormatter={(label: string) => `Feature: ${label}`}
              />
              <Legend />
              <Line
                dataKey="end"
                dot={{ fill: '#8884d8' }}
                isAnimationActive={false}
                stroke="#8884d8"
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </TabPanel>
    </Paper>
  );
};
