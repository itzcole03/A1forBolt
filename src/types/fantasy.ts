// Types for daily fantasy projections
export interface DailyFantasyProjection {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  projection: number;
  statType: string;
  opponent?: string;
  gameDate: string;
  source?: string;
  updatedAt?: string;
}
