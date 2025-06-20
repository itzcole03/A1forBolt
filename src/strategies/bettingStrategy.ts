import { APIError, AppError } from '../core/UnifiedError';
import { post } from './api';
import { unifiedMonitor } from '../core/UnifiedMonitor';
import {
  BettingStrategyRequest,      // { propositions: FrontendProposition[], bankroll: number, riskLevel: string }
  BettingStrategyResponse,     // Should be BettingOpportunity[]
  BettingOpportunity,          // { id, description, expectedValue, confidence, type, legs: FrontendBetLeg[], stakeSuggestion, potentialPayout }
  FrontendBetLeg,              // { propId, marketKey, outcome, odds, playerId, gameId?, description? }
  FrontendBetPlacementRequest, // { bets: BettingOpportunity[] } 
  BetPlacementResponse,        // { betId, success, message, transactionId }
} from '../../../shared/betting';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BETTING_BACKEND_PREFIX = `${API_BASE_URL}/api/betting`;

// --- Backend Type Definitions (mirroring Pydantic models from betting_route.py) ---
interface BackendBetLeg {
    prop_id: string;
    market_key: string;
    outcome: string;
    odds: number;
    player_id?: string;
    game_id?: string;
    description?: string;
}

interface BackendStrategyBet {
    bet_id: string;
    legs: BackendBetLeg[];
    stake: number;
    potential_payout: number;
    status: string;
    created_at: string; // datetime string
    type?: string; // e.g., 'parlay', 'single'
    // Note: 'description' is not a direct field on the backend Pydantic StrategyBet model
}

interface BackendBetPlacementResult {
    bet_id: string;
    status: string; // e.g., 'placed', 'failed', 'pending'
    message?: string;
    transaction_id?: string;
}
// --- End Backend Type Definitions ---

/**
 * Calculates a betting strategy based on selected props, bankroll, and risk level.
 * Calls the backend's /api/betting/calculate-strategy endpoint (currently mocked).
 * Expected frontend request (BettingStrategyRequest) is mapped to backend's StrategyCalculationRequest.
 * Backend StrategyCalculationRequest (from backend/routes/betting_route.py) looks like:
 * {
 *   "propositions": [
 *     { "prop_id": "string", "line": number, "over_odds": number (optional), "under_odds": number (optional), 
 *       "player_name": "string" (optional), "stat_type": "string" (optional) ... }
 *   ],
 *   "bankroll": number,
 *   "risk_level": "string"
 * }
 * Expected backend mock response is a list of BackendStrategyBet (defined in this file), which gets mapped to BettingOpportunity[].
 * BackendStrategyBet example (from backend/routes/betting_route.py StrategyBet Pydantic model):
 * {
 *    "bet_id": "string",
 *    "legs": [ { "prop_id": "string", "market_key": "string", "outcome": "string", "odds": number, ... } ],
 *    "stake": number,
 *    "potential_payout": number,
 *    "status": "string",
 *    "created_at": "datetime_string",
 *    "type": "string" (optional)
 * }
 */
export const calculateBettingStrategy = async (
  request: BettingStrategyRequest
): Promise<BettingStrategyResponse> => { // Which is BettingOpportunity[]
  const trace = unifiedMonitor.startTrace('bettingStrategy.calculateBettingStrategy', 'http.client');
  try {
    const endpoint = `${BETTING_BACKEND_PREFIX}/calculate-strategy`;
    const backendRequestPayload = {
        available_propositions: request.propositions, 
        bankroll: request.bankroll,
        risk_level: request.riskLevel,
    };
    // Backend returns List[BackendStrategyBet]
    const response = await post<BackendStrategyBet[]>(endpoint, backendRequestPayload); 

    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }

    const mappedResponse: BettingOpportunity[] = response.data.map((bet: BackendStrategyBet): BettingOpportunity => ({
        id: bet.bet_id,
        // BackendStrategyBet does not have a direct description field.
        // Construct description based on available data or set a default.
        description: `Strategy bet for ${(Array.isArray(bet.legs) ? bet.legs.length : 0)} leg(s)`,
        expectedValue: bet.potential_payout - bet.stake, 
        confidence: 0.75, // Mock confidence, backend doesn't provide this for now
        type: bet.type || ((Array.isArray(bet.legs) && bet.legs.length > 1) ? 'parlay' : 'single'),
        legs: (Array.isArray(bet.legs) ? bet.legs : []).map((leg: BackendBetLeg): FrontendBetLeg => ({
            propId: leg.prop_id,
            marketKey: leg.market_key,
            outcome: leg.outcome,
            odds: leg.odds,
            playerId: leg.player_id,
            gameId: leg.game_id,
            description: leg.description,
        })),
        stakeSuggestion: bet.stake,
        potentialPayout: bet.potential_payout,
        status: bet.status, 
    }));

    return mappedResponse;

  } catch (error: any) {
    const errContext = { service: 'bettingStrategy', operation: 'calculateBettingStrategy' };
    unifiedMonitor.reportError(error, errContext);
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    if (error instanceof APIError || error instanceof AppError) throw error;
    throw new AppError('Failed to calculate betting strategy from backend.', undefined, errContext, error);
  }
};

/**
 * Places bets based on the provided opportunities.
 * Calls the backend's /api/betting/place-bet endpoint (currently mocked).
 * Frontend FrontendBetPlacementRequest ({ bets: BettingOpportunity[] }) is mapped to a list of backend StrategyBet models.
 * Expected backend mock response is a list of BackendBetPlacementResult (defined in this file), mapped to BetPlacementResponse[].
 * BackendBetPlacementResult example (from backend/routes/betting_route.py BetPlacementResult Pydantic model):
 * {
 *   "bet_id": "string",
 *   "status": "string (e.g., placed, failed)",
 *   "message": "string (optional)",
 *   "transaction_id": "string (optional)"
 * }
 */
export const placeBets = async (
  request: FrontendBetPlacementRequest // { bets: BettingOpportunity[] }
): Promise<BetPlacementResponse[]> => {
  const trace = unifiedMonitor.startTrace('bettingStrategy.placeBets', 'http.client');
  try {
    const endpoint = `${BETTING_BACKEND_PREFIX}/place-bet`;
    // Backend expects List[BackendStrategyBet] as BetPlacementRequest
    const backendPayload: BackendStrategyBet[] = request.bets.map((opp: BettingOpportunity): BackendStrategyBet => ({
        bet_id: opp.id, 
        legs: opp.legs.map((leg: FrontendBetLeg): BackendBetLeg => ({
            prop_id: leg.propId,
            market_key: leg.marketKey,
            outcome: leg.outcome,
            odds: leg.odds,
            player_id: leg.playerId,
            game_id: leg.gameId,
            description: leg.description,
        })),
        stake: opp.stakeSuggestion || 0, // Ensure stake is a number
        potential_payout: opp.potentialPayout || 0, // Ensure potential_payout is a number
        status: opp.status || 'pending_placement', // Pass current status or a default
        created_at: new Date().toISOString(), // Backend will likely overwrite this
        type: opp.type,
    }));

    const response = await post<BackendBetPlacementResult[]>(endpoint, backendPayload); 

    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }

    const mappedResponse: BetPlacementResponse[] = response.data.map((result: BackendBetPlacementResult): BetPlacementResponse => ({
        betId: result.bet_id,
        success: result.status === 'placed' || result.status === 'accepted', 
        message: result.message,
        transactionId: result.transaction_id,
    }));

    return mappedResponse;

  } catch (error: any) {
    const errContext = { service: 'bettingStrategy', operation: 'placeBets' };
    unifiedMonitor.reportError(error, errContext);
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    if (error instanceof APIError || error instanceof AppError) throw error;
    throw new AppError('Failed to place bets via backend.', undefined, errContext, error);
  }
};

export const bettingStrategyService = {
  calculateBettingStrategy,
  placeBets,
}; 