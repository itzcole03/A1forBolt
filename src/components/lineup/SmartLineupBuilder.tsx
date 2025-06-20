import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Badge,
} from "@mui/material";
import {
  PlayArrow,
  AutoAwesome,
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
  Add,
  Remove,
  Shuffle,
  Star,
  BarChart,
  Psychology,
  Speed,
  EmojiEvents,
} from "@mui/icons-material";
import { useLineupAPI } from "@/hooks/useLineupAPI";
import { usePredictions } from "@/hooks/usePredictions";
import { useSportsFilter } from "@/hooks/useSportsFilter";
import { Player } from "@/services/api";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface LineupConstraints {
  minSalary: number;
  maxSalary: number;
  maxPlayersPerTeam: number;
  requiredPositions: { [position: string]: number };
  excludedPlayers: string[];
  priorityPlayers: string[];
  exposurePercentage: number;
}

interface OptimizationSettings {
  algorithm: "genetic" | "linear" | "monte-carlo";
  iterations: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
  convergenceThreshold: number;
  parallelProcessing: boolean;
}

interface LineupAnalysis {
  expectedPoints: number;
  variance: number;
  sharpeRatio: number;
  correlationScore: number;
  ownership: number;
  uniqueness: number;
  ceiling: number;
  floor: number;
  consistencyScore: number;
  stackingBonus: number;
  weatherImpact: number;
  injuryRisk: number;
}

interface SmartLineupBuilderProps {
  onLineupSubmit?: (players: Player[]) => void;
  className?: string;
  maxLineups?: number;
  contestType?: "gpp" | "cash" | "tournament" | "double-up";
}

export const SmartLineupBuilder: React.FC<SmartLineupBuilderProps> = ({
  onLineupSubmit,
  className = "",
  maxLineups = 20,
  contestType = "gpp",
}) => {
  // State Management
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [optimizedLineups, setOptimizedLineups] = useState<
    { players: Player[]; analysis: LineupAnalysis }[]
  >([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "manual" | "optimizer" | "analysis"
  >("manual");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [constraints, setConstraints] = useState<LineupConstraints>({
    minSalary: 48000,
    maxSalary: 50000,
    maxPlayersPerTeam: 4,
    requiredPositions: {
      PG: 1,
      SG: 1,
      SF: 1,
      PF: 1,
      C: 1,
      G: 1,
      F: 1,
      UTIL: 1,
    },
    excludedPlayers: [],
    priorityPlayers: [],
    exposurePercentage: 25,
  });

  const [optimizationSettings, setOptimizationSettings] =
    useState<OptimizationSettings>({
      algorithm: "genetic",
      iterations: 1000,
      populationSize: 100,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.1,
      convergenceThreshold: 0.001,
      parallelProcessing: true,
    });

  const [filters, setFilters] = useState({
    position: "",
    team: "",
    minSalary: 0,
    maxSalary: 50000,
    minConfidence: 0,
    searchTerm: "",
    minProjection: 0,
    maxOwnership: 100,
    gameState: "all", // 'all', 'home', 'away', 'primetime'
    weather: "all", // 'all', 'dome', 'good', 'bad'
    pace: "all", // 'all', 'fast', 'medium', 'slow'
  });

  // Hooks
  const {
    players,
    isLoading,
    filterPlayers,
    validateLineup,
    submitLineup,
    getOptimalLineups,
  } = useLineupAPI();
  const { getPlayerPrediction, getConfidenceColor, getCorrelationMatrix } =
    usePredictions();
  const { activeSport } = useSportsFilter();

  // Computed Values
  const filteredPlayers = useMemo(() => {
    let filtered = filterPlayers(filters);

    // Apply advanced filters
    if (filters.gameState !== "all") {
      filtered = filtered.filter((p) => p.gameState === filters.gameState);
    }

    if (filters.weather !== "all") {
      filtered = filtered.filter((p) => p.weatherCondition === filters.weather);
    }

    if (filters.pace !== "all") {
      filtered = filtered.filter((p) => p.gamePace === filters.pace);
    }

    // Exclude excluded players
    filtered = filtered.filter(
      (p) => !constraints.excludedPlayers.includes(p.id),
    );

    return filtered.sort((a, b) => {
      const predA = getPlayerPrediction(a.id);
      const predB = getPlayerPrediction(b.id);
      return (
        predB.projectedPoints / predB.salary -
        predA.projectedPoints / predA.salary
      );
    });
  }, [
    filterPlayers,
    filters,
    constraints.excludedPlayers,
    getPlayerPrediction,
  ]);

  const { isValid, errors, totalSalary } = useMemo(
    () => validateLineup(selectedPlayers),
    [validateLineup, selectedPlayers],
  );

  const lineupAnalysis = useMemo(() => {
    if (selectedPlayers.length === 0) return null;

    const predictions = selectedPlayers.map((p) => getPlayerPrediction(p.id));
    const totalProjectedPoints = predictions.reduce(
      (sum, p) => sum + p.projectedPoints,
      0,
    );
    const variance = predictions.reduce((sum, p) => sum + p.variance, 0);
    const correlationMatrix = getCorrelationMatrix(
      selectedPlayers.map((p) => p.id),
    );

    // Calculate correlation score (lower is better for GPP)
    let correlationScore = 0;
    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix[i].length; j++) {
        correlationScore += Math.abs(correlationMatrix[i][j]);
      }
    }
    correlationScore /=
      (correlationMatrix.length * (correlationMatrix.length - 1)) / 2;

    // Calculate uniqueness (based on ownership)
    const avgOwnership =
      predictions.reduce((sum, p) => sum + p.ownership, 0) / predictions.length;
    const uniqueness = Math.max(0, 100 - avgOwnership);

    // Calculate ceiling and floor
    const ceiling = predictions.reduce((sum, p) => sum + p.ceiling, 0);
    const floor = predictions.reduce((sum, p) => sum + p.floor, 0);

    // Calculate consistency score
    const consistencyScore =
      predictions.reduce((sum, p) => sum + p.consistencyRating, 0) /
      predictions.length;

    // Calculate stacking bonus
    const teamCounts = selectedPlayers.reduce(
      (acc, p) => {
        acc[p.team] = (acc[p.team] || 0) + 1;
        return acc;
      },
      {} as { [team: string]: number },
    );
    const stackingBonus = Object.values(teamCounts).reduce(
      (sum, count) => sum + (count > 1 ? count * 0.5 : 0),
      0,
    );

    return {
      expectedPoints: totalProjectedPoints,
      variance,
      sharpeRatio: totalProjectedPoints / Math.sqrt(variance),
      correlationScore,
      ownership: avgOwnership,
      uniqueness,
      ceiling,
      floor,
      consistencyScore,
      stackingBonus,
      weatherImpact: predictions.reduce(
        (sum, p) => sum + (p.weatherImpact || 0),
        0,
      ),
      injuryRisk:
        predictions.reduce((sum, p) => sum + (p.injuryRisk || 0), 0) /
        predictions.length,
    } as LineupAnalysis;
  }, [selectedPlayers, getPlayerPrediction, getCorrelationMatrix]);

  // Event Handlers
  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else if (selectedPlayers.length < 8) {
      // Assuming 8-man lineups
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleOptimizeLineups = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const optimizedResults = await getOptimalLineups({
        players: filteredPlayers,
        constraints,
        settings: optimizationSettings,
        contestType,
        numLineups: maxLineups,
      });

      // Analyze each lineup
      const lineupsWithAnalysis = optimizedResults.map((lineup) => {
        const analysis = calculateLineupAnalysis(lineup.players);
        return { players: lineup.players, analysis };
      });

      setOptimizedLineups(lineupsWithAnalysis);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, [
    filteredPlayers,
    constraints,
    optimizationSettings,
    contestType,
    maxLineups,
    getOptimalLineups,
  ]);

  const calculateLineupAnalysis = (players: Player[]): LineupAnalysis => {
    const predictions = players.map((p) => getPlayerPrediction(p.id));
    const totalProjectedPoints = predictions.reduce(
      (sum, p) => sum + p.projectedPoints,
      0,
    );
    const variance = predictions.reduce((sum, p) => sum + p.variance, 0);

    return {
      expectedPoints: totalProjectedPoints,
      variance,
      sharpeRatio: totalProjectedPoints / Math.sqrt(variance),
      correlationScore: 0, // Calculate correlation
      ownership:
        predictions.reduce((sum, p) => sum + p.ownership, 0) /
        predictions.length,
      uniqueness: 0, // Calculate uniqueness
      ceiling: predictions.reduce((sum, p) => sum + p.ceiling, 0),
      floor: predictions.reduce((sum, p) => sum + p.floor, 0),
      consistencyScore:
        predictions.reduce((sum, p) => sum + p.consistencyRating, 0) /
        predictions.length,
      stackingBonus: 0, // Calculate stacking
      weatherImpact: 0, // Calculate weather impact
      injuryRisk:
        predictions.reduce((sum, p) => sum + (p.injuryRisk || 0), 0) /
        predictions.length,
    };
  };

  const handleSubmit = async () => {
    if (!isValid || !activeSport) return;

    try {
      await submitLineup({
        players: selectedPlayers.map((p) => p.id),
        sport: activeSport.id,
        contestType,
        analysis: lineupAnalysis,
      });

      if (onLineupSubmit) {
        onLineupSubmit(selectedPlayers);
      }
    } catch (error) {
      console.error("Lineup submission failed:", error);
    }
  };

  const exportLineups = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      contestType,
      constraints,
      lineups: optimizedLineups.map((lineup, index) => ({
        lineupNumber: index + 1,
        players: lineup.players.map((p) => ({
          name: p.name,
          position: p.position,
          team: p.team,
          salary: p.salary,
          projection: getPlayerPrediction(p.id).projectedPoints,
        })),
        analysis: lineup.analysis,
        totalSalary: lineup.players.reduce((sum, p) => sum + p.salary, 0),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-lineups-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRandomLineup = () => {
    const availablePlayers = [...filteredPlayers];
    const newLineup: Player[] = [];
    let remainingSalary = constraints.maxSalary;

    // Fill required positions
    Object.entries(constraints.requiredPositions).forEach(
      ([position, count]) => {
        for (let i = 0; i < count; i++) {
          const eligiblePlayers = availablePlayers.filter(
            (p) => p.position === position && p.salary <= remainingSalary,
          );

          if (eligiblePlayers.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * Math.min(eligiblePlayers.length, 5),
            ); // Pick from top 5
            const selectedPlayer = eligiblePlayers[randomIndex];
            newLineup.push(selectedPlayer);
            remainingSalary -= selectedPlayer.salary;

            // Remove player from available pool
            const playerIndex = availablePlayers.findIndex(
              (p) => p.id === selectedPlayer.id,
            );
            availablePlayers.splice(playerIndex, 1);
          }
        }
      },
    );

    setSelectedPlayers(newLineup);
  };

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
      className={`w-full ${className}`}
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
              <AutoAwesome />
              Smart Lineup Builder
              <Chip
                label={contestType.toUpperCase()}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                onClick={generateRandomLineup}
                startIcon={<Shuffle />}
                variant="outlined"
              >
                Random
              </Button>
              <Button
                onClick={exportLineups}
                disabled={optimizedLineups.length === 0}
                startIcon={<Download />}
                variant="outlined"
              >
                Export
              </Button>
              <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
                <Settings />
              </IconButton>
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Stack direction="row" spacing={2}>
              {["manual", "optimizer", "analysis"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "contained" : "outlined"}
                  onClick={() => setActiveTab(tab as any)}
                  sx={{ textTransform: "capitalize" }}
                  startIcon={
                    tab === "manual" ? (
                      <Add />
                    ) : tab === "optimizer" ? (
                      <AutoAwesome />
                    ) : (
                      <Assessment />
                    )
                  }
                >
                  {tab}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Manual Tab */}
          {activeTab === "manual" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 600, overflow: "auto" }}>
                  <Typography variant="h6" gutterBottom>
                    Available Players
                  </Typography>

                  {/* Filters */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Position</InputLabel>
                        <Select
                          value={filters.position}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              position: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="PG">PG</MenuItem>
                          <MenuItem value="SG">SG</MenuItem>
                          <MenuItem value="SF">SF</MenuItem>
                          <MenuItem value="PF">PF</MenuItem>
                          <MenuItem value="C">C</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Search Player"
                        value={filters.searchTerm}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            searchTerm: e.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Min Projection"
                        type="number"
                        value={filters.minProjection}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minProjection: Number(e.target.value),
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Max Ownership %"
                        type="number"
                        value={filters.maxOwnership}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxOwnership: Number(e.target.value),
                          }))
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* Player List */}
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell>Pos</TableCell>
                          <TableCell>Team</TableCell>
                          <TableCell>Salary</TableCell>
                          <TableCell>Proj</TableCell>
                          <TableCell>Own%</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPlayers.slice(0, 50).map((player) => {
                          const prediction = getPlayerPrediction(player.id);
                          const isSelected = selectedPlayers.find(
                            (p) => p.id === player.id,
                          );
                          const value =
                            prediction.projectedPoints / (player.salary / 1000);

                          return (
                            <TableRow
                              key={player.id}
                              sx={{
                                backgroundColor: isSelected
                                  ? "action.selected"
                                  : "inherit",
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar
                                    sx={{ width: 24, height: 24, fontSize: 12 }}
                                  >
                                    {player.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {player.name}
                                  </Typography>
                                  {constraints.priorityPlayers.includes(
                                    player.id,
                                  ) && (
                                    <Star color="warning" fontSize="small" />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip label={player.position} size="small" />
                              </TableCell>
                              <TableCell>{player.team}</TableCell>
                              <TableCell>
                                {formatCurrency(player.salary)}
                              </TableCell>
                              <TableCell>
                                <Tooltip
                                  title={`Confidence: ${prediction.confidence}%`}
                                >
                                  <Chip
                                    label={prediction.projectedPoints.toFixed(
                                      1,
                                    )}
                                    size="small"
                                    color={getConfidenceColor(
                                      prediction.confidence,
                                    )}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                {prediction.ownership.toFixed(1)}%
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={value.toFixed(2)}
                                  size="small"
                                  color={
                                    value > 5
                                      ? "success"
                                      : value > 4
                                        ? "warning"
                                        : "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handlePlayerSelect(player)}
                                  color={isSelected ? "error" : "primary"}
                                >
                                  {isSelected ? <Remove /> : <Add />}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Lineup
                  </Typography>

                  {/* Lineup Status */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Salary Used:</Typography>
                      <Typography
                        variant="body2"
                        color={
                          totalSalary > constraints.maxSalary
                            ? "error"
                            : "inherit"
                        }
                      >
                        {formatCurrency(totalSalary)} /{" "}
                        {formatCurrency(constraints.maxSalary)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(totalSalary / constraints.maxSalary) * 100}
                      color={
                        totalSalary > constraints.maxSalary
                          ? "error"
                          : "primary"
                      }
                    />
                  </Box>

                  {/* Selected Players */}
                  <Stack
                    spacing={1}
                    sx={{ mb: 2, maxHeight: 300, overflow: "auto" }}
                  >
                    {selectedPlayers.map((player) => {
                      const prediction = getPlayerPrediction(player.id);
                      return (
                        <Box
                          key={player.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: 1,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {player.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {player.position} - {player.team} -{" "}
                              {formatCurrency(player.salary)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2">
                              {prediction.projectedPoints.toFixed(1)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handlePlayerSelect(player)}
                            >
                              <Remove />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>

                  {/* Lineup Analysis */}
                  {lineupAnalysis && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Lineup Analysis
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption">
                            Projected Points
                          </Typography>
                          <Typography variant="h6">
                            {lineupAnalysis.expectedPoints.toFixed(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Ceiling</Typography>
                          <Typography variant="h6">
                            {lineupAnalysis.ceiling.toFixed(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Ownership</Typography>
                          <Typography variant="body2">
                            {lineupAnalysis.ownership.toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Uniqueness</Typography>
                          <Typography variant="body2">
                            {lineupAnalysis.uniqueness.toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Errors */}
                  {errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.map((error, index) => (
                        <Typography key={index} variant="body2">
                          {error}
                        </Typography>
                      ))}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid}
                    sx={{ mt: 2 }}
                    startIcon={<EmojiEvents />}
                  >
                    Submit Lineup
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Optimizer Tab */}
          {activeTab === "optimizer" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Optimization Settings
                  </Typography>

                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Algorithm</InputLabel>
                      <Select
                        value={optimizationSettings.algorithm}
                        onChange={(e) =>
                          setOptimizationSettings((prev) => ({
                            ...prev,
                            algorithm: e.target.value as any,
                          }))
                        }
                      >
                        <MenuItem value="genetic">Genetic Algorithm</MenuItem>
                        <MenuItem value="linear">Linear Programming</MenuItem>
                        <MenuItem value="monte-carlo">Monte Carlo</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Number of Lineups"
                      type="number"
                      value={maxLineups}
                      InputProps={{ readOnly: true }}
                    />

                    {showAdvanced && (
                      <>
                        <TextField
                          fullWidth
                          label="Iterations"
                          type="number"
                          value={optimizationSettings.iterations}
                          onChange={(e) =>
                            setOptimizationSettings((prev) => ({
                              ...prev,
                              iterations: Number(e.target.value),
                            }))
                          }
                        />
                        <TextField
                          fullWidth
                          label="Population Size"
                          type="number"
                          value={optimizationSettings.populationSize}
                          onChange={(e) =>
                            setOptimizationSettings((prev) => ({
                              ...prev,
                              populationSize: Number(e.target.value),
                            }))
                          }
                        />
                      </>
                    )}

                    <Divider />

                    <Typography variant="subtitle2">Constraints</Typography>
                    <TextField
                      fullWidth
                      label="Max Salary"
                      type="number"
                      value={constraints.maxSalary}
                      onChange={(e) =>
                        setConstraints((prev) => ({
                          ...prev,
                          maxSalary: Number(e.target.value),
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Max Players Per Team"
                      type="number"
                      value={constraints.maxPlayersPerTeam}
                      onChange={(e) =>
                        setConstraints((prev) => ({
                          ...prev,
                          maxPlayersPerTeam: Number(e.target.value),
                        }))
                      }
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleOptimizeLineups}
                      disabled={isOptimizing}
                      startIcon={
                        isOptimizing ? (
                          <LinearProgress sx={{ width: 20 }} />
                        ) : (
                          <AutoAwesome />
                        )
                      }
                      size="large"
                    >
                      {isOptimizing
                        ? "Optimizing..."
                        : "Generate Optimal Lineups"}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 600, overflow: "auto" }}>
                  <Typography variant="h6" gutterBottom>
                    Optimized Lineups
                  </Typography>

                  {optimizedLineups.length > 0 ? (
                    <Stack spacing={2}>
                      {optimizedLineups.map((lineup, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              width="100%"
                            >
                              <Typography>Lineup {index + 1}</Typography>
                              <Box display="flex" gap={2}>
                                <Chip
                                  label={`${lineup.analysis.expectedPoints.toFixed(1)} pts`}
                                  color="primary"
                                  size="small"
                                />
                                <Chip
                                  label={`${lineup.analysis.ownership.toFixed(1)}% own`}
                                  color="secondary"
                                  size="small"
                                />
                                <Chip
                                  label={formatCurrency(
                                    lineup.players.reduce(
                                      (sum, p) => sum + p.salary,
                                      0,
                                    ),
                                  )}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={8}>
                                <TableContainer>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Player</TableCell>
                                        <TableCell>Pos</TableCell>
                                        <TableCell>Salary</TableCell>
                                        <TableCell>Proj</TableCell>
                                        <TableCell>Own%</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {lineup.players.map((player) => {
                                        const prediction = getPlayerPrediction(
                                          player.id,
                                        );
                                        return (
                                          <TableRow key={player.id}>
                                            <TableCell>{player.name}</TableCell>
                                            <TableCell>
                                              {player.position}
                                            </TableCell>
                                            <TableCell>
                                              {formatCurrency(player.salary)}
                                            </TableCell>
                                            <TableCell>
                                              {prediction.projectedPoints.toFixed(
                                                1,
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {prediction.ownership.toFixed(1)}%
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Analysis
                                </Typography>
                                <Stack spacing={1}>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="caption">
                                      Ceiling:
                                    </Typography>
                                    <Typography variant="body2">
                                      {lineup.analysis.ceiling.toFixed(1)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="caption">
                                      Floor:
                                    </Typography>
                                    <Typography variant="body2">
                                      {lineup.analysis.floor.toFixed(1)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="caption">
                                      Sharpe Ratio:
                                    </Typography>
                                    <Typography variant="body2">
                                      {lineup.analysis.sharpeRatio.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="caption">
                                      Uniqueness:
                                    </Typography>
                                    <Typography variant="body2">
                                      {lineup.analysis.uniqueness.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      Run the optimizer to generate optimal lineups based on
                      your constraints and settings.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Portfolio Analysis
              </Typography>

              {optimizedLineups.length > 0 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Portfolio Summary
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption">
                            Total Expected Points
                          </Typography>
                          <Typography variant="h5">
                            {optimizedLineups
                              .reduce(
                                (sum, l) => sum + l.analysis.expectedPoints,
                                0,
                              )
                              .toFixed(1)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption">
                            Average Ownership
                          </Typography>
                          <Typography variant="h6">
                            {(
                              optimizedLineups.reduce(
                                (sum, l) => sum + l.analysis.ownership,
                                0,
                              ) / optimizedLineups.length
                            ).toFixed(1)}
                            %
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption">
                            Portfolio Correlation
                          </Typography>
                          <Typography variant="h6">
                            {(
                              optimizedLineups.reduce(
                                (sum, l) => sum + l.analysis.correlationScore,
                                0,
                              ) / optimizedLineups.length
                            ).toFixed(3)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Risk Assessment
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption">
                            Portfolio Ceiling
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {Math.max(
                              ...optimizedLineups.map(
                                (l) => l.analysis.ceiling,
                              ),
                            ).toFixed(1)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption">
                            Portfolio Floor
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {Math.min(
                              ...optimizedLineups.map((l) => l.analysis.floor),
                            ).toFixed(1)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption">
                            Average Sharpe Ratio
                          </Typography>
                          <Typography variant="h6">
                            {(
                              optimizedLineups.reduce(
                                (sum, l) => sum + l.analysis.sharpeRatio,
                                0,
                              ) / optimizedLineups.length
                            ).toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  Generate optimized lineups to view portfolio analysis.
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartLineupBuilder;
