// --- MISSING TYPES ADDED FOR INTEGRATION HEALTH ---

/**
 * Represents a sportsbook/bookmaker for line shopping and arbitrage.
 */
export interface Sportsbook {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  country?: string;
  isActive?: boolean;
}

/**
 * Result of a line shopping operation for a specific event/market/selection.
 */
export interface LineShoppingResult {
  eventId: string;
  market: string;
  selection: string;
  bestOdds: {
    bookmaker: string;
    odds: number;
    timestamp: number;
  };
  allOdds: Array<{
    bookmaker: string;
    odds: number;
    timestamp: number;
  }>;
  priceImprovement: number;
  confidence: number;
}

/**
 * Represents an arbitrage opportunity across multiple sportsbooks.
 */
export interface ArbitrageOpportunity {
  id: string;
  legs: Array<{
    bookId: string;
    propId: string;
    odds: number;
    stake: number;
    maxStake: number;
    timestamp: number;
  }>;
  profitMargin: number;
  totalStake: number;
  expectedProfit: number;
  risk: {
    exposure: number;
    confidence: number;
    timeSensitivity: number;
  };
  status: 'pending' | 'active' | 'expired' | 'filled';
  timestamp: number;
}
// Re-export market analytics types for dashboard usage
export type { MarketMetrics, MarketEfficiencyMetrics, MarketAnomaly } from './market';
// Core betting types
export enum BetType {
  STRAIGHT = 'straight',
  PARLAY = 'parlay',
  TEASER = 'teaser',
  ARBITRAGE = 'arbitrage',
}

export enum RiskProfileType {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE',
}

export enum BetClassification {
  SAFE_BET = 'Safe Bet',
  SURE_ODDS = 'Sure Odds',
  AGGRESSIVE_EDGE = 'Aggressive Edge',
}

// Bookmaker and odds types
export interface BookOdds {
  bookId: string;
  bookName: string;
  odds: number;
  timestamp: number;
}

// Teaser betting types
export interface TeaserLeg {
  id: string;
  gameId: string;
  market: string;
  originalLine: number;
  odds: number;
  adjustedLine?: number;
  currentSpread?: number;
  originalOdds?: number;
  adjustedOdds?: number;
  correlatedMarkets?: string[];
}

export interface TeaserStrategy {
  id?: string;
  legs: TeaserLeg[];
  points?: number;
  totalOdds: number;
  expectedValue: number;
  winProbability?: number;
  riskAmount?: number;
  potentialPayout?: number;
}

// Risk profile types
export interface RiskProfile {
  profile_type: RiskProfileType;
  max_stake_percentage: number;
  min_confidence_threshold: number;
  volatility_tolerance: number;
  max_risk_score: number;
  preferred_sports: string[];
  preferred_markets: string[];
  excluded_events?: string[];
  max_daily_loss: number;
  max_concurrent_bets: number;
  kelly_fraction: number;
}

// Default risk profiles
export const DEFAULT_RISK_PROFILES: Record<RiskProfileType, RiskProfile> = {
  [RiskProfileType.CONSERVATIVE]: {
    profile_type: RiskProfileType.CONSERVATIVE,
    max_stake_percentage: 0.02,
    min_confidence_threshold: 0.75,
    volatility_tolerance: 0.3,
    max_risk_score: 0.4,
    preferred_sports: ['NBA', 'NFL'],
    preferred_markets: ['moneyline', 'spread'],
    excluded_events: [],
    max_daily_loss: 0.05,
    max_concurrent_bets: 2,
    kelly_fraction: 0.3,
  },
  [RiskProfileType.MODERATE]: {
    profile_type: RiskProfileType.MODERATE,
    max_stake_percentage: 0.05,
    min_confidence_threshold: 0.6,
    volatility_tolerance: 0.5,
    max_risk_score: 0.6,
    preferred_sports: ['NBA', 'NFL', 'MLB'],
    preferred_markets: ['moneyline', 'spread', 'totals'],
    excluded_events: [],
    max_daily_loss: 0.1,
    max_concurrent_bets: 3,
    kelly_fraction: 0.5,
  },
  [RiskProfileType.AGGRESSIVE]: {
    profile_type: RiskProfileType.AGGRESSIVE,
    max_stake_percentage: 0.1,
    min_confidence_threshold: 0.5,
    volatility_tolerance: 0.7,
    max_risk_score: 0.8,
    preferred_sports: ['NBA', 'NFL', 'MLB', 'NHL'],
    preferred_markets: ['moneyline', 'spread', 'totals', 'props'],
    excluded_events: [],
    max_daily_loss: 0.15,
    max_concurrent_bets: 5,
    kelly_fraction: 0.7,
  },
};

export interface UserConstraints {
  max_bankroll_stake: number;
  time_window_hours: number;
  preferred_sports: string[];
  preferred_markets: string[];
}

export interface BettingOdds {
  id: string;
  confidence: number;
  metadata?: Record<string, unknown>; // Replaced any with type-safe Record
}

export interface ShapFeature {
  name: string;
  value: number;
  impact: number;
}

export type SHAPExplanation = Record<string, number>;

export interface ModelPrediction {
  model_type: string;
  prediction_probability: number;
  confidence_score: number;
  historical_roi: number;
  win_rate: number;
  shap_explanation: SHAPExplanation;
  timestamp: string;
}

export interface BetRecommendation {
  id: string;
  event: Event;
  market: Market;
  selection: Selection;
  odds: Odds;
  prediction: number;
  confidence: number;
  stake: number;
  expectedValue: number;
  riskLevel: RiskProfileType;
  timestamp: string;
}

export interface BettingRequest {
  risk_profile: RiskProfile;
  user_constraints: UserConstraints;
  current_bankroll: number;
}

export interface BettingResponse {
  recommendations: BetRecommendation[];
  timestamp: string;
}

export interface BettingMetrics {
  totalBets: number;
  winningBets: number;
  losingBets: number;
  totalStake: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  averageOdds: number;
  averageStake: number;
  riskScore: number;
  timestamp: string;
  returns?: number[];
}

export interface BettingHistory {
  bets: BettingHistoryEntry[];
  metrics: BettingMetrics;
}

export interface BettingHistoryEntry {
  event_id: string;
  bet_type: BetType;
  stake: number;
  odds: number;
  outcome: 'win' | 'loss' | 'push';
  profit: number;
  timestamp: string;
}

export interface BettingSimulation {
  initial_bankroll: number;
  final_bankroll: number;
  total_profit: number;
  roi: number;
  win_rate: number;
  bets: BettingHistoryEntry[];
  metrics: BettingMetrics;
}

export interface BettingSettings {
  risk_profile: RiskProfile;
  user_constraints: UserConstraints;
  auto_betting: boolean;
  max_concurrent_bets: number;
  min_odds: number;
  max_odds: number;
  excluded_events: string[];
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  bet_placed: boolean;
  bet_settled: boolean;
  bankroll_alert: boolean;
  risk_alert: boolean;
  email_address?: string;
}

export interface PredictionData {
  value: number;
  confidence: number;
  timestamp: number;
}

export interface PlayerProjection {
  value: number;
  high: number;
  low: number;
  confidence: number;
}

export interface SentimentData {
  event_id: string;
  sentiment_score: number;
  volume: number;
  sources: {
    social: number;
    news: number;
    betting: number;
  };
  last_updated: string;
}

export interface RealtimeData {
  odds: {
    [market: string]: BookOdds;
  };
  projections: {
    [playerId: string]: {
      [metric: string]: PlayerProjection;
    };
  };
  sentiment: {
    [playerId: string]: SentimentData;
  };
}

export interface LiveOddsTickerProps {
  eventId: string;
  data?: OddsData;
  className?: string;
}

export interface AnalyticsMetrics {
  winRate: number;
  totalBets: number;
  confidence: number;
}

export interface BettingAlert {
  type: 'opportunity' | 'warning' | 'info';
  message: string;
  data: {
    prediction: PredictionData;
    strategy: unknown;
  };
}

export interface MarketOdds {
  market_type: string;
  selection: string;
  odds: number;
  selections?: Array<{
    name: string;
    odds: number;
  }>;
}

export interface OddsData {
  event_id: string;
  markets: MarketOdds[];
  timestamp: string;
}


export interface WebSocketOptions<T = unknown> {
  onMessage?: (data: T) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}


export interface WebSocketHook<T = unknown> {
  isConnected: boolean;
  send: (data: T) => void;
  close: () => void;
}

export interface BettingOpportunitiesProps {
  opportunities: BetRecommendation[];
  onBetPlacement: (recommendation: BetRecommendation) => void;
  alerts: BettingAlert[];
  isLoading: boolean;
}

export interface RiskProfileSelectorProps {
  currentProfile: RiskProfileType;
  onProfileChange: (profile: RiskProfileType) => void;
}

export interface ShapVisualizationProps {
  features: ShapFeature[];
  loading: boolean;
  error: Error | null;
}

export interface PerformanceMetricsProps {
  metrics: BettingMetrics;
  loading: boolean;
  error: Error | null;
}

export interface BettingOpportunity {
  id: string;
  event: Event;
  market: Market;
  selection: Selection;
  odds: Odds;
  prediction: number;
  confidence: number;
  expectedValue: number;
  riskLevel: RiskProfileType;
  timestamp: string;
  event_name: string;
  start_time: string;
  sport: string;
  gameId: string;
  type: string;
  description: string;
  books: BookOdds[];
  metadata: {
    middleSize?: number;
    timestamp?: number;
    source?: string;
  };
}

export interface Bet {
  id: string;
  event: Event;
  marketType: string;
  selection: Selection;
  odds: number;
  stake: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  timestamp: string;
  sportName: string;
}

export interface BetSlip {
  bets: Bet[];
  totalStake: number;
  potentialWinnings: number;
}

export interface Odds {
  selectionId: string;
  value: number;
  timestamp: string;
  source: string;
}

export interface Sport {
  id: string;
  name: string;
  icon?: string;
}

export interface Event {
  id: string;
  name: string;
  sport: string;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished';
  teams: {
    home: string;
    away: string;
  };
  score?: {
    home: number;
    away: number;
  };
}

export interface Market {
  id: string;
  eventId: string;
  name: string;
  type: string;
  status: 'open' | 'closed' | 'suspended';
  selections: Selection[];
}

export interface Selection {
  id: string;
  marketId: string;
  name: string;
  odds: number;
  status: 'active' | 'suspended' | 'settled';
  result?: 'won' | 'lost' | 'void';
}

export type BettingStrategy = 'kelly' | 'fixed' | 'martingale' | 'fibonacci';

export interface BettingState {
  bets: Bet[];
  activeBets: Bet[];
  balance: number;
  isLoading: boolean;
  error: string | null;
}

export interface BettingConfig {
  minStake: number;
  maxStake: number;
  maxKellyFraction: number;
  minConfidenceScore: number;
  minExpectedValue: number;
  strategies: string[];
  autoBetting: boolean;
  notifications: boolean;
}

export interface BettingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BettingSubscription {
  eventId: string;
  marketId: string;
  selectionId: string;
  callback: (opportunity: BettingOpportunity) => void;
  config?: Partial<BettingConfig>;
}

export interface BettingStateContext {
  state: 'idle' | 'preview' | 'confirming' | 'submitting' | 'success' | 'error';
  error: string | null;
  preview: {
    stake: number;
    potentialPayout: number;
    odds: number;
    kellyFraction: number;
    expectedValue: number;
  } | null;
  bet: {
    id: string;
    eventId: string;
    marketId: string;
    selectionId: string;
    stake: number;
    odds: number;
    timestamp: number;
  } | null;
}

export interface BettingPreview {
  potentialPayout: number;
  odds: number;
  kellyFraction: number;
  expectedValue: number;
}

export interface BettingPreviewRequest {
  eventId: string;
  marketId: string;
  selectionId: string;
  stake: number;
}

export interface BettingValidationRequest {
  stake: number;
  odds: number;
  kellyFraction: number;
}

export interface BettingPlaceRequest {
  stake: number;
  odds: number;
  kellyFraction: number;
}

export interface MLAnalyticsResult {
  predictions: {
    [key: string]: number;
  };
  confidence: number;
  features: {
    [key: string]: number;
  };
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
}

export interface UnifiedAnalyticsConfig {
  investment: number;
  modelSet: 'ensemble' | 'traditional' | 'deeplearning' | 'timeseries' | 'optimization';
  confidence: number;
  strategy: 'maximum' | 'balanced' | 'conservative' | 'aggressive' | 'arbitrage' | 'ai_adaptive';
  sports: 'all' | 'nba' | 'nfl' | 'mlb' | 'nhl' | 'soccer' | 'wnba' | 'mixed';
  ml?: {
    autoUpdate?: boolean;
    updateInterval?: number;
  };
  performance?: boolean;
  drift?: boolean;
}

export interface UnifiedAnalyticsResult {
  ml: {
    data: MLAnalyticsResult | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
  performance: {
    data: ModelPerformance[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
  drift: {
    data: Record<string, unknown> | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
  error: string | null;
}

export interface Team {
  id: string;
  name: string;
  strength: number;
  form: number;
  stats: TeamStats;
  recentGames: RecentGame[];
}

export interface TeamStats {
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

export interface RecentGame {
  opponent: string;
  result: 'W' | 'L';
  score: {
    team: number;
    opponent: number;
  };
  date: string;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  rating: number;
  stats: PlayerStats;
  recentForm: PlayerForm[];
  injuryStatus: InjuryStatus;
}

export interface PlayerStats {
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

export interface PlayerForm {
  points: number;
  rebounds: number;
  assists: number;
  date: string;
}

export interface InjuryStatus {
  status: 'healthy' | 'questionable' | 'doubtful' | 'out';
  expectedReturn: string | null;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  odds?: {
    home: number;
    away: number;
    draw?: number;
  };
}

export interface Prediction {
  modelId: string;
  prediction: number;
  confidence: number;
  features: Record<string, unknown>;
  timestamp: string;
}

export interface Bet {
  id: string;
  event: Event;
  marketType: string;
  selection: Selection;
  stake: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  timestamp: string;
  sportName: string;
}
