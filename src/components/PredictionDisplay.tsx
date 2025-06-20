import React, { useEffect, useState, useMemo } from 'react';
import { useUnifiedAnalytics } from '../hooks/useUnifiedAnalytics';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { NoResultsFallback } from './NoResultsFallback';

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

interface PredictionDisplayProps {
  eventId: string;
}

type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'positive' | 'negative';

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ eventId }) => {
  // Unified analytics for prediction data
  const { ml } = useUnifiedAnalytics({ ml: { autoUpdate: false } });
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [changedValues, setChangedValues] = useState<Set<string>>(new Set());

  // Memoize prediction for performance
  const prediction = useMemo(() => {
    if (!ml || !ml.mlResult) return null;
    // Find prediction for this eventId if available
    // (Assume mlResult.predictions is an array of objects with eventId)
    if (Array.isArray(ml.mlResult.predictions)) {
      return ml.mlResult.predictions.find((p: { eventId: string }) => p.eventId === eventId) || null;
    }
    return null;
  }, [ml, eventId]);

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

  if (ml?.isLoading) {
    return (
      <PredictionContainer>
        <Typography color="textSecondary" variant="body2">
          Loading prediction...
        </Typography>
      </PredictionContainer>
    );
  }
  if (ml?.error) {
    return <NoResultsFallback />;
  }
  if (!prediction) {
    return <NoResultsFallback />;
  }

  // Transform SHAP values for visualization
  const shapData = useMemo(() => {
    if (!prediction.shap_values) return [];
    return Object.entries(prediction.shap_values)
      .map(([feature, value]) => ({
        feature,
        value: value as number,
        absValue: Math.abs(value as number),
      }))
      .filter(item => {
        if (filterType === 'positive') return item.value > 0;
        if (filterType === 'negative') return item.value < 0;
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        return multiplier * (b.absValue - a.absValue);
      })
      .slice(0, 10);
  }, [prediction, filterType, sortOrder]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) =>
    setFilterAnchorEl(event.currentTarget);
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) =>
    setSortAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const handleSortClose = () => setSortAnchorEl(null);

  return (
    <PredictionContainer>
      <Typography gutterBottom variant="h6">
        Prediction Analysis
      </Typography>

      <ValueDisplay changed={changedValues.has('confidence')}>
        <Typography gutterBottom variant="subtitle2">
          Confidence Level
        </Typography>
        <ConfidenceBar
          color={prediction.confidence > 0.7 ? 'success' : 'primary'}
          value={prediction.confidence * 100}
          variant="determinate"
        />
        <Typography color="textSecondary" mt={1} variant="body2">
          {prediction.confidence.toFixed(2)} ({prediction.risk_level})
        </Typography>
      </ValueDisplay>

      <ValueDisplay changed={changedValues.has('stake')}>
        <Typography gutterBottom variant="subtitle2">
          Recommended Stake
        </Typography>
        <Typography color="primary" variant="h6">
          ${prediction.recommended_stake?.toFixed(2) ?? '0.00'}
        </Typography>
      </ValueDisplay>

      <Box mt={2}>
        <Box alignItems="center" display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2">Feature Impact (SHAP Values)</Typography>
          <ControlsContainer>
            <Tooltip title="Filter">
              <IconButton aria-label="Filter SHAP values" size="small" onClick={handleFilterClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton aria-label="Sort SHAP values" size="small" onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Tooltip>
          </ControlsContainer>
        </Box>

        <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterClose}>
          <MenuItem
            onClick={() => {
              setFilterType('all');
              handleFilterClose();
            }}
          >
            All Features
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterType('positive');
              handleFilterClose();
            }}
          >
            Positive Impact
          </MenuItem>
          <MenuItem
            onClick={() => {
              setFilterType('negative');
              handleFilterClose();
            }}
          >
            Negative Impact
          </MenuItem>
        </Menu>

        <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortClose}>
          <MenuItem
            onClick={() => {
              setSortOrder('desc');
              handleSortClose();
            }}
          >
            Highest Impact First
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSortOrder('asc');
              handleSortClose();
            }}
          >
            Lowest Impact First
          </MenuItem>
        </Menu>

        <ShapContainer>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart aria-label="SHAP Feature Impact Bar Chart" data={shapData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="feature" tick={{ fontSize: 12 }} type="category" width={150} />
              <RechartsTooltip
                formatter={(value: number, name: string, props: { payload: { index: number } }) => {
                  const item = shapData[props.payload.index];
                  return [
                    `${item.value.toFixed(4)} (${item.value > 0 ? 'Positive' : 'Negative'} Impact)`,
                    'SHAP Value',
                  ];
                }}
                labelFormatter={(label: string) => `Feature: ${label}`}
              />
              <Bar animationDuration={500} dataKey="absValue">
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#4caf50' : '#f44336'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ShapContainer>
      </Box>
    </PredictionContainer>
  );
};
