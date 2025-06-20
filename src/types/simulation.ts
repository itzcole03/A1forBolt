// Types for bet probability simulation and result modeling

import type { ConfidenceBand, WinProbability } from './confidence';

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

export interface BetSimulatorScenario {
  scenarioId: string;
  description: string;
  input: BetSimulationInput;
  result: BetSimulationResult;
  createdAt: string;
}
