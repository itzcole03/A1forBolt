import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { errorLogger } from '../utils/errorLogger';

interface DailyFantasyPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  salary: number;
  projectedPoints: number;
  actualPoints?: number;
  status: 'active' | 'inactive' | 'questionable';
}

interface DailyFantasyContest {
  id: string;
  name: string;
  sport: string;
  startTime: string;
  entryFee: number;
  totalEntries: number;
  maxEntries: number;
  prizePool: number;
  status: 'upcoming' | 'live' | 'completed';
}

interface DailyFantasyLineup {
  id: string;
  contestId: string;
  players: DailyFantasyPlayer[];
  totalSalary: number;
  projectedPoints: number;
  actualPoints?: number;
  rank?: number;
}

class DailyFantasyService {
  private api = axios.create({
    baseURL: API_CONFIG.dailyFantasy.baseUrl,
    headers: {
      Authorization: `Bearer ${API_CONFIG.dailyFantasy.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  async getContests(sport: string): Promise<DailyFantasyContest[]> {
    try {
      const response = await this.api.get(`/contests? sport=${sport}`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getContests' });
      throw error;
    }
  }

  async getPlayers(contestId: string): Promise<DailyFantasyPlayer[]> {
    try {
      const response = await this.api.get(`/contests/${contestId}/players`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getPlayers' });
      throw error;
    }
  }

  async getPlayerProjections(playerId: string): Promise<number> {
    try {
      const response = await this.api.get(`/players/${playerId}/projections`);
      return response.data.projectedPoints;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getPlayerProjections' });
      throw error;
    }
  }

  async getOptimalLineup(contestId: string, strategy: string): Promise<DailyFantasyLineup> {
    try {
      const response = await this.api.post(`/contests/${contestId}/optimal-lineup`, {
        strategy,
      });
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getOptimalLineup' });
      throw error;
    }
  }

  async getContestResults(contestId: string): Promise<DailyFantasyLineup[]> {
    try {
      const response = await this.api.get(`/contests/${contestId}/results`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getContestResults' });
      throw error;
    }
  }

  async getPlayerStats(playerId: string, timeframe: string): Promise<any> {
    try {
      const response = await this.api.get(`/players/${playerId}/stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getPlayerStats' });
      throw error;
    }
  }

  async getContestTrends(contestId: string): Promise<any> {
    try {
      const response = await this.api.get(`/contests/${contestId}/trends`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getContestTrends' });
      throw error;
    }
  }

  async getPlayerOwnership(contestId: string): Promise<Record<string, number>> {
    try {
      const response = await this.api.get(`/contests/${contestId}/ownership`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getPlayerOwnership' });
      throw error;
    }
  }

  async getSalaryChanges(contestId: string): Promise<Record<string, number>> {
    try {
      const response = await this.api.get(`/contests/${contestId}/salary-changes`);
      return response.data;
    } catch (error) {
      errorLogger.logError(error as Error, { context: 'DailyFantasyService.getSalaryChanges' });
      throw error;
    }
  }
}

export const dailyFantasyService = new DailyFantasyService();
