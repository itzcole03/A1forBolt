import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '@/services/analytics';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AnalyticsStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface PerformanceDataPoint {
  timestamp: string;
  value: number;
}

interface SportDistribution {
  name: string;
  value: number;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<AnalyticsStat[]>({
    queryKey: ['analytics-stats', timeRange],
    queryFn: () => analyticsService.getAnalyticsStats(timeRange),
  });

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = useQuery<PerformanceDataPoint[]>({
    queryKey: ['analytics-performance', timeRange],
    queryFn: () => analyticsService.getPerformanceData(timeRange),
  });

  const {
    data: sportDistribution,
    isLoading: distributionLoading,
    error: distributionError,
  } = useQuery<SportDistribution[]>({
    queryKey: ['analytics-distribution', timeRange],
    queryFn: () => analyticsService.getSportDistribution(timeRange),
  });

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  if (statsError || performanceError || distributionError) {
    return <ErrorMessage error={statsError || performanceError || distributionError} />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select label="Time Period" value={timeRange} onChange={handleTimeRangeChange}>
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {statsLoading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          stats?.map((stat: AnalyticsStat) => (
            <Grid key={stat.title} item md={3} sm={6} xs={12}>
              <Card>
                <CardContent>
                  <Typography gutterBottom color="textSecondary">
                    {stat.title}
                  </Typography>
                  <Typography component="div" variant="h5">
                    {stat.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {stat.trend === 'up' ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                    <Typography
                      color={stat.trend === 'up' ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                      variant="body2"
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}

        <Grid item xs={12}>
          <Card>
            <CardHeader
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
              title="Performance Over Time"
            />
            <CardContent>
              {performanceLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart
                      data={performanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line activeDot={{ r: 8 }} dataKey="value" stroke="#8884d8" type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
              title="Prediction Success by Sport"
            />
            <CardContent>
              {distributionLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart
                      data={sportDistribution}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
