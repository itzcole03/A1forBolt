import { DataSource } from '../unified/DataSource.js';
import { EventBus } from '../unified/EventBus.js'; // TODO: ensure correct implementation after QA
import { PerformanceMonitor } from '../unified/PerformanceMonitor.js'; // TODO: ensure correct implementation after QA

interface DailyFantasyConfig {
  apiKey: string;
  baseUrl: string;
  cacheTimeout: number;
}

export interface DailyFantasyData {
  projections: {
    name: string;
    team: string;
    position: string;
    opp_team: string;
    game_date: string;
    is_home: boolean;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    three_pt: number;
    min: number;
  }[];
}

export class DailyFantasyAdapter implements DataSource<DailyFantasyData> {
  /**
   * Fetches real daily fantasy projections from the configured API.
   * @returns DailyFantasyData with projections array.
   */
  public async fetchData(): Promise<DailyFantasyData> {
    try {
      const response = await fetch(`${this.config.baseUrl}/nba/projections`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch projections');
      const data = await response.json();
      return { projections: data.projections };
    } catch (error) {
      // Optionally log error or send to PerformanceMonitor
      return { projections: [] };
    }
  }

  public readonly id = 'daily-fantasy';
  public readonly type = 'sports-projections';

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly config: DailyFantasyConfig;
  private cache: {
    data: DailyFantasyData | null;
    timestamp: number;
  };

  constructor(config: DailyFantasyConfig) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.config = config;
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.config.apiKey);
  }

  public async fetch(): Promise<DailyFantasyData> {
    const traceId = this.performanceMonitor.startTrace('daily-fantasy-fetch', {
      source: this.id,
      type: this.type,
    });

    try {
      // Check cache first
      if (this.isCacheValid()) {
        return this.cache.data!;
      }

      const spanId = this.performanceMonitor.startSpan(traceId, 'api-request', {
        url: `${this.config.baseUrl}/nba/projections`,
      });

      const response = await fetch(`${this.config.baseUrl}/nba/projections`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as DailyFantasyData;
      this.performanceMonitor.endSpan(spanId);

      // Update cache
      this.cache = {
        data,
        timestamp: Date.now(),
      };

      // Publish event
      await this.eventBus.publish({
        type: 'daily-fantasy:data-updated',
        payload: {
          timestamp: Date.now(),
          projectionCount: data.projections.length,
        },
      });

      this.performanceMonitor.endTrace(traceId);
      return data;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private isCacheValid(): boolean {
    if (!this.cache.data) return false;

    const age = Date.now() - this.cache.timestamp;
    return age < this.config.cacheTimeout;
  }

  public clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async getData(): Promise<DailyFantasyData> {
    return this.cache.data as DailyFantasyData;
  }
  public isConnected(): boolean {
    return true;
  }
  public getMetadata(): Record<string, unknown> {
    return { id: this.id, type: this.type };
  }
}

// TODO: Update EventMap in ../types/core.js to include 'daily-fantasy:data-updated' and 'social-sentiment-updated' event types for type safety.
