import { DataSource } from "../unified/DataSource.js";
import { EventBus } from "../unified/EventBus.js";
import { PerformanceMonitor } from "../unified/PerformanceMonitor.js";

export interface OddsProvider {
  getOdds(eventId: string): Promise<unknown>;
}

interface SportsRadarConfig {
  apiKey: string;
  baseUrl: string;
  cacheTimeout: number;
}

export interface SportsRadarData {
  games: {
    id: string;
    status: string;
    scheduled: string;
    home: {
      name: string;
      alias: string;
      statistics: Record<string, number>;
    };
    away: {
      name: string;
      alias: string;
      statistics: Record<string, number>;
    };
    players: Array<{
      id: string;
      name: string;
      team: string;
      position: string;
      statistics: Record<string, number>;
      injuries: Array<{
        type: string;
        status: string;
        startDate: string;
      }>;
    }>;
  }[];
}

export class SportsRadarAdapter
  implements DataSource<SportsRadarData>, OddsProvider
{
  public readonly id = "sports-radar";
  public readonly type = "sports-data";

  public async fetchData(): Promise<SportsRadarData> {
    return this.fetch();
  }

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly config: SportsRadarConfig;
  private cache: {
    data: SportsRadarData | null;
    timestamp: number;
  };
  private apiKey: string | null;
  private baseUrl: string;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.config = {
      apiKey: import.meta.env.VITE_SPORTRADAR_API_KEY || "",
      baseUrl: "https://api.sportradar.com/sports/v1",
      cacheTimeout: 10000, // Assuming a default cache timeout
    };
    this.cache = {
      data: null,
      timestamp: 0,
    };
    this.apiKey = import.meta.env.VITE_SPORTRADAR_API_KEY || null;
    this.baseUrl = "https://api.sportradar.com/sports/v1";
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/status?api_key=${this.config.apiKey}`,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetches the latest SportsRadar data, using cache if valid.
   */
  public async fetch(): Promise<SportsRadarData> {
    const traceId = this.performanceMonitor.startTrace("sports-radar-fetch");

    try {
      if (this.isCacheValid()) {
        return this.cache.data!;
      }

      const data = await this.fetchSportsRadarData();

      this.cache = {
        data,
        timestamp: Date.now(),
      };

      this.eventBus.publish({
        type: "sports-radar-updated",
        payload: { data },
      });

      this.performanceMonitor.endTrace(traceId);
      return data;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async fetchSportsRadarData(): Promise<SportsRadarData> {
    const response = await fetch(
      `${this.config.baseUrl}/games/schedule?api_key=${this.config.apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`SportsRadar API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private isCacheValid(): boolean {
    return (
      this.cache.data !== null &&
      Date.now() - this.cache.timestamp < this.config.cacheTimeout
    );
  }

  public clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async getData(): Promise<SportsRadarData> {
    return this.cache.data as SportsRadarData;
  }
  public isConnected(): boolean {
    return true;
  }
  public getMetadata(): Record<string, unknown> {
    return { id: this.id, type: this.type };
  }

  async getOdds(eventId: string): Promise<unknown> {
    if (!this.apiKey) {
      console.warn("SportsRadar API key not configured. Skipping odds fetch.");
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/odds`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`SportsRadar API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching odds from SportsRadar:", error);
      return null;
    }
  }

  async getEventDetails(eventId: string): Promise<unknown> {
    if (!this.apiKey) {
      console.warn(
        "SportsRadar API key not configured. Skipping event details fetch.",
      );
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`SportsRadar API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching event details from SportsRadar:", error);
      return null;
    }
  }
}
