import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  forecast?: number;
  lower_bound?: number;
  upper_bound?: number;
  feature?: string;
}

interface TimeSeriesState {
  timeSeries: TimeSeriesPoint[];
  loading: boolean;
  error: string | null;
}

export const useTimeSeries = () => {
  const [state, setState] = useState<TimeSeriesState>({
    timeSeries: [],
    loading: true,
    error: null,
  });

  const { token } = useAuth();

  const fetchTimeSeries = async () => {
    try {
      const response = await fetch('/api/predictions/time-series', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time series data');
      }

      const timeSeries = await response.json();
      setState(prev => ({
        ...prev,
        timeSeries,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      }));
    }
  };

  const getLatestTimeSeries = () => {
    if (state.timeSeries.length === 0) return null;
    return state.timeSeries[state.timeSeries.length - 1];
  };

  const getTimeSeriesHistory = (feature?: string) => {
    return state.timeSeries
      .filter(ts => !feature || ts.feature === feature)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getTimeSeriesTrend = (feature?: string) => {
    const history = getTimeSeriesHistory(feature);
    return history.map(h => ({
      timestamp: h.timestamp,
      value: h.value,
      forecast: h.forecast,
      lower_bound: h.lower_bound,
      upper_bound: h.upper_bound,
    }));
  };

  const getTimeSeriesFeatures = () => {
    const features = new Set<string>();
    state.timeSeries.forEach(ts => {
      if (ts.feature) features.add(ts.feature);
    });
    return Array.from(features);
  };

  const getTimeSeriesSummary = () => {
    const features = getTimeSeriesFeatures();
    const summary = {
      total_points: state.timeSeries.length,
      features: features.length,
      time_range: {
        start: state.timeSeries[0]?.timestamp,
        end: state.timeSeries[state.timeSeries.length - 1]?.timestamp,
      },
      feature_stats: features.map(feature => {
        const points = state.timeSeries.filter(ts => ts.feature === feature);
        const values = points.map(p => p.value);
        return {
          feature,
          count: points.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }),
    };
    return summary;
  };

  const getForecastAccuracy = (feature?: string) => {
    const history = getTimeSeriesHistory(feature);
    const forecastPoints = history.filter(h => h.forecast !== undefined);

    if (forecastPoints.length === 0) return null;

    let totalError = 0;
    let totalPoints = 0;

    for (const point of forecastPoints) {
      if (point.forecast !== undefined) {
        const error = Math.abs(point.value - point.forecast);
        totalError += error;
        totalPoints++;
      }
    }

    return totalPoints > 0 ? totalError / totalPoints : null;
  };

  const getConfidenceIntervals = (feature?: string) => {
    const history = getTimeSeriesHistory(feature);
    return history.filter(h => h.lower_bound !== undefined && h.upper_bound !== undefined);
  };

  useEffect(() => {
    if (token) {
      fetchTimeSeries();
    }
  }, [token]);

  return {
    timeSeries: state.timeSeries,
    loading: state.loading,
    error: state.error,
    fetchTimeSeries,
    getLatestTimeSeries,
    getTimeSeriesHistory,
    getTimeSeriesTrend,
    getTimeSeriesFeatures,
    getTimeSeriesSummary,
    getForecastAccuracy,
    getConfidenceIntervals,
  };
};
