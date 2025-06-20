

export type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'SOCCER';

export type PropType = 'POINTS' | 'REBOUNDS' | 'ASSISTS' | 'THREES' | 'BLOCKS' | 'STEALS' | 'TOUCHDOWNS' | 'YARDS' | 'GOALS';

export enum AlertType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
  MONITOR = 'monitor',
  SYSTEM = 'system'
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EntryStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type LineupType = 'single' | 'parlay';

export type MarketState = 'active' | 'suspended' | 'closed';

export type BetResult = 'WIN' | 'LOSS' | 'PUSH' | 'PENDING';

export type BetType = 'OVER' | 'UNDER';

export interface AlertMetadata {
  sportId?: string;
  gameId?: string;
  playerId?: string;
  teamId?: string;
  impactScore?: number;
  lineMovement?: {
    from: number;
    to: number;
    book: string;
  };
  errorName?: string;
  stack?: string;
} 