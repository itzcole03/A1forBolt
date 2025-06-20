
// RefereeService: Provides referee stats and advanced modeling for sports events.
// Integrates with external referee APIs for real-time data.

import { wrapWithRateLimit } from '../rateLimit/wrapWithRateLimit.js';
import { API_CONFIG } from '../../config/apiConfig.js';


export interface RefereeStats {
  id: string;
  name: string;
  foulRate: number; // average fouls per game
  techFrequency?: number; // technical fouls per game
  homeBias?: number; // positive means favors home team
  ejectionsPerGame?: number;
}


export class RefereeService {
  /**
   * Fetch referee stats from backend/external API
   */
  getRefereeStats = wrapWithRateLimit(async (refereeId: string): Promise<RefereeStats | null> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/referees/${refereeId}/stats`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch referee stats: ${res.statusText}`);
    return (await res.json()) as RefereeStats;
  });

  /**
   * Batch fetch referee stats by IDs
   */
  getRefereeStatsBatch = wrapWithRateLimit(async (refereeIds: string[]): Promise<RefereeStats[]> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/referees/batch`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refereeIds })
    });
    if (!res.ok) throw new Error(`Failed to fetch referee stats batch: ${res.statusText}`);
    return (await res.json()) as RefereeStats[];
  });

  /**
   * Search referees by name
   */
  searchReferees = wrapWithRateLimit(async (query: string): Promise<RefereeStats[]> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/referees/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to search referees: ${res.statusText}`);
    return (await res.json()) as RefereeStats[];
  });

  /**
   * Fetch advanced modeling/analytics for a referee
   */
  getRefereeModeling = wrapWithRateLimit(async (refereeId: string): Promise<Record<string, unknown>> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/referees/${refereeId}/modeling`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch referee modeling: ${res.statusText}`);
    return (await res.json()) as Record<string, unknown>;
  });
}

export const refereeService = new RefereeService();
