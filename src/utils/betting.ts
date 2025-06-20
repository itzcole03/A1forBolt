
// Frontend representation of a proposition that can be part of a strategy
export interface FrontendProposition {
  propId: string;
  line: number;
  // Odds might be more complex (e.g., specific to over/under)
  // For strategy calculation, the backend might expect a single representative odd or specific over/under odds.
  overOdds?: number;
  underOdds?: number;
  // We might also need player name, stat type for the backend to identify/process the prop
  playerName?: string;
  statType?: string;
  // Any other fields required by the backend's `BetLeg` or similar for calculation
}

// Request to calculate a betting strategy
export interface BettingStrategyRequest {
  propositions: FrontendProposition[]; // The props the user is considering
  bankroll: number;
  riskLevel: string; // e.g., "low", "medium", "high"
  // Potentially other parameters like preferred bet types, number of legs, etc.
}

// Represents a single leg of a bet within a betting opportunity/strategy
export interface FrontendBetLeg {
  propId: string;
  marketKey: string; // e.g., 'player_points_over_under'
  outcome: string; // e.g., 'over', 'under', or specific player outcome
  odds: number;
  playerId?: string;
  gameId?: string;
  description?: string; // e.g., "LeBron James Over 25.5 Points"
  line?: number; // Line associated with the pick
  statType?: string; // Stat type for this leg
  playerName?: string; // Player name for this leg
}

// Represents a single betting opportunity or a recommended bet from the strategy engine
export interface BettingOpportunity {
  id: string; // Unique ID for this opportunity/bet
  description: string; // e.g., "High-Value Parlay on NBA Games"
  expectedValue?: number;
  confidence?: number; // 0 to 1
  type: string; // e.g., "single", "parlay", "arbitrage"
  legs: FrontendBetLeg[];
  stakeSuggestion?: number;
  potentialPayout?: number;
  status?: string; // Current status if it's an existing bet being analyzed
  // Any other fields from BackendStrategyBet that are useful on frontend
}

// The response from the betting strategy calculation (an array of opportunities)
export type BettingStrategyResponse = BettingOpportunity[];

// Request to place bets (could be one or more opportunities)
export interface FrontendBetPlacementRequest {
  bets: BettingOpportunity[]; // The bets (opportunities) the user wants to place
  // userId?: string; // User ID might be injected by auth interceptor or taken from store
}

// Response for a single bet placement attempt
export interface BetPlacementResponse {
  betId: string; // ID of the bet that was attempted to be placed
  success: boolean;
  message?: string;
  transactionId?: string; // If the sportsbook returns a transaction ID
  // Any other relevant details from BackendBetPlacementResult
}

// ParlayLeg type for use in bet slips (compatible with PrizePicks and betting logic)
export interface ParlayLeg {
  propId: string;
  pick: 'over' | 'under';
  line: number;
  odds: number;
  statType: string;
  playerName: string;
} 