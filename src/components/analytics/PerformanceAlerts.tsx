import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  IconButton,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PerformanceMonitor } from '../../core/analytics/PerformanceMonitor';
import { useLogger } from '../../hooks/useLogger';
import { useMetrics } from '../../hooks/useMetrics';

interface PerformanceAlertsProps {
  modelName?: string;
  onAlertClick?: (alert: any) => void;
}

export const PerformanceAlerts: React.FC<PerformanceAlertsProps> = ({
  modelName,
  onAlertClick,
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severity, setSeverity] = useState<'warning' | 'critical' | 'all'>('all');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const logger = useLogger();
  const metrics = useMetrics();

  useEffect(() => {
    const fetchAlerts = () => {
      const monitor = PerformanceMonitor.getInstance(logger, metrics);
      const startTime = getStartTime(timeframe);
      const filteredAlerts = monitor.getAlerts(
        modelName,
        severity === 'all' ? undefined : severity,
        startTime
      );
      setAlerts(filteredAlerts);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [modelName, severity, timeframe, logger, metrics]);

  const getStartTime = (timeframe: string): Date | undefined => {
    if (timeframe === 'all') return undefined;

    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return undefined;
    }
  };

  const handleClearAlerts = () => {
    const monitor = PerformanceMonitor.getInstance(logger, metrics);
    monitor.clearAlerts(modelName);
    setAlerts([]);
  };

  const formatMetricValue = (metric: string, value: number): string => {
    if (metric === 'roi' || metric === 'winRate' || metric === 'maxDrawdown') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardContent>
        <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Performance Alerts</Typography>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                label="Severity"
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                label="Timeframe"
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as any)}
              >
                <MenuItem value="day">Last 24 Hours</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" onClick={handleClearAlerts}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={2}>
          {alerts.length === 0 ? (
            <Alert severity="info">No alerts in the selected timeframe.</Alert>
          ) : (
            alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.severity}
                sx={{ cursor: onAlertClick ? 'pointer' : 'default' }}
                onClick={() => onAlertClick?.(alert)}
              >
                <AlertTitle>
                  {alert.modelName} - {alert.metric}
                </AlertTitle>
                <Box alignItems="center" display="flex" gap={1}>
                  <Typography>
                    Current value: {formatMetricValue(alert.metric, alert.value)}
                  </Typography>
                  <Chip
                    color={alert.severity === 'critical' ? 'error' : 'warning'}
                    label={`Threshold: ${formatMetricValue(alert.metric, alert.threshold)}`}
                    size="small"
                  />
                  <Typography color="text.secondary" variant="caption">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Alert>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
