
// BetTrackingService: Tracks user bets, ROI, streaks, and analytics.
// Integrates with backend persistent storage and analytics APIs.

// Use dynamic import for axios to ensure ESM compatibility
import { wrapWithRateLimit } from '../rateLimit/wrapWithRateLimit.js';
import { API_CONFIG } from '../../config/apiConfig.js';



export interface BetRecord {
  id: string;
  userId: string;
  eventId: string;
  betType: string;
  amount: number;
  odds: number;
  result: 'win' | 'loss' | 'pending';
  placedAt: number;
  settledAt?: number;
  notes?: string;
}

export interface BetAnalytics {
  roi: number;
  winRate: number;
  lossRate: number;
  streak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  totalBets: number;
  totalAmount: number;
  profit: number;
}


export class BetTrackingService {
  /**
   * Fetch all bets for a user from backend persistent storage
   */
  getUserBets = wrapWithRateLimit(async (userId: string): Promise<BetRecord[]> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}/bets`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch user bets: ${res.statusText}`);
    return (await res.json()) as BetRecord[];
  });

  /**
   * Fetch analytics (ROI, streak, win/loss, etc.) for a user
   */
  getUserBetAnalytics = wrapWithRateLimit(async (userId: string): Promise<BetAnalytics> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}/bet-analytics`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch user bet analytics: ${res.statusText}`);
    return (await res.json()) as BetAnalytics;
  });
}

export const betTrackingService = new BetTrackingService();
