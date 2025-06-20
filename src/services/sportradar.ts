import { apiService } from './api';

interface SportradarConfig {
  baseUrl: string;
  apiKey: string;
}

interface PlayerStats {
  id: string;
  name: string;
  team: string;
  position: string;
  stats: {
    [key: string]: number;
  };
  lastUpdated: string;
}

interface InjuryData {
  id: string;
  name: string;
  team: string;
  position: string;
  status: 'active' | 'questionable' | 'out';
  injury: string;
  expectedReturn?: string;
  lastUpdated: string;
}

interface MatchupData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
  };
  odds?: {
    home: number;
    away: number;
    draw?: number;
  };
  stats?: {
    home: {
      [key: string]: number;
    };
    away: {
      [key: string]: number;
    };
  };
}

class SportradarService {
  private config: SportradarConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.REACT_APP_SPORTRADAR_API_URL || 'https://api.sportradar.com/v1',
      apiKey:
        process.env.REACT_APP_SPORTRADAR_API_KEY || 'zi7atwynSXOAyizHo1L3fR5Yv8mfBX12LccJbCHb',
    };
  }

  async getPlayerStats(
    playerId: string,
    options?: {
      season?: string;
      league?: string;
    }
  ): Promise<PlayerStats> {
    try {
      const response = await apiService.get(`/sportradar/players/${playerId}/stats`, {
        params: options,
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get player stats:', error);
      throw error;
    }
  }

  async getInjuries(options?: { team?: string; league?: string }): Promise<InjuryData[]> {
    try {
      const response = await apiService.get('/sportradar/injuries', {
        params: options,
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get injuries:', error);
      throw error;
    }
  }

  async getMatchup(matchupId: string): Promise<MatchupData> {
    try {
      const response = await apiService.get(`/sportradar/matchups/${matchupId}`, {
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get matchup:', error);
      throw error;
    }
  }

  async getTeamStats(
    teamId: string,
    options?: {
      season?: string;
      league?: string;
    }
  ): Promise<{
    [key: string]: number;
  }> {
    try {
      const response = await apiService.get(`/sportradar/teams/${teamId}/stats`, {
        params: options,
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get team stats:', error);
      throw error;
    }
  }

  async getGameSchedule(options?: {
    startDate?: string;
    endDate?: string;
    league?: string;
  }): Promise<MatchupData[]> {
    try {
      const response = await apiService.get('/sportradar/schedule', {
        params: options,
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get game schedule:', error);
      throw error;
    }
  }
}

export const sportradarService = new SportradarService();
