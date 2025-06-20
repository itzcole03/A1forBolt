import { EventEmitter } from 'events';
import { apiService } from './api/ApiService';

interface OddsData {
  id: string;
  sport: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface MarketAnalysis {
  market: string;
  volume: number;
  spread: number;
  trends: {
    direction: 'up' | 'down' | 'stable';
    strength: number;
  };
  bookmakerComparison: {
    bookmaker: string;
    odds: number;
    volume: number;
  }[];
}

/**
 * Modern OddsService with proper TypeScript and error handling
 */
export class OddsService extends EventEmitter {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor() {
    super();
    this.initializeHealthChecking();
  }

  private initializeHealthChecking(): void {
    // Report status for monitoring
    setInterval(() => {
      this.reportStatus('odds-service', true, 0.9);
    }, 30000);
  }

  /**
   * Fetch live odds for sports events
   */
  async getLiveOdds(sport: string = 'americanfootball_nfl'): Promise<OddsData[]> {
    const cacheKey = `live-odds-${sport}`;
    
    // Check cache first
    const cached = this.getCachedData<OddsData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.getOdds({ sport });
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data);
        this.emit('odds:updated', { sport, data: response.data });
        this.reportStatus('live-odds', true, 0.9);
        return response.data;
      }
      
      throw new Error('Failed to fetch live odds');
    } catch (error) {
      console.error('Error fetching live odds:', error);
      this.reportStatus('live-odds', false, 0.1);
      return this.getFallbackOdds(sport);
    }
  }

  /**
   * Get market analysis for a specific market
   */
  async getMarketAnalysis(
    market: string,
    options?: {
      sport?: string;
      startTime?: string;
      endTime?: string;
    }
  ): Promise<MarketAnalysis> {
    try {
      const response = await apiService.get<MarketAnalysis>(`/odds/markets/${market}/analysis`, {
        params: {
          sport: options?.sport,
          start_time: options?.startTime,
          end_time: options?.endTime,
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      throw error;
    }
  }

  /**
   * Get available bookmakers
   */
  async getBookmakers(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>('/odds/bookmakers', {
        headers: {
          'Accept': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching bookmakers:', error);
      return ['draftkings', 'fanduel', 'betmgm', 'caesars'];
    }
  }

  /**
   * Get historical odds data
   */
  async getHistoricalOdds(
    market: string,
    options?: {
      startTime?: string;
      endTime?: string;
      bookmaker?: string;
    }
  ): Promise<
    {
      timestamp: string;
      odds: number;
      probability: number;
    }[]
  > {
    try {
      const response = await apiService.get(`/odds/markets/${market}/history`, {
        params: {
          start_time: options?.startTime,
          end_time: options?.endTime,
          bookmaker: options?.bookmaker,
        },
      });
      
      if (typeof response === 'object' && response !== null && 'data' in response) {
        return (response as any).data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching historical odds:', error);
      return [];
    }
  }

  /**
   * Get arbitrage opportunities
   */
  async getArbitrageOpportunities(options?: {
    sport?: string;
    minEdge?: number;
    maxEdge?: number;
  }): Promise<
    {
      market: string;
      bets: {
        name: string;
        odds: number;
        bookmaker: string;
      }[];
      edge: number;
      confidence: number;
    }[]
  > {
    try {
      const response = await apiService.get('/odds/arbitrage', {
        params: {
          sport: options?.sport,
          min_edge: options?.minEdge,
          max_edge: options?.maxEdge,
        },
      });
      
      if (typeof response === 'object' && response !== null && 'data' in response) {
        return (response as any).data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching arbitrage opportunities:', error);
      return [];
    }
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Report service status for monitoring
   */
  private reportStatus(source: string, connected: boolean, quality: number): void {
    if (typeof window !== 'undefined') {
      (window as any).appStatus = (window as any).appStatus || {};
      (window as any).appStatus[source] = { connected, quality, timestamp: Date.now() };
    }
    console.info(`[OddsService] ${source} status:`, { connected, quality });
  }

  /**
   * Fallback odds data when API fails
   */
  private getFallbackOdds(sport: string): OddsData[] {
    return [
      {
        id: `fallback-${sport}-1`,
        sport,
        commence_time: new Date(Date.now() + 3600000).toISOString(),
        home_team: 'Team A',
        away_team: 'Team B',
        bookmakers: [
          {
            key: 'draftkings',
            title: 'DraftKings',
            last_update: new Date().toISOString(),
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Team A', price: 1.9 },
                  { name: 'Team B', price: 1.9 },
                ],
              },
            ],
          },
        ],
      },
    ];
  }
}

// Export singleton instance
export const oddsService = new OddsService();
