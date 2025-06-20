import { apiService } from "./api";

interface DailyFantasyConfig {
  baseUrl: string;
  apiKey: string;
}

interface Contest {
  id: string;
  name: string;
  entryFee: number;
  totalEntries: number;
  maxEntries: number;
  prizePool: number;
  startTime: string;
  sport: string;
  slate: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  salary: number;
  projectedPoints: number;
  actualPoints?: number;
  status: "active" | "questionable" | "out";
  stats: {
    [key: string]: number;
  };
}

interface Lineup {
  id: string;
  contestId: string;
  players: Player[];
  totalSalary: number;
  projectedPoints: number;
  actualPoints?: number;
  rank?: number;
  winnings?: number;
}

class DailyFantasyService {
  private config: DailyFantasyConfig;

  constructor() {
    this.config = {
      baseUrl:
        import.meta.env.VITE_DAILY_FANTASY_API_URL ||
        "https://api.dailyfantasy.com/v1",
      apiKey:
        import.meta.env.VITE_DAILY_FANTASY_API_KEY ||
        "f3ac5a9c-cf01-4dc8-8edb-c02bf6c31a4d",
    };
  }

  async getContests(options?: {
    sport?: string;
    slate?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<Contest[]> {
    try {
      const response = await apiService.get("/daily-fantasy/contests", {
        params: options,
        headers: {
          "X-API-Key": this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get contests:", error);
      throw error;
    }
  }

  async getPlayers(options?: {
    sport?: string;
    slate?: string;
    position?: string;
    team?: string;
  }): Promise<Player[]> {
    try {
      const response = await apiService.get("/daily-fantasy/players", {
        params: options,
        headers: {
          "X-API-Key": this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get players:", error);
      throw error;
    }
  }

  async getPlayerStats(
    playerId: string,
    options?: {
      startTime?: string;
      endTime?: string;
    },
  ): Promise<Player["stats"]> {
    try {
      const response = await apiService.get(
        `/daily-fantasy/players/${playerId}/stats`,
        {
          params: options,
          headers: {
            "X-API-Key": this.config.apiKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get player stats:", error);
      throw error;
    }
  }

  async getLineups(options?: {
    contestId?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<Lineup[]> {
    try {
      const response = await apiService.get("/daily-fantasy/lineups", {
        params: options,
        headers: {
          "X-API-Key": this.config.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get lineups:", error);
      throw error;
    }
  }

  async createLineup(contestId: string, players: Player[]): Promise<Lineup> {
    try {
      const response = await apiService.post(
        "/daily-fantasy/lineups",
        {
          contestId,
          players,
        },
        {
          headers: {
            "X-API-Key": this.config.apiKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create lineup:", error);
      throw error;
    }
  }

  async getContestResults(contestId: string): Promise<{
    lineups: Lineup[];
    prizes: {
      rank: number;
      amount: number;
    }[];
  }> {
    try {
      const response = await apiService.get(
        `/daily-fantasy/contests/${contestId}/results`,
        {
          headers: {
            "X-API-Key": this.config.apiKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get contest results:", error);
      throw error;
    }
  }

  async getOptimalLineup(
    contestId: string,
    constraints?: {
      minSalary?: number;
      maxSalary?: number;
      minProjectedPoints?: number;
      maxPlayersPerTeam?: number;
      requiredPositions?: { [key: string]: number };
    },
  ): Promise<Lineup> {
    try {
      const response = await apiService.post(
        `/daily-fantasy/contests/${contestId}/optimal-lineup`,
        {
          constraints,
        },
        {
          headers: {
            "X-API-Key": this.config.apiKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get optimal lineup:", error);
      throw error;
    }
  }
}

export const dailyFantasyService = new DailyFantasyService();
