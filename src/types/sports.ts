export interface Event {
  id: string;
  name: string;
  sport: string;
  league: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished' | 'cancelled';
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  metadata: {
    weather?: Weather;
    attendance?: number;
    broadcasters?: string[];
    officials?: Official[];
  };
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
  stats?: TeamStats;
}

export interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: number;
  lastFive: Array<'W' | 'L' | 'D'>;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
  surface?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Weather {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  precipitation: number;
}

export interface Official {
  id: string;
  name: string;
  role: string;
}

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  status: 'open' | 'closed' | 'suspended';
  selections: Selection[];
  metadata?: {
    total?: number;
    handicap?: number;
    period?: string;
  };
}

export type MarketType =
  | 'match_winner'
  | 'over_under'
  | 'handicap'
  | 'both_teams_to_score'
  | 'correct_score'
  | 'first_team_to_score'
  | 'half_time_result'
  | 'double_chance'
  | 'draw_no_bet';

export interface Selection {
  id: string;
  name: string;
  odds: Odds;
  status: 'active' | 'suspended' | 'settled';
  result?: 'won' | 'lost' | 'void';
  metadata?: {
    score?: number;
    handicap?: number;
    total?: number;
  };
}

export interface Odds {
  value: number;
  type: 'decimal' | 'fractional' | 'american';
  timestamp: string;
  provider: string;
  movement?: {
    previous: number;
    change: number;
    direction: 'up' | 'down' | 'unchanged';
  };
}

export interface LiveData {
  eventId: string;
  timestamp: string;
  score: {
    home: number;
    away: number;
  };
  stats: {
    possession: {
      home: number;
      away: number;
    };
    shots: {
      home: number;
      away: number;
    };
    shotsOnTarget: {
      home: number;
      away: number;
    };
    corners: {
      home: number;
      away: number;
    };
    fouls: {
      home: number;
      away: number;
    };
    yellowCards: {
      home: number;
      away: number;
    };
    redCards: {
      home: number;
      away: number;
    };
  };
  events: Array<{
    type: string;
    time: number;
    team: 'home' | 'away';
    player?: string;
    description: string;
  }>;
}
