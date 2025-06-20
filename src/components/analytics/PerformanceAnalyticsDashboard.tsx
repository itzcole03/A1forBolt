import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Avatar,
  Badge,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  MonetizationOn,
  Warning,
  Info,
  Download,
  Settings,
  Timeline,
  ExpandMore,
  Refresh,
  Speed,
  ShowChart,
  Analytics,
  Psychology,
  EmojiEvents,
  FilterList,
  CalendarToday,
  PieChart,
  BarChart,
  AutoGraph,
  Insights,
  PrecisionManufacturing,
  TrendingFlat,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { useUnifiedAnalytics } from "../../hooks/useUnifiedAnalytics";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "../../utils/formatters";

interface PerformanceMetrics {
  totalBets: number;
  winRate: number;
  roi: number;
  profitLoss: number;
  avgOdds: number;
  avgStake: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winStreak: number;
  lossStreak: number;
  profitFactor: number;
  kellyOptimal: number;
  consistencyScore: number;
  riskAdjustedReturn: number;
  confidenceAccuracy: number;
  modelAccuracy: number;
}

interface PredictionPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  calibration: number;
  coverage: number;
  totalPredictions: number;
  profitContribution: number;
  avgConfidence: number;
  riskAdjustedScore: number;
}

interface TimeSeriesData {
  timestamp: string;
  cumulativeProfit: number;
  winRate: number;
  roi: number;
  confidence: number;
  volume: number;
  drawdown: number;
}

interface CategoryPerformance {
  category: string;
  bets: number;
  winRate: number;
  roi: number;
  profit: number;
  avgOdds: number;
  riskLevel: "low" | "medium" | "high";
}

interface PerformanceAnalyticsDashboardProps {
  userId?: string;
  timeRange?: "7d" | "30d" | "90d" | "1y" | "all";
  showAdvancedMetrics?: boolean;
}

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

const PIE_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

export const PerformanceAnalyticsDashboard: React.FC<
  PerformanceAnalyticsDashboardProps
> = ({ userId = "default", timeRange = "30d", showAdvancedMetrics = true }) => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);

  // Performance Data State
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [predictions, setPredictions] = useState<PredictionPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryPerformance[]
  >([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Analytics Hook
  const { performance, ml, betting } = useUnifiedAnalytics({
    performance: {
      autoUpdate: true,
      updateInterval: 60000,
      timeRange: selectedTimeRange,
      userId,
    },
    ml: { autoUpdate: true },
    betting: { autoUpdate: true },
  });

  // Load Performance Data
  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate loading performance data
      const mockMetrics: PerformanceMetrics = {
        totalBets: 1247,
        winRate: 0.624,
        roi: 0.142,
        profitLoss: 8432.5,
        avgOdds: 2.15,
        avgStake: 125.0,
        sharpeRatio: 1.73,
        maxDrawdown: -0.085,
        winStreak: 12,
        lossStreak: 5,
        profitFactor: 1.89,
        kellyOptimal: 0.08,
        consistencyScore: 0.78,
        riskAdjustedReturn: 0.196,
        confidenceAccuracy: 0.856,
        modelAccuracy: 0.681,
      };

      const mockPredictions: PredictionPerformance[] = [
        {
          modelName: "Ensemble ML",
          accuracy: 0.725,
          precision: 0.698,
          recall: 0.742,
          f1Score: 0.719,
          calibration: 0.891,
          coverage: 0.856,
          totalPredictions: 456,
          profitContribution: 3247.8,
          avgConfidence: 0.724,
          riskAdjustedScore: 0.832,
        },
        {
          modelName: "Deep Learning",
          accuracy: 0.689,
          precision: 0.672,
          recall: 0.698,
          f1Score: 0.685,
          calibration: 0.823,
          coverage: 0.779,
          totalPredictions: 389,
          profitContribution: 2156.4,
          avgConfidence: 0.689,
          riskAdjustedScore: 0.756,
        },
        {
          modelName: "Random Forest",
          accuracy: 0.651,
          precision: 0.634,
          recall: 0.669,
          f1Score: 0.651,
          calibration: 0.778,
          coverage: 0.712,
          totalPredictions: 402,
          profitContribution: 1843.3,
          avgConfidence: 0.651,
          riskAdjustedScore: 0.698,
        },
      ];

      // Generate time series data
      const mockTimeSeriesData: TimeSeriesData[] = [];
      const startDate = new Date();
      startDate.setDate(
        startDate.getDate() - parseInt(selectedTimeRange.replace(/\D/g, "")) ||
          30,
      );

      let cumulativeProfit = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const dailyReturn = (Math.random() - 0.45) * 200; // Slight positive bias
        cumulativeProfit += dailyReturn;

        mockTimeSeriesData.push({
          timestamp: date.toISOString().split("T")[0],
          cumulativeProfit,
          winRate: 0.55 + (Math.random() - 0.5) * 0.2,
          roi: 0.12 + (Math.random() - 0.5) * 0.1,
          confidence: 0.7 + (Math.random() - 0.5) * 0.3,
          volume: Math.floor(Math.random() * 50) + 20,
          drawdown: Math.min(
            0,
            cumulativeProfit -
              Math.max(...mockTimeSeriesData.map((d) => d.cumulativeProfit), 0),
          ),
        });
      }

      const mockCategoryPerformance: CategoryPerformance[] = [
        {
          category: "NBA Points",
          bets: 234,
          winRate: 0.647,
          roi: 0.178,
          profit: 2341.5,
          avgOdds: 1.95,
          riskLevel: "medium",
        },
        {
          category: "NFL Spreads",
          bets: 187,
          winRate: 0.598,
          roi: 0.142,
          profit: 1876.2,
          avgOdds: 1.91,
          riskLevel: "high",
        },
        {
          category: "MLB Over/Under",
          bets: 156,
          winRate: 0.673,
          roi: 0.203,
          profit: 1987.4,
          avgOdds: 2.08,
          riskLevel: "low",
        },
        {
          category: "Soccer Goals",
          bets: 98,
          winRate: 0.612,
          roi: 0.089,
          profit: 789.6,
          avgOdds: 2.45,
          riskLevel: "high",
        },
      ];

      setMetrics(mockMetrics);
      setPredictions(mockPredictions);
      setTimeSeriesData(mockTimeSeriesData);
      setCategoryPerformance(mockCategoryPerformance);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Failed to load performance data");
      console.error("Performance data loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, userId]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Computed Values
  const filteredCategoryData = useMemo(() => {
    if (selectedCategory === "all") return categoryPerformance;
    return categoryPerformance.filter(
      (cat) => cat.category === selectedCategory,
    );
  }, [categoryPerformance, selectedCategory]);

  const performanceGrade = useMemo(() => {
    if (!metrics) return "N/A";

    const score =
      (metrics.winRate > 0.6 ? 20 : metrics.winRate * 33.33) +
      (metrics.roi > 0.15 ? 20 : metrics.roi * 133.33) +
      (metrics.sharpeRatio > 1.5 ? 20 : metrics.sharpeRatio * 13.33) +
      metrics.consistencyScore * 20 +
      (metrics.riskAdjustedReturn > 0.15
        ? 20
        : metrics.riskAdjustedReturn * 133.33);

    if (score >= 85) return "A+";
    if (score >= 80) return "A";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "C+";
    if (score >= 60) return "C";
    return "D";
  }, [metrics]);

  const radarChartData = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        metric: "Win Rate",
        value: metrics.winRate * 100,
        fullMark: 100,
      },
      {
        metric: "ROI",
        value: Math.min(metrics.roi * 500, 100), // Scale to 100
        fullMark: 100,
      },
      {
        metric: "Sharpe Ratio",
        value: Math.min(metrics.sharpeRatio * 33.33, 100),
        fullMark: 100,
      },
      {
        metric: "Consistency",
        value: metrics.consistencyScore * 100,
        fullMark: 100,
      },
      {
        metric: "Confidence Accuracy",
        value: metrics.confidenceAccuracy * 100,
        fullMark: 100,
      },
      {
        metric: "Model Accuracy",
        value: metrics.modelAccuracy * 100,
        fullMark: 100,
      },
    ];
  }, [metrics]);

  // Export Function
  const exportPerformanceReport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      userId,
      timeRange: selectedTimeRange,
      performanceGrade,
      metrics,
      predictions,
      categoryPerformance,
      summary: {
        totalProfit: metrics?.profitLoss || 0,
        winRate: metrics?.winRate || 0,
        roi: metrics?.roi || 0,
        sharpeRatio: metrics?.sharpeRatio || 0,
        bestCategory:
          categoryPerformance.reduce(
            (best, cat) => (cat.roi > best.roi ? cat : best),
            categoryPerformance[0] || {},
          )?.category || "N/A",
        topModel:
          predictions.reduce(
            (top, pred) => (pred.accuracy > top.accuracy ? pred : top),
            predictions[0] || {},
          )?.modelName || "N/A",
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    userId,
    selectedTimeRange,
    performanceGrade,
    metrics,
    predictions,
    categoryPerformance,
  ]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={loadPerformanceData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Analytics />
              Performance Analytics Dashboard
              <Badge
                badgeContent={performanceGrade}
                color={
                  performanceGrade.startsWith("A")
                    ? "success"
                    : performanceGrade.startsWith("B")
                      ? "warning"
                      : "error"
                }
                sx={{ ml: 1 }}
              >
                <EmojiEvents />
              </Badge>
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                >
                  <MenuItem value="7d">7 Days</MenuItem>
                  <MenuItem value="30d">30 Days</MenuItem>
                  <MenuItem value="90d">90 Days</MenuItem>
                  <MenuItem value="1y">1 Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={showComparison}
                    onChange={(e) => setShowComparison(e.target.checked)}
                  />
                }
                label="Benchmark"
              />
              <Tooltip title="Last updated">
                <Chip
                  label={lastUpdate.toLocaleTimeString()}
                  size="small"
                  icon={<Timeline />}
                />
              </Tooltip>
              <IconButton onClick={loadPerformanceData}>
                <Refresh />
              </IconButton>
              <IconButton onClick={exportPerformanceReport}>
                <Download />
              </IconButton>
            </Box>
          </Box>

          {/* Performance Overview Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(metrics?.profitLoss || 0)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total P&L
                </Typography>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mt={1}
                >
                  {(metrics?.profitLoss || 0) > 0 ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="secondary.main">
                  {formatPercentage(metrics?.winRate || 0)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Win Rate
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={
                      (metrics?.winRate || 0) > 0.6
                        ? "Excellent"
                        : (metrics?.winRate || 0) > 0.55
                          ? "Good"
                          : "Needs Improvement"
                    }
                    color={
                      (metrics?.winRate || 0) > 0.6
                        ? "success"
                        : (metrics?.winRate || 0) > 0.55
                          ? "warning"
                          : "error"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {formatPercentage(metrics?.roi || 0)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ROI
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metrics?.roi || 0) * 500, 100)}
                    color={
                      (metrics?.roi || 0) > 0.15
                        ? "success"
                        : (metrics?.roi || 0) > 0.05
                          ? "warning"
                          : "error"
                    }
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="info.main">
                  {(metrics?.sharpeRatio || 0).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Sharpe Ratio
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={
                      (metrics?.sharpeRatio || 0) > 1.5
                        ? "Excellent"
                        : (metrics?.sharpeRatio || 0) > 1.0
                          ? "Good"
                          : "Fair"
                    }
                    color={
                      (metrics?.sharpeRatio || 0) > 1.5
                        ? "success"
                        : (metrics?.sharpeRatio || 0) > 1.0
                          ? "warning"
                          : "default"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {formatPercentage(Math.abs(metrics?.maxDrawdown || 0))}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Max Drawdown
                </Typography>
                <Box mt={1}>
                  <Warning
                    color={
                      Math.abs(metrics?.maxDrawdown || 0) > 0.15
                        ? "error"
                        : Math.abs(metrics?.maxDrawdown || 0) > 0.1
                          ? "warning"
                          : "disabled"
                    }
                    fontSize="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4">{metrics?.totalBets || 0}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Bets
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="textSecondary"
                >
                  {metrics?.winStreak || 0}W / {metrics?.lossStreak || 0}L
                  streak
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Performance Trends" icon={<ShowChart />} />
            <Tab label="Model Analysis" icon={<PrecisionManufacturing />} />
            <Tab label="Category Breakdown" icon={<PieChart />} />
            <Tab label="Risk Analysis" icon={<Assessment />} />
            <Tab label="Insights" icon={<Insights />} />
          </Tabs>

          {/* Performance Trends Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Cumulative Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="cumulativeProfit"
                        fill={COLORS.primary}
                        fillOpacity={0.3}
                        stroke={COLORS.primary}
                        name="Cumulative Profit"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="winRate"
                        stroke={COLORS.success}
                        strokeWidth={2}
                        name="Win Rate"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="volume"
                        fill={COLORS.secondary}
                        opacity={0.6}
                        name="Daily Volume"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: 450 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Radar
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={false}
                      />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Model Analysis Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Model Performance Comparison
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Model</TableCell>
                          <TableCell>Accuracy</TableCell>
                          <TableCell>Precision</TableCell>
                          <TableCell>Recall</TableCell>
                          <TableCell>F1 Score</TableCell>
                          <TableCell>Calibration</TableCell>
                          <TableCell>Profit Contribution</TableCell>
                          <TableCell>Risk Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {predictions.map((model) => (
                          <TableRow key={model.modelName}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  sx={{ width: 32, height: 32, fontSize: 12 }}
                                >
                                  {model.modelName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </Avatar>
                                <Typography variant="body2">
                                  {model.modelName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatPercentage(model.accuracy)}
                                color={
                                  model.accuracy > 0.7
                                    ? "success"
                                    : model.accuracy > 0.6
                                      ? "warning"
                                      : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {formatPercentage(model.precision)}
                            </TableCell>
                            <TableCell>
                              {formatPercentage(model.recall)}
                            </TableCell>
                            <TableCell>{model.f1Score.toFixed(3)}</TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={model.calibration * 100}
                                sx={{ width: 60 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                color={
                                  model.profitContribution > 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {formatCurrency(model.profitContribution)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={model.riskAdjustedScore.toFixed(2)}
                                color={
                                  model.riskAdjustedScore > 0.8
                                    ? "success"
                                    : model.riskAdjustedScore > 0.7
                                      ? "warning"
                                      : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Model Contributions
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={predictions.map((p) => ({
                          name: p.modelName,
                          value: p.profitContribution,
                          color:
                            PIE_COLORS[
                              predictions.indexOf(p) % PIE_COLORS.length
                            ],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {predictions.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Category Breakdown Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Category Performance</Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        {categoryPerformance.map((cat) => (
                          <MenuItem key={cat.category} value={cat.category}>
                            {cat.category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={filteredCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="profit"
                        fill={COLORS.success}
                        name="Profit"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="winRate"
                        fill={COLORS.primary}
                        name="Win Rate"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Category Summary
                  </Typography>
                  <Stack spacing={2}>
                    {categoryPerformance.map((category) => (
                      <Box
                        key={category.category}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          backgroundColor:
                            selectedCategory === category.category
                              ? "action.selected"
                              : "inherit",
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="subtitle2">
                            {category.category}
                          </Typography>
                          <Chip
                            label={category.riskLevel}
                            color={
                              category.riskLevel === "low"
                                ? "success"
                                : category.riskLevel === "medium"
                                  ? "warning"
                                  : "error"
                            }
                            size="small"
                          />
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption">Bets</Typography>
                            <Typography variant="body2">
                              {category.bets}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">Win Rate</Typography>
                            <Typography variant="body2">
                              {formatPercentage(category.winRate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">ROI</Typography>
                            <Typography
                              variant="body2"
                              color={
                                category.roi >= 0
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              {formatPercentage(category.roi)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption">Profit</Typography>
                            <Typography
                              variant="body2"
                              color={
                                category.profit >= 0
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              {formatCurrency(category.profit)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Risk Analysis Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Metrics
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Value at Risk (VaR)
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h5" color="error.main">
                          {formatCurrency((metrics?.profitLoss || 0) * 0.05)}
                        </Typography>
                        <Typography variant="caption">
                          95% Confidence
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Expected Shortfall
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h5" color="warning.main">
                          {formatCurrency((metrics?.profitLoss || 0) * 0.08)}
                        </Typography>
                        <Typography variant="caption">
                          Conditional VaR
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Kelly Optimal Fraction
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h5" color="info.main">
                          {formatPercentage(metrics?.kellyOptimal || 0)}
                        </Typography>
                        <Typography variant="caption">
                          Recommended Size
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Risk-Adjusted Return
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h5" color="success.main">
                          {formatPercentage(metrics?.riskAdjustedReturn || 0)}
                        </Typography>
                        <Typography variant="caption">
                          Return per Unit Risk
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Drawdown Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        stroke={COLORS.error}
                        fill={COLORS.error}
                        fillOpacity={0.3}
                        name="Drawdown"
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption">
                        Max Drawdown Duration
                      </Typography>
                      <Typography variant="h6">14 days</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Recovery Time</Typography>
                      <Typography variant="h6">8 days</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Calmar Ratio</Typography>
                      <Typography variant="h6">
                        {(
                          (metrics?.roi || 0) /
                          Math.abs(metrics?.maxDrawdown || 0.01)
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Sterling Ratio</Typography>
                      <Typography variant="h6">
                        {(
                          (metrics?.roi || 0) /
                          (Math.abs(metrics?.maxDrawdown || 0.01) + 0.1)
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Insights Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Insights
                  </Typography>
                  <Stack spacing={2}>
                    <Alert severity="success" icon={<TrendingUp />}>
                      <Typography variant="subtitle2">
                        Strong Performance Detected
                      </Typography>
                      <Typography variant="body2">
                        Your {formatPercentage(metrics?.winRate || 0)} win rate
                        is above the 75th percentile. Consider increasing
                        position sizes within Kelly criteria.
                      </Typography>
                    </Alert>

                    <Alert severity="info" icon={<Assessment />}>
                      <Typography variant="subtitle2">
                        Model Optimization Opportunity
                      </Typography>
                      <Typography variant="body2">
                        Ensemble ML model shows{" "}
                        {formatPercentage(predictions[0]?.accuracy || 0)}{" "}
                        accuracy. Consider ensemble weighting adjustments for
                        improved performance.
                      </Typography>
                    </Alert>

                    <Alert severity="warning" icon={<Warning />}>
                      <Typography variant="subtitle2">
                        Risk Management Note
                      </Typography>
                      <Typography variant="body2">
                        Maximum drawdown of{" "}
                        {formatPercentage(Math.abs(metrics?.maxDrawdown || 0))}{" "}
                        suggests implementing stricter position sizing during
                        losing streaks.
                      </Typography>
                    </Alert>

                    <Alert severity="info" icon={<Psychology />}>
                      <Typography variant="subtitle2">
                        Category Performance Insight
                      </Typography>
                      <Typography variant="body2">
                        NBA Points category shows highest ROI at{" "}
                        {formatPercentage(categoryPerformance[0]?.roi || 0)}.
                        Consider increasing allocation to this market segment.
                      </Typography>
                    </Alert>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="success.main"
                        gutterBottom
                      >
                        ✓ Optimal Kelly Sizing
                      </Typography>
                      <Typography variant="body2">
                        Current {formatPercentage(metrics?.kellyOptimal || 0)}{" "}
                        allocation is appropriate.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="warning.main"
                        gutterBottom
                      >
                        ⚠ Model Diversification
                      </Typography>
                      <Typography variant="body2">
                        Consider adding momentum-based models to ensemble.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="info.main"
                        gutterBottom
                      >
                        ℹ Market Expansion
                      </Typography>
                      <Typography variant="body2">
                        Explore tennis and esports markets for diversification.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="error.main"
                        gutterBottom
                      >
                        ⛔ Risk Control
                      </Typography>
                      <Typography variant="body2">
                        Implement dynamic position sizing based on recent
                        performance.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerformanceAnalyticsDashboard;
