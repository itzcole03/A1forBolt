// Types for prediction confidence bands, win probability, and simulation

export interface ConfidenceBand {
  lower: number; // Lower bound of the confidence interval
  upper: number; // Upper bound of the confidence interval
  mean: number;  // Mean or expected value
  confidenceLevel: number; // e.g., 0.95 for 95% CI
}

export interface WinProbability {
  probability: number; // Probability of win (0-1)
  impliedOdds?: number; // Bookmaker implied odds, if available
  modelOdds?: number;   // Model's own odds
  updatedAt: string;    // ISO timestamp
}

export interface PredictionWithConfidence {
  predictionId: string;
  eventId: string;
  predictedValue: number;
  confidenceBand: ConfidenceBand;
  winProbability: WinProbability;
  model: string;
  market: string;
  player?: string;
  team?: string;
  context?: string;
}

export interface HistoricalPerformance {
  date: string; // ISO date
  prediction: number;
  actual: number;
  won: boolean;
  payout: number;
  confidenceBand: ConfidenceBand;
  winProbability: WinProbability;
}

export interface PerformanceHistory {
  eventId: string;
  history: HistoricalPerformance[];
}

export interface BetSimulationInput {
  stake: number;
  odds: number;
  confidenceBand: ConfidenceBand;
  winProbability: WinProbability;
}

export interface BetSimulationResult {
  expectedReturn: number;
  variance: number;
  winProbability: number;
  lossProbability: number;
  payout: number;
  breakEvenStake: number;
}
