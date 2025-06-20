// Poe App Creator types
export interface PoePropOption {
  line: number;
  type: 'goblin' | 'demon' | 'normal';
  emoji: string;
  percentage: number;
  odds?: string;
  confidence?: string;
}

export interface PoeDetailedProp {
  stat: string;
  projectedValue: number;
  options: PoePropOption[];
}

export interface PoeProp {
  stat: string;
  projectedValue: number;
  currentLine: number;
  type: 'goblin' | 'demon' | 'normal';
  percentage: number;
  emoji: string;
  confidence?: string;
  edge?: string;
  odds?: string;
}

export interface PoeSentiment {
  direction: 'up' | 'down' | 'neutral';
  score: number;
  tooltip?: string;
}

export interface PoePlayer {
  id: string;
  player: string;
  team: string;
  position: string;
  opponent: string;
  sport: string;
  gameTime: string;
  fireCount: string;
  image: string;
  sentiment: PoeSentiment;
  espnNews: string;
  winningProp: {
    stat: string;
    line: number;
    type: string;
    percentage: number;
  };
  currentProgress?: {
    stat: string;
    current: number;
    target: number;
    period: string;
  };
  injury?: string | null;
  marketMovement?: string | null;
  weatherImpact?: string | null;
  teamForm?: PoeTeamForm;
  matchupHistory?: PoeMatchupHistory;
  props: PoeProp[];
  detailedProps: PoeDetailedProp[];
  whyThisBet?: string;
  recentPerformance?: number[];
  vegasConsensus?: number;
  sharpMoney?: string;
  publicBetting?: string;
}

// Local API types
export interface ApiProp {
  playerId: string;
  playerName: string;
  team: string;
  stat: string;
  line: number;
  type: string;
  percentage: number;
  odds?: string;
  confidence?: string;
  emoji?: string;
}

export interface ApiOdds {
  playerId: string;
  stat: string;
  line: number;
  odds: string;
  sportsbook?: string;
}

export interface ApiSentiment {
  direction: 'up' | 'down' | 'neutral';
  score: number;
  tooltip?: string;
}

export interface ApiNews {
  playerId: string;
  headline: string;
  source: string;
  time?: string;
}

export interface MyApiFormat {
  props: ApiProp[];
  odds: ApiOdds[];
  sentiment: { [playerId: string]: ApiSentiment };
  news: ApiNews[];
}
