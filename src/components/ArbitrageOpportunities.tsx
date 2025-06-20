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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Avatar,
  ButtonGroup,
  Stepper,
  Step,
  StepLabel,
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
  PlayArrow,
  Stop,
  Refresh,
  NotificationImportant,
  Speed,
  Timeline,
  Calculate,
  AutoAwesome,
  ShowChart,
  BarChart,
  PieChart,
  Visibility,
  Schedule,
  CheckCircle,
  Error,
  Bookmark,
  BookmarkBorder,
  Share,
  Print,
  Launch,
  CompareArrows,
  SwapHoriz,
  AccountBalance,
  Security,
  VerifiedUser,
  FlashOn,
  AccessTime,
  Cached,
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
  BarChart as RechartsBarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  formatOdds,
  formatDateTime,
} from "../utils/formatters";

interface ArbitrageOpportunity {
  id: string;
  sport: string;
  league: string;
  event: string;
  market: string;

  // Side A (Back)
  sideA: {
    selection: string;
    bookmaker: string;
    odds: number;
    stake: number;
    payout: number;
  };

  // Side B (Lay or opposing bet)
  sideB: {
    selection: string;
    bookmaker: string;
    odds: number;
    stake: number;
    payout: number;
  };

  // Arbitrage Metrics
  profitMargin: number;
  totalStake: number;
  guaranteedProfit: number;
  roi: number;

  // Risk & Timing
  riskLevel: "low" | "medium" | "high";
  timeToExpiry: number;
  lastUpdate: Date;
  discoveryTime: Date;
  confidence: number;

  // Market Data
  volume: {
    sideA: number;
    sideB: number;
  };
  liquidity: {
    sideA: number;
    sideB: number;
  };

  // Execution
  status: "active" | "executing" | "completed" | "expired" | "failed";
  executionTime?: Date;
  actualProfit?: number;

  // Metadata
  tags: string[];
  bookmakerPair: string;
  isBookmarked: boolean;
}

interface ArbitrageCalculation {
  stake: number;
  allocation: {
    sideA: number;
    sideB: number;
  };
  profit: number;
  margin: number;
  roi: number;
}

interface ExecutionPlan {
  opportunity: ArbitrageOpportunity;
  steps: {
    step: number;
    action: string;
    bookmaker: string;
    amount: number;
    odds: number;
    status: "pending" | "executing" | "completed" | "failed";
  }[];
  totalTime: number;
  riskLevel: string;
}

const BOOKMAKER_COLORS = {
  DraftKings: "#ff6600",
  FanDuel: "#3d5afe",
  Bet365: "#00a852",
  Caesars: "#d4af37",
  BetMGM: "#1976d2",
  PointsBet: "#00bcd4",
  Pinnacle: "#9c27b0",
};

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

export const ArbitrageOpportunities: React.FC = () => {
  // State Management
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>(
    [],
  );
  const [filteredOpportunities, setFilteredOpportunities] = useState<
    ArbitrageOpportunity[]
  >([]);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<ArbitrageOpportunity | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(
    null,
  );
  const [customStake, setCustomStake] = useState(1000);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [showCalculatorDialog, setShowCalculatorDialog] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    sport: "all",
    minProfit: 0,
    minMargin: 0,
    maxRisk: "high",
    bookmakerPair: "all",
    timeToExpiry: "all",
  });

  // Real-time Data Loading
  const loadArbitrageData = useCallback(async () => {
    try {
      // Simulate loading real-time arbitrage opportunities
      const mockOpportunities: ArbitrageOpportunity[] = [
        {
          id: "arb-001",
          sport: "Basketball",
          league: "NBA",
          event: "Lakers vs Warriors",
          market: "Moneyline",

          sideA: {
            selection: "Lakers Win",
            bookmaker: "DraftKings",
            odds: 2.15,
            stake: 465.12,
            payout: 1000.0,
          },

          sideB: {
            selection: "Warriors Win",
            bookmaker: "FanDuel",
            odds: 1.95,
            stake: 534.88,
            payout: 1043.02,
          },

          profitMargin: 0.043,
          totalStake: 1000.0,
          guaranteedProfit: 43.02,
          roi: 0.043,

          riskLevel: "low",
          timeToExpiry: 3600000,
          lastUpdate: new Date(Date.now() - 30000),
          discoveryTime: new Date(Date.now() - 300000),
          confidence: 0.95,

          volume: {
            sideA: 2450000,
            sideB: 1890000,
          },
          liquidity: {
            sideA: 0.92,
            sideB: 0.88,
          },

          status: "active",

          tags: ["high-volume", "low-risk", "trending"],
          bookmakerPair: "DraftKings-FanDuel",
          isBookmarked: true,
        },
        {
          id: "arb-002",
          sport: "Football",
          league: "NFL",
          event: "Chiefs vs Bills",
          market: "Spread (-3.5)",

          sideA: {
            selection: "Chiefs -3.5",
            bookmaker: "Bet365",
            odds: 2.05,
            stake: 487.8,
            payout: 1000.0,
          },

          sideB: {
            selection: "Bills +3.5",
            bookmaker: "BetMGM",
            odds: 1.98,
            stake: 512.2,
            payout: 1014.2,
          },

          profitMargin: 0.014,
          totalStake: 1000.0,
          guaranteedProfit: 14.2,
          roi: 0.014,

          riskLevel: "medium",
          timeToExpiry: 7200000,
          lastUpdate: new Date(Date.now() - 60000),
          discoveryTime: new Date(Date.now() - 180000),
          confidence: 0.87,

          volume: {
            sideA: 1560000,
            sideB: 1780000,
          },
          liquidity: {
            sideA: 0.85,
            sideB: 0.91,
          },

          status: "active",

          tags: ["primetime", "playoffs"],
          bookmakerPair: "Bet365-BetMGM",
          isBookmarked: false,
        },
        {
          id: "arb-003",
          sport: "Soccer",
          league: "Premier League",
          event: "Man City vs Liverpool",
          market: "Over/Under 2.5 Goals",

          sideA: {
            selection: "Over 2.5",
            bookmaker: "Pinnacle",
            odds: 1.85,
            stake: 540.54,
            payout: 1000.0,
          },

          sideB: {
            selection: "Under 2.5",
            bookmaker: "Caesars",
            odds: 2.2,
            stake: 459.46,
            payout: 1010.81,
          },

          profitMargin: 0.011,
          totalStake: 1000.0,
          guaranteedProfit: 10.81,
          roi: 0.011,

          riskLevel: "high",
          timeToExpiry: 1800000,
          lastUpdate: new Date(Date.now() - 15000),
          discoveryTime: new Date(Date.now() - 120000),
          confidence: 0.78,

          volume: {
            sideA: 890000,
            sideB: 1200000,
          },
          liquidity: {
            sideA: 0.79,
            sideB: 0.83,
          },

          status: "active",

          tags: ["classic", "high-stakes", "expiring-soon"],
          bookmakerPair: "Pinnacle-Caesars",
          isBookmarked: false,
        },
        {
          id: "arb-004",
          sport: "Tennis",
          league: "ATP",
          event: "Djokovic vs Nadal",
          market: "Match Winner",

          sideA: {
            selection: "Djokovic",
            bookmaker: "PointsBet",
            odds: 1.78,
            stake: 561.8,
            payout: 1000.0,
          },

          sideB: {
            selection: "Nadal",
            bookmaker: "DraftKings",
            odds: 2.35,
            stake: 438.2,
            payout: 1029.77,
          },

          profitMargin: 0.03,
          totalStake: 1000.0,
          guaranteedProfit: 29.77,
          roi: 0.03,

          riskLevel: "low",
          timeToExpiry: 900000,
          lastUpdate: new Date(Date.now() - 45000),
          discoveryTime: new Date(Date.now() - 90000),
          confidence: 0.91,

          volume: {
            sideA: 567000,
            sideB: 789000,
          },
          liquidity: {
            sideA: 0.88,
            sideB: 0.92,
          },

          status: "executing",
          executionTime: new Date(Date.now() - 30000),

          tags: ["GOAT-match", "clay-court", "executing"],
          bookmakerPair: "PointsBet-DraftKings",
          isBookmarked: true,
        },
      ];

      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error("Failed to load arbitrage data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount and auto-refresh
  useEffect(() => {
    loadArbitrageData();

    if (autoRefresh) {
      const interval = setInterval(loadArbitrageData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [loadArbitrageData, autoRefresh]);

  // Filter opportunities
  useEffect(() => {
    let filtered = opportunities;

    if (filters.sport !== "all") {
      filtered = filtered.filter((opp) => opp.sport === filters.sport);
    }

    if (filters.minProfit > 0) {
      filtered = filtered.filter(
        (opp) => opp.guaranteedProfit >= filters.minProfit,
      );
    }

    if (filters.minMargin > 0) {
      filtered = filtered.filter(
        (opp) => opp.profitMargin >= filters.minMargin,
      );
    }

    if (filters.maxRisk !== "high") {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      const maxRiskLevel = riskOrder[filters.maxRisk as keyof typeof riskOrder];
      filtered = filtered.filter(
        (opp) => riskOrder[opp.riskLevel] <= maxRiskLevel,
      );
    }

    if (filters.bookmakerPair !== "all") {
      filtered = filtered.filter(
        (opp) => opp.bookmakerPair === filters.bookmakerPair,
      );
    }

    if (onlyBookmarked) {
      filtered = filtered.filter((opp) => opp.isBookmarked);
    }

    // Sort by profit margin descending
    filtered.sort((a, b) => b.profitMargin - a.profitMargin);

    setFilteredOpportunities(filtered);
  }, [opportunities, filters, onlyBookmarked]);

  // Calculate arbitrage for custom stake
  const calculateArbitrage = useCallback(
    (
      opportunity: ArbitrageOpportunity,
      stake: number,
    ): ArbitrageCalculation => {
      const { sideA, sideB } = opportunity;

      // Calculate optimal allocation
      const totalImpliedProb = 1 / sideA.odds + 1 / sideB.odds;
      const stakeA = stake / (sideA.odds * totalImpliedProb);
      const stakeB = stake / (sideB.odds * totalImpliedProb);

      const payoutA = stakeA * sideA.odds;
      const payoutB = stakeB * sideB.odds;

      const profit = Math.min(payoutA, payoutB) - stake;
      const margin = profit / stake;
      const roi = margin;

      return {
        stake,
        allocation: {
          sideA: stakeA,
          sideB: stakeB,
        },
        profit,
        margin,
        roi,
      };
    },
    [],
  );

  // Event Handlers
  const handleBookmark = useCallback((opportunityId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId
          ? { ...opp, isBookmarked: !opp.isBookmarked }
          : opp,
      ),
    );
  }, []);

  const handleExecute = useCallback((opportunity: ArbitrageOpportunity) => {
    // Create execution plan
    const plan: ExecutionPlan = {
      opportunity,
      steps: [
        {
          step: 1,
          action: `Place bet on ${opportunity.sideA.selection}`,
          bookmaker: opportunity.sideA.bookmaker,
          amount: opportunity.sideA.stake,
          odds: opportunity.sideA.odds,
          status: "pending",
        },
        {
          step: 2,
          action: `Place bet on ${opportunity.sideB.selection}`,
          bookmaker: opportunity.sideB.bookmaker,
          amount: opportunity.sideB.stake,
          odds: opportunity.sideB.odds,
          status: "pending",
        },
      ],
      totalTime: 45, // seconds
      riskLevel: opportunity.riskLevel,
    };

    setExecutionPlan(plan);
    setShowExecutionDialog(true);
  }, []);

  const handleExecutePlan = useCallback(async () => {
    if (!executionPlan) return;

    try {
      // Simulate execution
      for (let i = 0; i < executionPlan.steps.length; i++) {
        const step = executionPlan.steps[i];

        // Update step status to executing
        setExecutionPlan((prev) =>
          prev
            ? {
                ...prev,
                steps: prev.steps.map((s, idx) =>
                  idx === i ? { ...s, status: "executing" } : s,
                ),
              }
            : null,
        );

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update step status to completed
        setExecutionPlan((prev) =>
          prev
            ? {
                ...prev,
                steps: prev.steps.map((s, idx) =>
                  idx === i ? { ...s, status: "completed" } : s,
                ),
              }
            : null,
        );
      }

      // Update opportunity status
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === executionPlan.opportunity.id
            ? {
                ...opp,
                status: "completed",
                executionTime: new Date(),
                actualProfit: executionPlan.opportunity.guaranteedProfit,
              }
            : opp,
        ),
      );

      setTimeout(() => {
        setShowExecutionDialog(false);
        setExecutionPlan(null);
      }, 2000);
    } catch (error) {
      console.error("Execution failed:", error);
    }
  }, [executionPlan]);

  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      opportunities: filteredOpportunities,
      summary: {
        totalOpportunities: opportunities.length,
        avgProfitMargin:
          opportunities.reduce((sum, opp) => sum + opp.profitMargin, 0) /
          opportunities.length,
        totalPotentialProfit: opportunities.reduce(
          (sum, opp) => sum + opp.guaranteedProfit,
          0,
        ),
        bookmakerPairs: [
          ...new Set(opportunities.map((opp) => opp.bookmakerPair)),
        ],
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arbitrage-opportunities-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredOpportunities, opportunities]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const active = opportunities.filter((opp) => opp.status === "active");
    const avgMargin =
      active.reduce((sum, opp) => sum + opp.profitMargin, 0) /
      Math.max(active.length, 1);
    const totalProfit = active.reduce(
      (sum, opp) => sum + opp.guaranteedProfit,
      0,
    );
    const avgConfidence =
      active.reduce((sum, opp) => sum + opp.confidence, 0) /
      Math.max(active.length, 1);

    return {
      activeCount: active.length,
      avgMargin,
      totalProfit,
      avgConfidence,
      executingCount: opportunities.filter((opp) => opp.status === "executing")
        .length,
    };
  }, [opportunities]);

  if (isLoading) {
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
              <SwapHoriz />
              Arbitrage Opportunities
              <Badge badgeContent={summaryMetrics.activeCount} color="success">
                <MonetizationOn />
              </Badge>
              {summaryMetrics.executingCount > 0 && (
                <Badge
                  badgeContent={summaryMetrics.executingCount}
                  color="warning"
                >
                  <Cached className="animate-spin" />
                </Badge>
              )}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto Refresh"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyBookmarked}
                    onChange={(e) => setOnlyBookmarked(e.target.checked)}
                  />
                }
                label="Bookmarked"
              />
              <IconButton onClick={loadArbitrageData}>
                <Refresh />
              </IconButton>
              <IconButton onClick={exportData}>
                <Download />
              </IconButton>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {summaryMetrics.activeCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Active Opportunities
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={`${summaryMetrics.executingCount} executing`}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary.main">
                  {formatPercentage(summaryMetrics.avgMargin)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Profit Margin
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={summaryMetrics.avgMargin * 1000}
                    color="primary"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="secondary.main">
                  {formatCurrency(summaryMetrics.totalProfit)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Potential Profit
                </Typography>
                <Box mt={1}>
                  <MonetizationOn color="secondary" fontSize="small" />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="info.main">
                  {formatPercentage(summaryMetrics.avgConfidence)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Confidence
                </Typography>
                <Box mt={1}>
                  <VerifiedUser color="info" fontSize="small" />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sport</InputLabel>
                <Select
                  value={filters.sport}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sport: e.target.value }))
                  }
                >
                  <MenuItem value="all">All Sports</MenuItem>
                  <MenuItem value="Basketball">Basketball</MenuItem>
                  <MenuItem value="Football">Football</MenuItem>
                  <MenuItem value="Soccer">Soccer</MenuItem>
                  <MenuItem value="Tennis">Tennis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                size="small"
                label="Min Profit ($)"
                type="number"
                value={filters.minProfit}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minProfit: Number(e.target.value),
                  }))
                }
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                size="small"
                label="Min Margin (%)"
                type="number"
                value={filters.minMargin * 100}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minMargin: Number(e.target.value) / 100,
                  }))
                }
              />
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Max Risk</InputLabel>
                <Select
                  value={filters.maxRisk}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxRisk: e.target.value }))
                  }
                >
                  <MenuItem value="low">Low Risk Only</MenuItem>
                  <MenuItem value="medium">Low + Medium</MenuItem>
                  <MenuItem value="high">All Risk Levels</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSelectedOpportunity(filteredOpportunities[0] || null);
                  setShowCalculatorDialog(true);
                }}
                startIcon={<Calculate />}
                disabled={filteredOpportunities.length === 0}
              >
                Calculator
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="caption" color="textSecondary">
                Showing {filteredOpportunities.length} of {opportunities.length}
              </Typography>
            </Grid>
          </Grid>

          {/* Opportunities Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event & Market</TableCell>
                  <TableCell>Side A</TableCell>
                  <TableCell>Side B</TableCell>
                  <TableCell>Profit</TableCell>
                  <TableCell>Margin</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOpportunities.map((opportunity) => (
                  <TableRow
                    key={opportunity.id}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                      backgroundColor:
                        opportunity.profitMargin > 0.03
                          ? "success.light"
                          : "inherit",
                      opacity: opportunity.status === "expired" ? 0.6 : 1,
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {opportunity.event}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {opportunity.sport} • {opportunity.market}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {opportunity.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {opportunity.sideA.selection}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {opportunity.sideA.bookmaker} @{" "}
                          {formatOdds(opportunity.sideA.odds)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Stake: {formatCurrency(opportunity.sideA.stake)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {opportunity.sideB.selection}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {opportunity.sideB.bookmaker} @{" "}
                          {formatOdds(opportunity.sideB.odds)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Stake: {formatCurrency(opportunity.sideB.stake)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="success.main"
                      >
                        {formatCurrency(opportunity.guaranteedProfit)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total: {formatCurrency(opportunity.totalStake)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={formatPercentage(opportunity.profitMargin)}
                        color={
                          opportunity.profitMargin > 0.03
                            ? "success"
                            : opportunity.profitMargin > 0.015
                              ? "warning"
                              : "default"
                        }
                        size="small"
                      />
                      <Typography variant="caption" display="block">
                        ROI: {formatPercentage(opportunity.roi)}
                      </Typography>
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={opportunity.confidence * 100}
                          sx={{ width: 40, height: 6 }}
                          color={
                            opportunity.confidence > 0.9
                              ? "success"
                              : opportunity.confidence > 0.8
                                ? "warning"
                                : "error"
                          }
                        />
                        <Typography variant="caption">
                          {formatPercentage(opportunity.confidence)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption">
                        {Math.floor(opportunity.timeToExpiry / 60000)}m
                      </Typography>
                      {opportunity.timeToExpiry < 900000 && (
                        <FlashOn color="warning" fontSize="small" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={opportunity.status}
                        color={
                          opportunity.status === "active"
                            ? "success"
                            : opportunity.status === "executing"
                              ? "warning"
                              : opportunity.status === "completed"
                                ? "info"
                                : opportunity.status === "expired"
                                  ? "error"
                                  : "default"
                        }
                        size="small"
                        icon={
                          opportunity.status === "active" ? (
                            <CheckCircle />
                          ) : opportunity.status === "executing" ? (
                            <Cached className="animate-spin" />
                          ) : opportunity.status === "expired" ? (
                            <AccessTime />
                          ) : undefined
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(opportunity.id)}
                        >
                          {opportunity.isBookmarked ? (
                            <Bookmark />
                          ) : (
                            <BookmarkBorder />
                          )}
                        </IconButton>

                        {opportunity.status === "active" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleExecute(opportunity)}
                            startIcon={<PlayArrow />}
                          >
                            Execute
                          </Button>
                        )}

                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOpportunity(opportunity);
                            setShowCalculatorDialog(true);
                          }}
                        >
                          <Calculate />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredOpportunities.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No arbitrage opportunities found matching your filters. Try
              adjusting the filters or wait for new opportunities to appear.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Execution Dialog */}
      <Dialog
        open={showExecutionDialog}
        onClose={() => setShowExecutionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execute Arbitrage Opportunity</DialogTitle>
        <DialogContent>
          {executionPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {executionPlan.opportunity.event} -{" "}
                {executionPlan.opportunity.market}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="caption">Guaranteed Profit</Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(executionPlan.opportunity.guaranteedProfit)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">Profit Margin</Typography>
                  <Typography variant="h5">
                    {formatPercentage(executionPlan.opportunity.profitMargin)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">Risk Level</Typography>
                  <Chip
                    label={executionPlan.riskLevel}
                    color={
                      executionPlan.riskLevel === "low"
                        ? "success"
                        : executionPlan.riskLevel === "medium"
                          ? "warning"
                          : "error"
                    }
                  />
                </Grid>
              </Grid>

              <Stepper
                activeStep={executionPlan.steps.findIndex(
                  (step) => step.status === "pending",
                )}
                orientation="vertical"
              >
                {executionPlan.steps.map((step, index) => (
                  <Step key={step.step}>
                    <StepLabel
                      icon={
                        step.status === "completed" ? (
                          <CheckCircle color="success" />
                        ) : step.status === "executing" ? (
                          <Cached className="animate-spin" />
                        ) : step.status === "failed" ? (
                          <Error color="error" />
                        ) : (
                          step.step
                        )
                      }
                    >
                      {step.action}
                    </StepLabel>
                    <Box sx={{ ml: 3, mb: 2 }}>
                      <Typography variant="body2">
                        {step.bookmaker} • {formatCurrency(step.amount)} @{" "}
                        {formatOdds(step.odds)}
                      </Typography>
                      <Chip
                        label={step.status}
                        size="small"
                        color={
                          step.status === "completed"
                            ? "success"
                            : step.status === "executing"
                              ? "warning"
                              : step.status === "failed"
                                ? "error"
                                : "default"
                        }
                      />
                    </Box>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExecutionDialog(false)}>Cancel</Button>
          {executionPlan &&
            executionPlan.steps.every((step) => step.status === "pending") && (
              <Button
                variant="contained"
                color="success"
                onClick={handleExecutePlan}
                startIcon={<PlayArrow />}
              >
                Execute Plan
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog
        open={showCalculatorDialog}
        onClose={() => setShowCalculatorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Arbitrage Calculator</DialogTitle>
        <DialogContent>
          {selectedOpportunity && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedOpportunity.event}
              </Typography>

              <TextField
                fullWidth
                label="Total Stake"
                type="number"
                value={customStake}
                onChange={(e) => setCustomStake(Number(e.target.value))}
                sx={{ mb: 2 }}
              />

              {(() => {
                const calc = calculateArbitrage(
                  selectedOpportunity,
                  customStake,
                );
                return (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">
                        Stake Allocation
                      </Typography>
                      <Typography variant="body2">
                        {selectedOpportunity.sideA.bookmaker}:{" "}
                        {formatCurrency(calc.allocation.sideA)}
                      </Typography>
                      <Typography variant="body2">
                        {selectedOpportunity.sideB.bookmaker}:{" "}
                        {formatCurrency(calc.allocation.sideB)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2">Results</Typography>
                      <Typography variant="body2">
                        Guaranteed Profit:{" "}
                        <strong>{formatCurrency(calc.profit)}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Profit Margin:{" "}
                        <strong>{formatPercentage(calc.margin)}</strong>
                      </Typography>
                      <Typography variant="body2">
                        ROI: <strong>{formatPercentage(calc.roi)}</strong>
                      </Typography>
                    </Box>
                  </Stack>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCalculatorDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ArbitrageOpportunities;
