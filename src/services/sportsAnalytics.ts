import { notificationService, NotificationData } from './notification.js';
import axios from 'axios';
import { wrapWithRateLimit } from './rateLimit/wrapWithRateLimit.js';
import { API_CONFIG } from '../config/apiConfig.js';

const axiosInstance = axios;

export type Sport = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'soccer';

export interface PlayerStats {
  playerId: string;
  name: string;
  team: string;
  position: string;
  lastGames: {
    date: string;
    stats: Record<string, number>;
  }[];
  seasonAverages: Record<string, number>;
  matchupStats: {
    opponent: string;
    stats: Record<string, number>;
  }[];
  injuryStatus?: string;
  restDays: number;
}

export interface TeamStats {
  teamId: string;
  name: string;
  league: Sport;
  lastGames: {
    date: string;
    opponent: string;
    score: string;
    stats: Record<string, number>;
  }[];
  seasonStats: Record<string, number>;
  homeAwaySplit: {
    home: Record<string, number>;
    away: Record<string, number>;
  };
  pace: number;
  defensiveRating: number;
  offensiveRating: number;
}

export interface PropPrediction {
  propId: string;
  playerId: string;
  propType: string;
  value: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  historicalAccuracy: number;
  recommendedBet: {
    amount: number;
    type: 'over' | 'under';
    modifier?: 'goblin' | 'devil';
    expectedValue: number;
  };
}

export interface Recommendation {
  id: string;
  sport: Sport;
  event: string;
  betType: string;
  odds: number;
  confidence: number;
  edge: number;
  analysis: string;
  risk: 'low' | 'medium' | 'high';
  timestamp: number;
  favorite: boolean;
}


type CacheValue = PlayerStats | TeamStats | PropPrediction | Recommendation[] | null;
type CacheEntry<T> = { data: T; timestamp: number };
type EventMap = {
  playerStats: PlayerStats;
  teamStats: TeamStats;
  propPrediction: PropPrediction;
  recommendations: Recommendation[];
};

export class SportsAnalyticsService {
  private static instance: SportsAnalyticsService;
  private cache: Map<string, CacheEntry<CacheValue>> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
  private subscribers: Map<keyof EventMap, Set<(data: EventMap[keyof EventMap]) => void>> = new Map();

  private constructor() {}

  static getInstance(): SportsAnalyticsService {
    if (!SportsAnalyticsService.instance) {
      SportsAnalyticsService.instance = new SportsAnalyticsService();
    }
    return SportsAnalyticsService.instance;
  }

  /**
   * Fetch player stats from backend API (production-ready)
   */
  getPlayerStats = wrapWithRateLimit(async (sport: Sport, playerId: string): Promise<PlayerStats> => {
    const cacheKey = `player_${sport}_${playerId}`;
    const cached = this.getFromCache<PlayerStats>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axiosInstance.get<PlayerStats>(
        `${API_CONFIG.SPORTS_DATA.BASE_URL}/players/${playerId}/stats`,
        { params: { sport }, headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY } }
      );
      this.setCache<PlayerStats>(cacheKey, res.data);
      return res.data;
    } catch (error) {
      notificationService.notify('error', 'Error fetching player stats', { message: 'Please try again later' } as NotificationData);
      throw error;
    }
  });

  /**
   * Fetch team stats from backend API (production-ready)
   */
  getTeamStats = wrapWithRateLimit(async (sport: Sport, teamId: string): Promise<TeamStats> => {
    const cacheKey = `team_${sport}_${teamId}`;
    const cached = this.getFromCache<TeamStats>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axiosInstance.get<TeamStats>(
        `${API_CONFIG.SPORTS_DATA.BASE_URL}/teams/${teamId}/stats`,
        { params: { sport }, headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY } }
      );
      this.setCache<TeamStats>(cacheKey, res.data);
      return res.data;
    } catch (error) {
      notificationService.notify('error', 'Error fetching team stats', { message: 'Please try again later' } as NotificationData);
      throw error;
    }
  });

  /**
   * Analyze a prop using backend ML/analytics API (production-ready)
   */
  analyzeProp = wrapWithRateLimit(async (sport: Sport, propId: string): Promise<PropPrediction> => {
    const cacheKey = `prop_${sport}_${propId}`;
    const cached = this.getFromCache<PropPrediction>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axiosInstance.get<PropPrediction>(
        `${API_CONFIG.SPORTS_DATA.BASE_URL}/props/${propId}/analyze`,
        { params: { sport }, headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY } }
      );
      this.setCache<PropPrediction>(cacheKey, res.data);
      return res.data;
    } catch (error) {
      notificationService.notify('error', 'Error analyzing prop', { message: 'Please try again later' } as NotificationData);
      throw error;
    }
  });

  /**
   * Get betting recommendations from backend API (production-ready)
   */
  getRecommendations = wrapWithRateLimit(async (sport: Sport): Promise<Recommendation[]> => {
    try {
      const res = await axiosInstance.get<Recommendation[]>(
        `${API_CONFIG.SPORTS_DATA.BASE_URL}/recommendations`,
        { params: { sport }, headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY } }
      );
      return res.data;
    } catch (error) {
      notificationService.notify('error', 'Error fetching recommendations', { message: 'Please try again later' } as NotificationData);
      throw error;
    }
  });


  /**
   * Subscribe to analytics events (playerStats, teamStats, propPrediction, recommendations)
   * @param event Event name
   * @param callback Callback with event data
   */
  subscribe<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    // Type assertion is safe due to event map
    (this.subscribers.get(event) as Set<(data: EventMap[K]) => void>).add(callback);
    return () => {
      (this.subscribers.get(event) as Set<(data: EventMap[K]) => void>)?.delete(callback);
    };
  }


  // (notifySubscribers is kept for future event-driven features)


  /**
   * Get a value from the cache if valid, otherwise null.
   */
  private getFromCache<T extends CacheValue>(key: string): T | null {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  /**
   * Set a value in the cache.
   */
  private setCache<T extends CacheValue>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Sport-specific analysis methods
  async analyzeNBAProp(propId: string): Promise<PropPrediction> {
    return this.analyzeProp('nba', propId);
  }

  async analyzeWNBAProp(propId: string): Promise<PropPrediction> {
    return this.analyzeProp('nba', propId);
  }

  async analyzeMLBProp(propId: string): Promise<PropPrediction> {
    return this.analyzeProp('mlb', propId);
  }

  async analyzeSoccerProp(propId: string): Promise<PropPrediction> {
    return this.analyzeProp('soccer', propId);
  }
}

export const sportsAnalytics = SportsAnalyticsService.getInstance();
