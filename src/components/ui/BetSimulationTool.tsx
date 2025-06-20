import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Refresh,
  TrendingUp,
  TrendingDown,
  Assessment,
  MonetizationOn,
  Warning,
  Info,
  Download,
  Settings,
  Timeline,
} from "@mui/icons-material";
import { useSimulationStore } from "../../store/slices/simulationSlice";
import { confidenceService } from "../../services/analytics/confidenceService";
import { MLSimulationService } from "../../services/MLSimulationService";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface SimulationScenario {
  id: string;
  name: string;
  stake: number;
  odds: number;
  eventId: string;
  player: string;
  market: string;
  iterations: number;
  expectedValue?: number;
  riskLevel?: "low" | "medium" | "high";
}

interface SimulationResult {
  scenario: SimulationScenario;
  winProbability: number;
  expectedPayout: number;
  expectedLoss: number;
  expectedValue: number;
  kellyFraction: number;
  roi: number;
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
    recommendation: string;
  };
  breakdown: {
    wins: number;
    losses: number;
    totalPayout: number;
    totalLoss: number;
    variance: number;
    sharpeRatio: number;
  };
  confidence: {
    lower: number;
    upper: number;
    interval: number;
  };
}

const predefinedScenarios: SimulationScenario[] = [
  {
    id: "conservative",
    name: "Conservative Play",
    stake: 50,
    odds: 1.8,
    eventId: "NBA-LAL-BOS-2024",
    player: "LeBron James",
    market: "points",
    iterations: 1000,
    riskLevel: "low",
  },
  {
    id: "moderate",
    name: "Moderate Risk",
    stake: 100,
    odds: 2.2,
    eventId: "NBA-GSW-LAC-2024",
    player: "Stephen Curry",
    market: "threePointers",
    iterations: 1000,
    riskLevel: "medium",
  },
  {
    id: "aggressive",
    name: "High Risk/Reward",
    stake: 200,
    odds: 3.5,
    eventId: "NBA-MIA-DEN-2024",
    player: "Nikola Jokic",
    market: "rebounds",
    iterations: 1000,
    riskLevel: "high",
  },
];

export const BetSimulationTool: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "comparison">(
    "single",
  );
  const [scenario, setScenario] = useState<SimulationScenario>(
    predefinedScenarios[0],
  );
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Store Integration
  const setInput = useSimulationStore((s) => s.setInput);
  const storeResult = useSimulationStore((s) => s.result);
  const setStoreResult = useSimulationStore((s) => s.setResult);
  const clear = useSimulationStore((s) => s.clear);

  // Computed Values
  const currentResult = useMemo(() => {
    return results.find((r) => r.scenario.id === scenario.id);
  }, [results, scenario.id]);

  // Simulation Logic
  const runSingleSimulation = useCallback(
    async (simScenario: SimulationScenario): Promise<SimulationResult> => {
      const prediction = confidenceService.getPredictionWithConfidence(
        simScenario.eventId,
        simScenario.player,
        simScenario.market,
      );

      const simInput = {
        stake: simScenario.stake,
        odds: simScenario.odds,
        confidenceBand: prediction.confidenceBand,
        winProbability: prediction.winProbability,
        iterations: simScenario.iterations,
      };

      setInput(simInput);

      // Enhanced simulation with Monte Carlo analysis
      let wins = 0;
      let totalPayout = 0;
      let totalLoss = 0;
      const outcomes: number[] = [];

      for (let i = 0; i < simScenario.iterations; i++) {
        const randomValue = Math.random();
        if (randomValue <= prediction.winProbability) {
          wins++;
          const payout = simScenario.stake * (simScenario.odds - 1);
          totalPayout += payout;
          outcomes.push(payout);
        } else {
          totalLoss += simScenario.stake;
          outcomes.push(-simScenario.stake);
        }
      }

      const losses = simScenario.iterations - wins;
      const expectedPayout = totalPayout / simScenario.iterations;
      const expectedLoss = totalLoss / simScenario.iterations;
      const expectedValue = expectedPayout - expectedLoss;

      // Kelly Criterion calculation
      const p = prediction.winProbability;
      const b = simScenario.odds - 1;
      const kellyFraction = (b * p - (1 - p)) / b;

      // ROI calculation
      const roi = (expectedValue / simScenario.stake) * 100;

      // Risk assessment
      const riskLevel =
        kellyFraction > 0.25 ? "high" : kellyFraction > 0.1 ? "medium" : "low";
      const riskFactors = [];
      if (simScenario.odds > 3.0)
        riskFactors.push("High odds indicate lower probability");
      if (kellyFraction < 0) riskFactors.push("Negative expected value");
      if (prediction.confidenceBand.lower < 0.6)
        riskFactors.push("Low prediction confidence");

      // Statistical calculations
      const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
      const variance =
        outcomes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        outcomes.length;
      const standardDev = Math.sqrt(variance);
      const sharpeRatio = mean / standardDev;

      // Confidence interval (95%)
      const confidenceInterval =
        1.96 * (standardDev / Math.sqrt(simScenario.iterations));

      const result: SimulationResult = {
        scenario: simScenario,
        winProbability: prediction.winProbability,
        expectedPayout,
        expectedLoss,
        expectedValue,
        kellyFraction: Math.max(0, kellyFraction),
        roi,
        riskAssessment: {
          level: riskLevel,
          factors: riskFactors,
          recommendation:
            kellyFraction > 0
              ? kellyFraction > 0.25
                ? "Reduce stake size"
                : "Proceed with caution"
              : "Avoid this bet",
        },
        breakdown: {
          wins,
          losses,
          totalPayout,
          totalLoss,
          variance,
          sharpeRatio,
        },
        confidence: {
          lower: mean - confidenceInterval,
          upper: mean + confidenceInterval,
          interval: 95,
        },
      };

      setStoreResult(result);
      return result;
    },
    [setInput, setStoreResult],
  );

  // Event Handlers
  const handleSingleSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await runSingleSimulation(scenario);
      setResults((prev) => {
        const filtered = prev.filter((r) => r.scenario.id !== scenario.id);
        return [...filtered, result];
      });
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBatchSimulation = async () => {
    if (scenarios.length === 0) return;

    setIsSimulating(true);
    try {
      const batchResults: SimulationResult[] = [];
      for (const scenario of scenarios) {
        const result = await runSingleSimulation(scenario);
        batchResults.push(result);
      }
      setResults(batchResults);
    } catch (error) {
      console.error("Batch simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const addScenario = () => {
    const newScenario: SimulationScenario = {
      ...scenario,
      id: `custom_${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
    };
    setScenarios((prev) => [...prev, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setResults((prev) => prev.filter((r) => r.scenario.id !== id));
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      scenarios: scenarios.length || 1,
      results: results.map((r) => ({
        scenario: r.scenario.name,
        expectedValue: r.expectedValue,
        roi: r.roi,
        winProbability: r.winProbability,
        riskLevel: r.riskAssessment.level,
        recommendation: r.riskAssessment.recommendation,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bet-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Real-time updates
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(async () => {
      if (!isSimulating && scenario) {
        await handleSingleSimulation();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeMode, isSimulating, scenario, handleSingleSimulation]);

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
              Advanced Bet Simulation Tool
            </Typography>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeMode}
                    onChange={(e) => setRealTimeMode(e.target.checked)}
                  />
                }
                label="Real-time"
              />
              <IconButton
                onClick={exportResults}
                disabled={results.length === 0}
              >
                <Download />
              </IconButton>
              <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
                <Settings />
              </IconButton>
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Stack direction="row" spacing={2}>
              {["single", "batch", "comparison"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "contained" : "outlined"}
                  onClick={() => setActiveTab(tab as any)}
                  sx={{ textTransform: "capitalize" }}
                >
                  {tab} Simulation
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Single Simulation Tab */}
          {activeTab === "single" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Simulation Parameters
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Stake ($)"
                        type="number"
                        value={scenario.stake}
                        onChange={(e) =>
                          setScenario((prev) => ({
                            ...prev,
                            stake: Number(e.target.value),
                          }))
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Odds"
                        type="number"
                        value={scenario.odds}
                        onChange={(e) =>
                          setScenario((prev) => ({
                            ...prev,
                            odds: Number(e.target.value),
                          }))
                        }
                        inputProps={{ min: 1.01, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Event ID"
                        value={scenario.eventId}
                        onChange={(e) =>
                          setScenario((prev) => ({
                            ...prev,
                            eventId: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Player"
                        value={scenario.player}
                        onChange={(e) =>
                          setScenario((prev) => ({
                            ...prev,
                            player: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Market</InputLabel>
                        <Select
                          value={scenario.market}
                          onChange={(e) =>
                            setScenario((prev) => ({
                              ...prev,
                              market: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="points">Points</MenuItem>
                          <MenuItem value="rebounds">Rebounds</MenuItem>
                          <MenuItem value="assists">Assists</MenuItem>
                          <MenuItem value="threePointers">
                            Three Pointers
                          </MenuItem>
                          <MenuItem value="steals">Steals</MenuItem>
                          <MenuItem value="blocks">Blocks</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {showAdvanced && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Simulation Iterations"
                          type="number"
                          value={scenario.iterations}
                          onChange={(e) =>
                            setScenario((prev) => ({
                              ...prev,
                              iterations: Number(e.target.value),
                            }))
                          }
                          inputProps={{ min: 100, max: 100000, step: 100 }}
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Box mt={2}>
                    <Button
                      variant="contained"
                      onClick={handleSingleSimulation}
                      disabled={isSimulating}
                      startIcon={
                        isSimulating ? (
                          <LinearProgress sx={{ width: 20 }} />
                        ) : (
                          <PlayArrow />
                        )
                      }
                      fullWidth
                      size="large"
                    >
                      {isSimulating ? "Simulating..." : "Run Simulation"}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                {currentResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Simulation Results
                      </Typography>

                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">
                            Expected Value
                          </Typography>
                          <Typography
                            variant="h4"
                            color={
                              currentResult.expectedValue >= 0
                                ? "success.main"
                                : "error.main"
                            }
                          >
                            {formatCurrency(currentResult.expectedValue)}
                          </Typography>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                Win Probability
                              </Typography>
                              <Typography variant="h6">
                                {formatPercentage(currentResult.winProbability)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography
                                variant="subtitle2"
                                color="textSecondary"
                              >
                                ROI
                              </Typography>
                              <Typography
                                variant="h6"
                                color={
                                  currentResult.roi >= 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {formatPercentage(currentResult.roi / 100)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Risk Assessment
                          </Typography>
                          <Chip
                            label={currentResult.riskAssessment.level.toUpperCase()}
                            color={
                              currentResult.riskAssessment.level === "low"
                                ? "success"
                                : currentResult.riskAssessment.level ===
                                    "medium"
                                  ? "warning"
                                  : "error"
                            }
                            icon={
                              currentResult.riskAssessment.level === "low" ? (
                                <TrendingUp />
                              ) : currentResult.riskAssessment.level ===
                                "medium" ? (
                                <Warning />
                              ) : (
                                <TrendingDown />
                              )
                            }
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {currentResult.riskAssessment.recommendation}
                          </Typography>
                        </Box>

                        {currentResult.riskAssessment.factors.length > 0 && (
                          <Alert severity="warning" icon={<Warning />}>
                            <Typography variant="subtitle2">
                              Risk Factors:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {currentResult.riskAssessment.factors.map(
                                (factor, index) => (
                                  <li key={index}>{factor}</li>
                                ),
                              )}
                            </ul>
                          </Alert>
                        )}

                        {showAdvanced && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Advanced Metrics
                              </Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption">
                                    Kelly Fraction
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatPercentage(
                                      currentResult.kellyFraction,
                                    )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption">
                                    Sharpe Ratio
                                  </Typography>
                                  <Typography variant="body2">
                                    {currentResult.breakdown.sharpeRatio.toFixed(
                                      3,
                                    )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption">
                                    Confidence (95%)
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(
                                      currentResult.confidence.lower,
                                    )}{" "}
                                    -{" "}
                                    {formatCurrency(
                                      currentResult.confidence.upper,
                                    )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption">
                                    Variance
                                  </Typography>
                                  <Typography variant="body2">
                                    {currentResult.breakdown.variance.toFixed(
                                      2,
                                    )}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Paper>
                  </motion.div>
                )}
              </Grid>
            </Grid>
          )}

          {/* Batch Simulation Tab */}
          {activeTab === "batch" && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Batch Simulation</Typography>
                <Box>
                  <Button
                    onClick={addScenario}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Add Scenario
                  </Button>
                  <Button
                    onClick={handleBatchSimulation}
                    variant="contained"
                    disabled={scenarios.length === 0 || isSimulating}
                    startIcon={
                      isSimulating ? (
                        <LinearProgress sx={{ width: 20 }} />
                      ) : (
                        <PlayArrow />
                      )
                    }
                  >
                    Run Batch
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {scenarios.map((scenario, index) => (
                  <Grid item xs={12} md={6} key={scenario.id}>
                    <Paper sx={{ p: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="subtitle1">
                          {scenario.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => removeScenario(scenario.id)}
                        >
                          Remove
                        </Button>
                      </Box>
                      <Typography variant="body2">
                        ${scenario.stake} @ {scenario.odds} odds -{" "}
                        {scenario.player} {scenario.market}
                      </Typography>
                      {results.find((r) => r.scenario.id === scenario.id) && (
                        <Box mt={1}>
                          <Chip
                            size="small"
                            label={`EV: ${formatCurrency(results.find((r) => r.scenario.id === scenario.id)!.expectedValue)}`}
                            color={
                              results.find(
                                (r) => r.scenario.id === scenario.id,
                              )!.expectedValue >= 0
                                ? "success"
                                : "error"
                            }
                          />
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {scenarios.length === 0 && (
                <Alert severity="info">
                  Add scenarios to run batch simulations. You can start with
                  predefined scenarios or create custom ones.
                </Alert>
              )}
            </Box>
          )}

          {/* Comparison Tab */}
          {activeTab === "comparison" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Simulation Comparison
              </Typography>
              {results.length > 0 ? (
                <Grid container spacing={2}>
                  {results.map((result) => (
                    <Grid item xs={12} md={4} key={result.scenario.id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {result.scenario.name}
                        </Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">
                              Expected Value
                            </Typography>
                            <Typography
                              variant="body2"
                              color={
                                result.expectedValue >= 0
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              {formatCurrency(result.expectedValue)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">ROI</Typography>
                            <Typography variant="body2">
                              {formatPercentage(result.roi / 100)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption">
                              Risk Level
                            </Typography>
                            <Chip
                              size="small"
                              label={result.riskAssessment.level}
                              color={
                                result.riskAssessment.level === "low"
                                  ? "success"
                                  : result.riskAssessment.level === "medium"
                                    ? "warning"
                                    : "error"
                              }
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  Run simulations to compare results. Switch to Single or Batch
                  tabs to create simulations.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
