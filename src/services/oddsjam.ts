import { apiService } from './api';

interface OddsJamConfig {
  apiKey: string;
  baseUrl: string;
}

interface OddsData {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  markets: {
    marketId: string;
    name: string;
    books: {
      bookId: string;
      name: string;
      odds: {
        over: number;
        under: number;
        spread?: number;
        moneyline?: number;
      };
      lastUpdated: string;
    }[];
  }[];
}

interface MarketAnalysis {
  marketId: string;
  name: string;
  bestOdds: {
    over: {
      book: string;
      odds: number;
      edge: number;
    };
    under: {
      book: string;
      odds: number;
      edge: number;
    };
  };
  movement: {
    over: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
    under: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
  };
  volume: {
    over: number;
    under: number;
  };
}

class OddsJamService {
  private config: OddsJamConfig;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_ODDSJAM_API_KEY || '',
      baseUrl: process.env.REACT_APP_ODDSJAM_API_URL || 'https://api.oddsjam.com',
    };
  }

  async getOdds(sport: string, date?: string): Promise<OddsData[]> {
    try {
      const params: any = { apiKey: this.config.apiKey };
      if (date) params.date = date;

      const response = await apiService.get<OddsData[]>(`/oddsjam/${sport}/odds`, params);
      return response;
    } catch (error) {
      console.error('Failed to fetch odds:', error);
      throw error;
    }
  }

  async getMarketAnalysis(marketId: string): Promise<MarketAnalysis> {
    try {
      const response = await apiService.get<MarketAnalysis>(
        `/oddsjam/markets/${marketId}/analysis`,
        { apiKey: this.config.apiKey }
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch market analysis:', error);
      throw error;
    }
  }

  async getBookmakers(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>('/oddsjam/bookmakers', {
        apiKey: this.config.apiKey,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch bookmakers:', error);
      throw error;
    }
  }

  async getHistoricalOdds(marketId: string, days: number): Promise<any> {
    try {
      const response = await apiService.get(`/oddsjam/markets/${marketId}/history`, {
        apiKey: this.config.apiKey,
        days,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch historical odds:', error);
      throw error;
    }
  }

  async getArbitrageOpportunities(sport: string): Promise<any[]> {
    try {
      const response = await apiService.get(`/oddsjam/${sport}/arbitrage`, {
        apiKey: this.config.apiKey,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch arbitrage opportunities:', error);
      throw error;
    }
  }
}

export const oddsjamService = new OddsJamService();
