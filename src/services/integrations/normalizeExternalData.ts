// Utility to normalize external API data to Alpha1 internal schema

import type { PlayerProp } from '../../types/core.js';
import type { PropType } from '../../types/common.js';

interface GameState {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: unknown;
  status: string;
  startTime: number | string;
  league: string;
  updated: number;
}

interface SentimentSnapshot {
  id: string;
  entity: string;
  score: number;
  volume: number;
  source: string;
  timestamp: number;
}

export function normalizePlayerProp(raw: unknown): PlayerProp | undefined {
  // Map raw API fields to PlayerProp
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  return {
    id: String(obj.id ?? obj.prop_id),
    player: obj.player ?? obj.athlete,
    type: (typeof obj.market === 'string' ? obj.market : typeof obj.type === 'string' ? obj.type : 'unknown') as PropType,
    line: Number(obj.value),
    odds: Number(obj.odds),
    confidence: typeof obj.confidence === 'number' ? obj.confidence : 1,
    timestamp: typeof obj.timestamp === 'number' ? obj.timestamp : Date.now(),
  } as PlayerProp;
}

export function normalizeGameState(raw: unknown): GameState | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  return {
    id: String(obj.id ?? obj.game_id),
    homeTeam: String(obj.home_team ?? obj.home),
    awayTeam: String(obj.away_team ?? obj.away),
    score: obj.score,
    status: String(obj.status ?? ''),
    startTime: (typeof obj.start_time === 'string' || typeof obj.start_time === 'number')
      ? obj.start_time
      : (typeof obj.startTime === 'string' || typeof obj.startTime === 'number')
        ? obj.startTime
        : Date.now(),
    league: String(obj.league ?? ''),
    updated: typeof obj.updated === 'number' ? obj.updated : Date.now(),
  };
}

export function normalizeSentiment(raw: unknown): SentimentSnapshot | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  return {
    id: String(obj.id ?? ''),
    entity: String(obj.entity ?? ''),
    score: Number(obj.score ?? 0),
    volume: Number(obj.volume ?? 0),
    source: String(obj.source ?? ''),
    timestamp: typeof obj.timestamp === 'number' ? obj.timestamp : Date.now(),
  };
}

// Add more normalization utilities as needed
