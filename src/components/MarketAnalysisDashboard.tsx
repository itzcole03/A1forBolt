import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Visibility,
  Speed,
  ShowChart,
  PieChart,
  BarChart,
  CandlestickChart,
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
  Cell,
} from "recharts";
import { MarketAnalysisService } from "../services/marketAnalysisService";
import type {
  MarketMetrics,
  MarketEfficiencyMetrics,
  MarketAnomaly,
  OddsMovement,
  VolumeAnalysis,
  SentimentData,
  ArbitrageOpportunity,
  MarketDepth,
  LiquidityMetrics,
  MarketVolatility,
} from "../types/betting";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "../utils/formatters";

interface MarketAnalysisDashboardProps {
  eventId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAdvancedMetrics?: boolean;
}

interface MarketSnapshot {
  timestamp: number;
  totalVolume: number;
  avgOdds: number;
  volatility: number;
  efficiency: number;
  sentiment: number;
  arbitrageCount: number;
}

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const MarketAnalysisDashboard: React.FC<
  MarketAnalysisDashboardProps
> = ({
  eventId = "default",
  autoRefresh = true,
  refreshInterval = 30000,
  showAdvancedMetrics = true,
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("6h");
  const [selectedMetric, setSelectedMetric] = useState<
    "volume" | "odds" | "efficiency" | "sentiment"
  >("volume");

  // Market Data State
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [efficiency, setEfficiency] = useState<MarketEfficiencyMetrics | null>(
    null,
  );
  const [anomalies, setAnomalies] = useState<MarketAnomaly[]>([]);
  const [oddsMovements, setOddsMovements] = useState<OddsMovement[]>([]);
  const [volumeAnalysis, setVolumeAnalysis] = useState<VolumeAnalysis | null>(
    null,
  );
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(
    null,
  );
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<
    ArbitrageOpportunity[]
  >([]);
  const [marketDepth, setMarketDepth] = useState<MarketDepth | null>(null);
  const [liquidityMetrics, setLiquidityMetrics] =
    useState<LiquidityMetrics | null>(null);
  const [volatilityData, setVolatilityData] = useState<MarketVolatility | null>(
    null,
  );
  const [historicalSnapshots, setHistoricalSnapshots] = useState<
    MarketSnapshot[]
  >([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Service Instance
  const marketAnalysisService = useMemo(
    () => MarketAnalysisService.getInstance(),
    [],
  );

  // Data Loading Functions
  const loadMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all market data in parallel
      const [
        metricsData,
        efficiencyData,
        anomaliesData,
        oddsData,
        volumeData,
        sentimentInfo,
        arbitrageData,
        depthData,
        liquidityData,
        volatilityInfo,
      ] = await Promise.all([
        marketAnalysisService.getMarketMetrics(eventId),
        marketAnalysisService.getMarketEfficiency(eventId),
        marketAnalysisService.getAnomalies(eventId),
        marketAnalysisService.getOddsMovements(eventId, timeRange),
        marketAnalysisService.getVolumeAnalysis(eventId, timeRange),
        marketAnalysisService.getSentimentData(eventId),
        marketAnalysisService.getArbitrageOpportunities(eventId),
        marketAnalysisService.getMarketDepth(eventId),
        marketAnalysisService.getLiquidityMetrics(eventId),
        marketAnalysisService.getVolatilityData(eventId, timeRange),
      ]);

      setMetrics(metricsData);
      setEfficiency(efficiencyData);
      setAnomalies(anomaliesData);
      setOddsMovements(oddsData);
      setVolumeAnalysis(volumeData);
      setSentimentData(sentimentInfo);
      setArbitrageOpportunities(arbitrageData);
      setMarketDepth(depthData);
      setLiquidityMetrics(liquidityData);
      setVolatilityData(volatilityInfo);

      // Create historical snapshot
      if (metricsData && efficiencyData && sentimentInfo) {
        const snapshot: MarketSnapshot = {
          timestamp: Date.now(),
          totalVolume: metricsData.totalVolume,
          avgOdds: metricsData.avgOdds,
          volatility: volatilityInfo?.currentVolatility || 0,
          efficiency: efficiencyData.overallEfficiency,
          sentiment: sentimentInfo.overall,
          arbitrageCount: arbitrageData.length,
        };

        setHistoricalSnapshots((prev) => {
          const updated = [...prev, snapshot];
          // Keep last 100 snapshots
          return updated.slice(-100);
        });
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError("Failed to load market data");
      console.error("Market data loading error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, timeRange, marketAnalysisService]);

  // Auto-refresh Effect
  useEffect(() => {
    loadMarketData();

    if (autoRefresh) {
      const interval = setInterval(loadMarketData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadMarketData, autoRefresh, refreshInterval]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (!oddsMovements.length) return [];

    return oddsMovements.map((movement) => ({
      timestamp: new Date(movement.timestamp).toLocaleTimeString(),
      odds: movement.newOdds,
      volume: movement.volume,
      change: movement.percentageChange,
      efficiency: movement.efficiency || 0,
    }));
  }, [oddsMovements]);

  const sentimentChartData = useMemo(() => {
    if (!sentimentData) return [];

    return [
      {
        name: "Positive",
        value: sentimentData.positive,
        color: COLORS.success,
      },
      { name: "Neutral", value: sentimentData.neutral, color: COLORS.info },
      { name: "Negative", value: sentimentData.negative, color: COLORS.error },
    ];
  }, [sentimentData]);

  const volumeDistributionData = useMemo(() => {
    if (!volumeAnalysis) return [];

    return volumeAnalysis.hourlyDistribution.map((volume, index) => ({
      hour: `${index}:00`,
      volume,
      percentageOfTotal: (volume / volumeAnalysis.totalVolume) * 100,
    }));
  }, [volumeAnalysis]);

  const marketDepthData = useMemo(() => {
    if (!marketDepth) return { bids: [], asks: [] };

    return {
      bids: marketDepth.bids.map((bid, index) => ({
        price: bid.odds,
        cumulative: marketDepth.bids
          .slice(0, index + 1)
          .reduce((sum, b) => sum + b.volume, 0),
        volume: bid.volume,
      })),
      asks: marketDepth.asks.map((ask, index) => ({
        price: ask.odds,
        cumulative: marketDepth.asks
          .slice(0, index + 1)
          .reduce((sum, a) => sum + a.volume, 0),
        volume: ask.volume,
      })),
    };
  }, [marketDepth]);

  // Export Functions
  const exportAnalysis = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      eventId,
      timeRange,
      metrics,
      efficiency,
      anomalies,
      arbitrageOpportunities,
      historicalSnapshots,
      summary: {
        totalAnomalies: anomalies.length,
        totalArbitrageOpportunities: arbitrageOpportunities.length,
        marketEfficiency: efficiency?.overallEfficiency,
        avgVolatility: volatilityData?.avgVolatility,
        sentimentScore: sentimentData?.overall,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-analysis-${eventId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    eventId,
    timeRange,
    metrics,
    efficiency,
    anomalies,
    arbitrageOpportunities,
    historicalSnapshots,
    volatilityData,
    sentimentData,
  ]);

  // Risk Assessment
  const riskAssessment = useMemo(() => {
    if (!metrics || !efficiency || !volatilityData) return null;

    const riskFactors = [];
    let riskScore = 0;

    if (efficiency.overallEfficiency < 0.7) {
      riskFactors.push("Low market efficiency detected");
      riskScore += 2;
    }

    if (volatilityData.currentVolatility > volatilityData.avgVolatility * 2) {
      riskFactors.push("High volatility levels");
      riskScore += 3;
    }

    if (anomalies.length > 5) {
      riskFactors.push("Multiple market anomalies detected");
      riskScore += 2;
    }

    if (liquidityMetrics && liquidityMetrics.bidAskSpread > 0.1) {
      riskFactors.push("Wide bid-ask spreads");
      riskScore += 1;
    }

    const riskLevel =
      riskScore >= 5 ? "high" : riskScore >= 3 ? "medium" : "low";

    return {
      level: riskLevel,
      score: riskScore,
      factors: riskFactors,
      recommendation:
        riskLevel === "high"
          ? "Exercise extreme caution"
          : riskLevel === "medium"
            ? "Proceed with caution"
            : "Market conditions are favorable",
    };
  }, [metrics, efficiency, volatilityData, anomalies, liquidityMetrics]);

  if (isLoading && !metrics) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={loadMarketData}>
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
              <Assessment />
              Market Analysis Dashboard
              <Chip
                label={eventId}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                >
                  <MenuItem value="1h">1 Hour</MenuItem>
                  <MenuItem value="6h">6 Hours</MenuItem>
                  <MenuItem value="24h">24 Hours</MenuItem>
                  <MenuItem value="7d">7 Days</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Last updated">
                <Chip
                  label={lastUpdate.toLocaleTimeString()}
                  size="small"
                  icon={<Timeline />}
                />
              </Tooltip>
              <IconButton onClick={loadMarketData} disabled={isLoading}>
                <Refresh />
              </IconButton>
              <IconButton onClick={exportAnalysis}>
                <Download />
              </IconButton>
            </Box>
          </Box>

          {/* Key Metrics Overview */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(metrics?.totalVolume || 0)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Volume
                </Typography>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mt={1}
                >
                  {volumeAnalysis && volumeAnalysis.change24h > 0 ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {formatPercentage((volumeAnalysis?.change24h || 0) / 100)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="secondary.main">
                  {formatPercentage((efficiency?.overallEfficiency || 0) / 100)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Market Efficiency
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={
                      (efficiency?.overallEfficiency || 0) > 0.8
                        ? "High"
                        : (efficiency?.overallEfficiency || 0) > 0.6
                          ? "Medium"
                          : "Low"
                    }
                    color={
                      (efficiency?.overallEfficiency || 0) > 0.8
                        ? "success"
                        : (efficiency?.overallEfficiency || 0) > 0.6
                          ? "warning"
                          : "error"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {anomalies.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Market Anomalies
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={
                      anomalies.length > 5
                        ? "High Alert"
                        : anomalies.length > 2
                          ? "Moderate"
                          : "Normal"
                    }
                    color={
                      anomalies.length > 5
                        ? "error"
                        : anomalies.length > 2
                          ? "warning"
                          : "success"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {arbitrageOpportunities.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Arbitrage Opportunities
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={
                      arbitrageOpportunities.length > 3
                        ? "Excellent"
                        : arbitrageOpportunities.length > 1
                          ? "Good"
                          : "Limited"
                    }
                    color={
                      arbitrageOpportunities.length > 3
                        ? "success"
                        : arbitrageOpportunities.length > 1
                          ? "warning"
                          : "default"
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Risk Assessment */}
          {riskAssessment && (
            <Alert
              severity={
                riskAssessment.level === "high"
                  ? "error"
                  : riskAssessment.level === "medium"
                    ? "warning"
                    : "success"
              }
              sx={{ mb: 3 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Risk Assessment: {riskAssessment.level.toUpperCase()} (Score:{" "}
                {riskAssessment.score}/10)
              </Typography>
              <Typography variant="body2" gutterBottom>
                {riskAssessment.recommendation}
              </Typography>
              {riskAssessment.factors.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Risk Factors:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {riskAssessment.factors.map((factor, index) => (
                      <li key={index}>
                        <Typography variant="caption">{factor}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Alert>
          )}

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Market Trends" icon={<ShowChart />} />
            <Tab label="Volume Analysis" icon={<BarChart />} />
            <Tab label="Sentiment" icon={<PieChart />} />
            <Tab label="Market Depth" icon={<CandlestickChart />} />
            <Tab label="Anomalies" icon={<Warning />} />
            <Tab label="Arbitrage" icon={<MonetizationOn />} />
          </Tabs>

          {/* Market Trends Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Odds Movement & Efficiency
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="odds"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        name="Odds"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="efficiency"
                        stroke={COLORS.success}
                        strokeWidth={2}
                        name="Efficiency"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Volatility Analysis
                  </Typography>
                  {volatilityData && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption">
                          Current Volatility
                        </Typography>
                        <Typography
                          variant="h4"
                          color={
                            volatilityData.currentVolatility >
                            volatilityData.avgVolatility * 1.5
                              ? "error.main"
                              : volatilityData.currentVolatility >
                                  volatilityData.avgVolatility
                                ? "warning.main"
                                : "success.main"
                          }
                        >
                          {formatPercentage(
                            volatilityData.currentVolatility / 100,
                          )}
                        </Typography>
                      </Box>

                      <Divider />

                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">24h Average</Typography>
                        <Typography variant="body2">
                          {formatPercentage(volatilityData.avgVolatility / 100)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">24h High</Typography>
                        <Typography variant="body2">
                          {formatPercentage(volatilityData.maxVolatility / 100)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">24h Low</Typography>
                        <Typography variant="body2">
                          {formatPercentage(volatilityData.minVolatility / 100)}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Volume Analysis Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Hourly Volume Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={volumeDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="volume" fill={COLORS.primary} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Volume Metrics
                  </Typography>
                  {volumeAnalysis && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption">
                          Peak Hour Volume
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(volumeAnalysis.peakHourVolume)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption">
                          Average Hourly
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(volumeAnalysis.avgHourlyVolume)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">24h Change</Typography>
                        <Typography
                          variant="body2"
                          color={
                            volumeAnalysis.change24h >= 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {formatPercentage(volumeAnalysis.change24h / 100)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">
                          Volume Velocity
                        </Typography>
                        <Typography variant="body2">
                          {volumeAnalysis.velocity.toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Sentiment Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Market Sentiment Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={sentimentChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Sentiment Analysis
                  </Typography>
                  {sentimentData && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption">
                          Overall Sentiment Score
                        </Typography>
                        <Typography
                          variant="h4"
                          color={
                            sentimentData.overall > 0.6
                              ? "success.main"
                              : sentimentData.overall > 0.4
                                ? "warning.main"
                                : "error.main"
                          }
                        >
                          {(sentimentData.overall * 100).toFixed(0)}%
                        </Typography>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Sentiment Breakdown
                        </Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">Positive</Typography>
                            <Typography variant="body2" color="success.main">
                              {formatPercentage(sentimentData.positive / 100)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">Neutral</Typography>
                            <Typography variant="body2">
                              {formatPercentage(sentimentData.neutral / 100)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">Negative</Typography>
                            <Typography variant="body2" color="error.main">
                              {formatPercentage(sentimentData.negative / 100)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Key Indicators
                        </Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">
                              Volume Sentiment
                            </Typography>
                            <Typography variant="body2">
                              {sentimentData.volumeWeighted.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">
                              Social Media Score
                            </Typography>
                            <Typography variant="body2">
                              {sentimentData.socialMedia.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">
                              News Impact
                            </Typography>
                            <Typography variant="body2">
                              {sentimentData.newsImpact.toFixed(2)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Market Depth Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Book Depth
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="price" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stackId="1"
                        stroke={COLORS.success}
                        fill={COLORS.success}
                        fillOpacity={0.3}
                        data={marketDepthData.bids}
                        name="Bids"
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stackId="2"
                        stroke={COLORS.error}
                        fill={COLORS.error}
                        fillOpacity={0.3}
                        data={marketDepthData.asks}
                        name="Asks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Liquidity Metrics
                  </Typography>
                  {liquidityMetrics && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption">
                          Bid-Ask Spread
                        </Typography>
                        <Typography
                          variant="h5"
                          color={
                            liquidityMetrics.bidAskSpread > 0.1
                              ? "error.main"
                              : liquidityMetrics.bidAskSpread > 0.05
                                ? "warning.main"
                                : "success.main"
                          }
                        >
                          {formatPercentage(
                            liquidityMetrics.bidAskSpread / 100,
                          )}
                        </Typography>
                      </Box>

                      <Divider />

                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">Market Impact</Typography>
                        <Typography variant="body2">
                          {liquidityMetrics.marketImpact.toFixed(4)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">Depth Ratio</Typography>
                        <Typography variant="body2">
                          {liquidityMetrics.depthRatio.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">Turnover Rate</Typography>
                        <Typography variant="body2">
                          {formatPercentage(
                            liquidityMetrics.turnoverRate / 100,
                          )}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">
                          Resilience Score
                        </Typography>
                        <Typography variant="body2">
                          {liquidityMetrics.resilienceScore.toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Anomalies Tab */}
          {activeTab === 4 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Market Anomalies
              </Typography>

              {anomalies.length > 0 ? (
                <Stack spacing={2}>
                  {anomalies.map((anomaly, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <Typography variant="subtitle1">
                            {anomaly.type}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={anomaly.severity}
                              color={
                                anomaly.severity === "high"
                                  ? "error"
                                  : anomaly.severity === "medium"
                                    ? "warning"
                                    : "info"
                              }
                              size="small"
                            />
                            <Chip
                              label={formatDateTime(anomaly.timestamp)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Description:</strong>{" "}
                              {anomaly.description}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              <strong>Impact:</strong> {anomaly.impact}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Recommendation:</strong>{" "}
                              {anomaly.recommendation}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography variant="caption">
                                Confidence Score
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={anomaly.confidence * 100}
                                sx={{ mt: 1, mb: 2 }}
                              />
                              <Typography variant="body2">
                                {formatPercentage(anomaly.confidence)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              ) : (
                <Alert severity="success">
                  No market anomalies detected in the current time range.
                </Alert>
              )}
            </Paper>
          )}

          {/* Arbitrage Tab */}
          {activeTab === 5 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Arbitrage Opportunities
              </Typography>

              {arbitrageOpportunities.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Market</TableCell>
                        <TableCell>Bookmaker 1</TableCell>
                        <TableCell>Bookmaker 2</TableCell>
                        <TableCell>Profit %</TableCell>
                        <TableCell>ROI</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {arbitrageOpportunities.map((opportunity, index) => (
                        <TableRow key={index}>
                          <TableCell>{opportunity.market}</TableCell>
                          <TableCell>
                            {opportunity.bookmaker1} @ {opportunity.odds1}
                          </TableCell>
                          <TableCell>
                            {opportunity.bookmaker2} @ {opportunity.odds2}
                          </TableCell>
                          <TableCell>
                            <Typography color="success.main" fontWeight="bold">
                              {formatPercentage(opportunity.profitMargin / 100)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatPercentage(opportunity.roi / 100)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={opportunity.riskLevel}
                              color={
                                opportunity.riskLevel === "low"
                                  ? "success"
                                  : opportunity.riskLevel === "medium"
                                    ? "warning"
                                    : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">
                              Execute
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No arbitrage opportunities currently available.
                </Alert>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketAnalysisDashboard;
