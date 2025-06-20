import axios, { AxiosInstance } from 'axios';
import { EventBus } from '../unified/EventBus.js';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';

export interface SportradarPlayerStats {
  [stat: string]: number;
}

export interface SportradarTeamStats {
  [stat: string]: number;
}

export interface SportradarInjury {
  id: string;
  playerId: string;
  teamId: string;
  description: string;
  status: string;
}

export interface SportradarMatchupData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
}

export class SportradarService {
  private static instance: SportradarService;
  private readonly config: {
    apiKey: string;
    baseUrl: string;
    timeout: number;
    cacheDuration: number;
  };
  private readonly client: AxiosInstance;
  private readonly eventBus: EventBus;

  private constructor() {
    const configManager = UnifiedConfig.getInstance();
    this.config = configManager.get('sportradar');
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: { 'X-API-Key': this.config.apiKey },
    });
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): SportradarService {
    if (!SportradarService.instance) {
      SportradarService.instance = new SportradarService();
    }
    return SportradarService.instance;
  }

  async getPlayerStats(playerId: string, options?: { season?: string; league?: string }): Promise<SportradarPlayerStats> {
    const response = await this.client.get<SportradarPlayerStats>(`/players/${playerId}/stats`, { params: options });
    return response.data;
  }

  async getTeamStats(teamId: string, options?: { season?: string; league?: string }): Promise<SportradarTeamStats> {
    const response = await this.client.get<SportradarTeamStats>(`/teams/${teamId}/stats`, { params: options });
    return response.data;
  }

  async getGameSchedule(options?: { startDate?: string; endDate?: string; league?: string }): Promise<SportradarMatchupData[]> {
    const response = await this.client.get<SportradarMatchupData[]>('/schedule', { params: options });
    return response.data;
  }

  async getInjuries(options?: { team?: string; league?: string }): Promise<SportradarInjury[]> {
    const response = await this.client.get<SportradarInjury[]>('/injuries', { params: options });
    const injuries = response.data;
    this.eventBus.emit('injury:update', {
      injuries,
      timestamp: Date.now(),
    });
    return injuries;
  }

  async getMatchup(matchupId: string): Promise<SportradarMatchupData> {
    const response = await this.client.get<SportradarMatchupData>(`/matchups/${matchupId}`);
    const match = response.data;
    this.eventBus.emit('match:update', {
      match,
      timestamp: Date.now(),
    });
    return match;
  }

  /**
   * Extracts and returns normalized features for ensemble prediction.
   * @param context - { playerId, teamId, matchupId }
   * @returns Normalized feature object
   */
  async getFeatures(context: { playerId?: string; teamId?: string; matchupId?: string }): Promise<Record<string, number | string>> {
    const features: Record<string, number | string> = {};
    if (context.playerId) {
      const stats = await this.getPlayerStats(context.playerId);
      for (const [k, v] of Object.entries(stats)) {
        features[`playerStat_${k}`] = v;
      }
    }
    if (context.teamId) {
      const stats = await this.getTeamStats(context.teamId);
      for (const [k, v] of Object.entries(stats)) {
        features[`teamStat_${k}`] = v;
      }
    }
    if (context.matchupId) {
      const matchup = await this.getMatchup(context.matchupId);
      features.matchupId = matchup.id;
      features.homeTeam = matchup.homeTeam;
      features.awayTeam = matchup.awayTeam;
      features.date = matchup.date;
    }
    return features;
  }
}

export const sportradarService = SportradarService.getInstance();
