import { DataSource } from '../core/DataSource.js';
import { EventBus } from '../core/EventBus.js';
import { PerformanceMonitor } from '../core/PerformanceMonitor.js';



interface TheOddsConfig {
  apiKey: string;
  baseUrl: string;
  cacheTimeout: number;
}

export interface TheOddsData {
  events: {
    id: string;
    sport: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: Array<{
      key: string;
      title: string;
      markets: Array<{
        key: string;
        outcomes: Array<{
          name: string;
          price: number;
          point?: number;
        }>;
      }>;
    }>;
  }[];
}

export class TheOddsAdapter implements DataSource<TheOddsData> {
  public readonly id = 'the-odds';
  public readonly type = 'betting-odds';

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly config: TheOddsConfig;
  private cache: {
    data: TheOddsData | null;
    timestamp: number;
  };

  constructor(config: TheOddsConfig) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.config = config;
    this.cache = {
      data: null,
      timestamp: 0
    };
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/sports?apiKey=${this.config.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  public async fetch(): Promise<TheOddsData> {
    const traceId = this.performanceMonitor.startTrace('the-odds-fetch');

    try {
      if (this.isCacheValid()) {
        return this.cache.data!;
      }

      const data = await this.fetchOddsData();
      
      this.cache = {
        data,
        timestamp: Date.now()
      };

      this.eventBus.publish({
        type: 'odds-updated',
        payload: { data }
      });

      this.performanceMonitor.endTrace(traceId);
      return data;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async fetchOddsData(): Promise<TheOddsData> {
    const response = await fetch(
      `${this.config.baseUrl}/odds?apiKey=${this.config.apiKey}&regions=us&markets=h2h,spreads,totals`
    );

    if (!response.ok) {
      throw new Error(`TheOdds API error: ${response.statusText}`);
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
      timestamp: 0
    };
  }

  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async getData(): Promise<TheOddsData> { return this.cache.data as TheOddsData; }
  public isConnected(): boolean { return true; }
  public getMetadata(): Record<string, unknown> { return { id: this.id, type: this.type }; }
} 