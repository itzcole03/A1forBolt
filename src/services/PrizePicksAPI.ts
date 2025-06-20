import axios, { AxiosInstance } from "axios";
import { Sport, PropType } from "../types/common";
import { UnifiedConfigManager } from "../core/UnifiedConfigManager";
// import { UnifiedErrorHandler } from "../unified/UnifiedError"; // File does not exist, use UnifiedErrorService if needed

interface PrizePicksResponse<T> {
  data: T;
  meta: {
    timestamp: number;
    status: number;
  };
}

interface Projection {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  opponent: string;
  sport: Sport;
  league: string;
  propType: PropType;
  line: number;
  overOdds: number;
  underOdds: number;
  timestamp: number;
  gameTime: string;
  status: "active" | "suspended" | "settled";
  result?: number;
}

interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  sport: Sport;
  stats: Record<string, number>;
}

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: Sport;
  league: string;
  startTime: string;
  status: "scheduled" | "live" | "final";
  score?: {
    home: number;
    away: number;
  };
}

export class PrizePicksAPI {
  private static instance: PrizePicksAPI;
  private readonly api: AxiosInstance;
  private readonly config: UnifiedConfigManager;
  private lastErrorLog: number = 0;

  private constructor() {
    this.config = UnifiedConfigManager.getInstance();

    this.api = axios.create({
      baseURL:
        import.meta.env.VITE_PRIZEPICKS_API_URL ||
        "https://api.prizepicks.com/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_PRIZEPICKS_API_KEY}`,
      },
    });

    // Add request interceptor for rate limiting
    this.api.interceptors.request.use(async (config) => {
      await this.rateLimiter();
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleApiError(error);
        throw error;
      },
    );
  }

  public static getInstance(): PrizePicksAPI {
    if (!PrizePicksAPI.instance) {
      PrizePicksAPI.instance = new PrizePicksAPI();
    }
    return PrizePicksAPI.instance;
  }

  public async getProjections(params: {
    sport?: Sport;
    propType?: PropType;
    playerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Projection[]> {
    try {
      // In development mode, return mock data to prevent API spam
      if (
        import.meta.env.DEV ||
        import.meta.env.VITE_USE_MOCK_DATA === "true"
      ) {
        console.log("Using mock PrizePicks data in development mode");
        return this.getMockProjections(params);
      }

      const response = await this.api.get<PrizePicksResponse<Projection[]>>(
        "/projections",
        {
          params,
        },
      );
      return response.data.data;
    } catch (error) {
      console.warn(
        "PrizePicks API unavailable, using mock data:",
        error.message,
      );
      return this.getMockProjections(params);
    }
  }

  private getMockProjections(params: any): Projection[] {
    // Return mock data for development
    return [
      {
        id: "mock-1",
        player: {
          id: "player-1",
          name: "LeBron James",
          team: "LAL",
          position: "SF",
          sport: "NBA" as Sport,
          stats: { points: 25.2, rebounds: 7.8, assists: 7.2 },
        },
        propType: "points" as PropType,
        line: 25.5,
        game: {
          id: "game-1",
          homeTeam: "LAL",
          awayTeam: "GSW",
          sport: "NBA" as Sport,
          league: "NBA",
          startTime: new Date(Date.now() + 3600000).toISOString(),
          status: "scheduled" as const,
        },
        multiplier: 2.5,
        probability: 0.55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mock-2",
        player: {
          id: "player-2",
          name: "Stephen Curry",
          team: "GSW",
          position: "PG",
          sport: "NBA" as Sport,
          stats: { points: 29.8, rebounds: 5.1, assists: 6.3 },
        },
        propType: "threes" as PropType,
        line: 4.5,
        game: {
          id: "game-1",
          homeTeam: "LAL",
          awayTeam: "GSW",
          sport: "NBA" as Sport,
          league: "NBA",
          startTime: new Date(Date.now() + 3600000).toISOString(),
          status: "scheduled" as const,
        },
        multiplier: 3.2,
        probability: 0.62,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
      .filter((projection) => {
        if (params.sport && projection.player.sport !== params.sport)
          return false;
        if (params.propType && projection.propType !== params.propType)
          return false;
        if (params.playerId && projection.player.id !== params.playerId)
          return false;
        return true;
      })
      .slice(0, params.limit || 10);
  }

  public async getPlayer(playerId: string): Promise<Player> {
    try {
      if (
        import.meta.env.DEV ||
        import.meta.env.VITE_USE_MOCK_DATA === "true"
      ) {
        return this.getMockPlayer(playerId);
      }
      const response = await this.api.get<PrizePicksResponse<Player>>(
        `/players/${playerId}`,
      );
      return response.data.data;
    } catch (error) {
      console.warn("PrizePicks API unavailable, using mock player data");
      return this.getMockPlayer(playerId);
    }
  }

  public async getGame(gameId: string): Promise<Game> {
    try {
      if (
        import.meta.env.DEV ||
        import.meta.env.VITE_USE_MOCK_DATA === "true"
      ) {
        return this.getMockGame(gameId);
      }
      const response = await this.api.get<PrizePicksResponse<Game>>(
        `/games/${gameId}`,
      );
      return response.data.data;
    } catch (error) {
      console.warn("PrizePicks API unavailable, using mock game data");
      return this.getMockGame(gameId);
    }
  }

  private getMockPlayer(playerId: string): Player {
    return {
      id: playerId,
      name: "Mock Player",
      team: "MOCK",
      position: "PG",
      sport: "NBA" as Sport,
      stats: { points: 20.5, rebounds: 5.2, assists: 4.8 },
    };
  }

  private getMockGame(gameId: string): Game {
    return {
      id: gameId,
      homeTeam: "MOCK1",
      awayTeam: "MOCK2",
      sport: "NBA" as Sport,
      league: "NBA",
      startTime: new Date(Date.now() + 3600000).toISOString(),
      status: "scheduled" as const,
    };
  }

  public async getPlayerProjections(playerId: string): Promise<Projection[]> {
    const response = await this.api.get<PrizePicksResponse<Projection[]>>(
      "/projections",
      {
        params: { playerId },
      },
    );
    return response.data.data;
  }

  public async getPlayerHistory(
    playerId: string,
    params: {
      startDate?: string;
      endDate?: string;
      propType?: PropType;
      limit?: number;
    },
  ): Promise<Projection[]> {
    const response = await this.api.get<PrizePicksResponse<Projection[]>>(
      `/players/${playerId}/history`,
      {
        params,
      },
    );
    return response.data.data;
  }

  public async getTeamProjections(
    team: string,
    sport: Sport,
  ): Promise<Projection[]> {
    const response = await this.api.get<PrizePicksResponse<Projection[]>>(
      "/projections",
      {
        params: { team, sport },
      },
    );
    return response.data.data;
  }

  private async rateLimiter(): Promise<void> {
    // Implement rate limiting logic here
    // This is a placeholder - you would typically use a proper rate limiting library
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private handleApiError(error: any): void {
    // Reduce console spam in development by limiting error logging
    if (import.meta.env.DEV) {
      // Only log once every 10 seconds to prevent spam
      const now = Date.now();
      if (!this.lastErrorLog || now - this.lastErrorLog > 10000) {
        this.lastErrorLog = now;
        if (error.response) {
          console.warn(
            `PrizePicks API Error: ${error.response.status} - Using mock data instead`,
          );
        } else if (error.request) {
          console.warn(
            "PrizePicks API Error: No response from server - Using mock data instead",
          );
        } else {
          console.warn(
            `PrizePicks API Error: ${error.message} - Using mock data instead`,
          );
        }
      }
    } else {
      // In production, log normally
      if (error.response) {
        console.error(
          `PrizePicks API Error: ${error.response.status} - ${error.response.data.message}`,
        );
      } else if (error.request) {
        console.error("PrizePicks API Error: No response received from server");
      } else {
        console.error(`PrizePicks API Error: ${error.message}`);
      }
    }
  }
}
