export interface User {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  defaultSport: Sport;
  riskLevel: 'low' | 'medium' | 'high';
}

export type Sport = 'NBA' | 'WNBA' | 'MLB' | 'NHL' | 'SOCCER';

export interface Player {
  id: string;
  name: string;
  team: string;
  sport: Sport;
  stats: PlayerStats;
  status: PlayerStatus;
}

export interface PlayerStats {
  gamesPlayed: number;
  averagePoints?: number;
  averageRebounds?: number;
  averageAssists?: number;
  averageGoals?: number;
  averageSaves?: number;
  [key: string]: number | undefined;
}

export interface PlayerStatus {
  isActive: boolean;
  injuryStatus?: 'OUT' | 'QUESTIONABLE' | 'PROBABLE';
  lastUpdated: string;
}

export interface BettingLine {
  id: string;
  playerId: string;
  sport: Sport;
  type: 'OVER' | 'UNDER';
  value: number;
  odds: number;
  confidence: number;
  lastUpdated: string;
}

export interface Lineup {
  id: string;
  legs: LineupLeg[];
  totalOdds: number;
  potentialPayout: number;
  confidence: number;
  createdAt: string;
}

export interface LineupLeg {
  playerId: string;
  lineId: string;
  type: 'OVER' | 'UNDER';
  value: number;
  odds: number;
}

export interface Prediction {
  id: string;
  playerId: string;
  sport: Sport;
  predictedValue: number;
  confidence: number;
  factors: PredictionFactor[];
  timestamp: string;
}

export interface PredictionFactor {
  name: string;
  weight: number;
  value: number;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  sport?: Sport;
  dateRange?: {
    start: string;
    end: string;
  };
  minConfidence?: number;
  maxOdds?: number;
}

export type ApiRequestParams = PaginationParams & FilterParams;
