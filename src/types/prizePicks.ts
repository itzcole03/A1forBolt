export interface PrizePicksEntry {
  id: string;
  user_id: string;
  status: 'pending' | 'won' | 'lost' | string;
  stake: number;
  payout: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // allow extension for future compatibility, type-safe
}

export interface PrizePicksPlayer {
  id: string;
  name: string;
  team: string;
  position?: string;
  league?: string;
  image_url?: string;
}

export interface PrizePicksProjection {
  id: string;
  playerId: string;
  player?: PrizePicksPlayer;
  statType: string;
  line: number;
  description?: string;
  gameId?: string;
  startTime?: string;
  opponent?: string;
  // Add additional fields as needed from shared/prizePicks.ts
  [key: string]: unknown;
}

export interface PrizePicksLeague {
  id: string;
  name: string;
  sport: string;
}

// Overall structure of data you might get from a PrizePicks API endpoint
export interface PrizePicksData {
  projections: PrizePicksProjection[];
  players?: PrizePicksPlayer[];
  leagues?: PrizePicksLeague[];
  lastUpdated: string;
}

export interface PropOption {
  line: number;
  type: 'goblin' | 'normal' | 'demon';
  icon: string;
  percentage: number;
  multiplier: number;
}

// --- Compatibility aliases for legacy imports ---
export type PrizePicksProps = PrizePicksProjection;
export type PrizePicksLines = PrizePicksProjection[];

export interface ProcessedPrizePicksProp {
  player_name: string;
  team_abbreviation: string;
  position: string;
  opponent_team: string;
  sport: string;
  game_time: string;
  pick_count: string;
  stat_type: string;
  line_value: number;
  projected_value: number;
  confidence_percentage: number;
  player_image_url: string;
  goblin_icon_url: string;
  demon_icon_url: string;
  normal_icon_url: string;
  detailedProps: DetailedProp[];
  winningProp: PropOption;
}

export interface PropCardStyles {
  backgroundColor: string;
  borderColor: string;
  glowIntensity: number;
}

export interface FilterOptions {
  type: 'all' | 'high-confidence' | 'trending' | 'goblins' | 'demons' | 'value-bets';
  threshold: number;
}

export const PRIZEPICKS_CONFIG = {
  UPDATE_INTERVAL: 60000, // 60 seconds
  BATCH_SIZE: 50,
  MAX_RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 300000, // 5 minutes
  GOBLIN_CONFIDENCE_THRESHOLD: 0.65,
  DEMON_RISK_THRESHOLD: 0.4,
  VALUE_BET_THRESHOLD: 3,
  HIGH_CONFIDENCE_THRESHOLD: 0.7,
  TRENDING_THRESHOLD: 100, // Minimum pick count to be considered trending
  PROCESSING_CHUNK_SIZE: 20,
  FILTER_DEBOUNCE_MS: 300,
} as const;

export interface Prop {
  id: string;
  playerId: string;
  gameId: string;
  sport: string;
  type: string;
  line: number;
  confidence: number;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  sport: string;
  position: string;
  status: 'active' | 'inactive' | 'injured';
  stats: Record<string, number>;
}

export interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  status: 'scheduled' | 'live' | 'final';
  score?: {
    home: number;
    away: number;
  };
}

export interface Lineup {
  id: string;
  props: Prop[];
  multiplier: number;
  confidence: number;
  expectedValue: number;
  timestamp: number;
}
