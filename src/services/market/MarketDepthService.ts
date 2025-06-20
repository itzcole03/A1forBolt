
// MarketDepthService: Aggregates bookmaker consensus, line velocity, and odds for advanced market modeling.
// Integrates with real-time bookmaker APIs.

import { wrapWithRateLimit } from '../rateLimit/wrapWithRateLimit.js';
import { API_CONFIG } from '../../config/apiConfig.js';


export interface MarketDepth {
  eventId: string;
  consensusOdds: number;
  lineVelocity: number;
  bookmakerCount: number;
  oddsSpread: number;
  lastUpdated: number;
}

export interface MarketDepthBatch {
  [eventId: string]: MarketDepth;
}


export class MarketDepthService {
  /**
   * Fetch market depth for a single event from backend/bookmaker API
   */
  getMarketDepth = wrapWithRateLimit(async (eventId: string): Promise<MarketDepth | null> => {
    const url = `${API_CONFIG.ODDS_DATA.BASE_URL}/market-depth/${eventId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.ODDS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch market depth: ${res.statusText}`);
    return (await res.json()) as MarketDepth;
  });

  /**
   * Fetch market depth for multiple events (batch)
   */
  getMarketDepthBatch = wrapWithRateLimit(async (eventIds: string[]): Promise<MarketDepthBatch> => {
    const url = `${API_CONFIG.ODDS_DATA.BASE_URL}/market-depth/batch`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_CONFIG.ODDS_DATA.API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventIds })
    });
    if (!res.ok) throw new Error(`Failed to fetch market depth batch: ${res.statusText}`);
    return (await res.json()) as MarketDepthBatch;
  });

  /**
   * Fetch market depth trends and analytics for an event
   */
  getMarketDepthTrends = wrapWithRateLimit(async (eventId: string): Promise<MarketDepthBatch | null> => {
    const url = `${API_CONFIG.ODDS_DATA.BASE_URL}/market-depth/${eventId}/trends`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.ODDS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch market depth trends: ${res.statusText}`);
    return (await res.json()) as MarketDepthBatch;
  });
}

export const marketDepthService = new MarketDepthService();
