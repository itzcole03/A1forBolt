import { DataSource } from '../core/DataSource.js';
import { EventBus } from '../core/EventBus.js';
import { PerformanceMonitor } from '../core/PerformanceMonitor.js';

export interface ESPNGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
}

export interface ESPNHeadline {
  title: string;
  link: string;
  pubDate: string;
}

export interface ESPNData {
  games: ESPNGame[];
  headlines: ESPNHeadline[];
}

export class ESPNAdapter implements DataSource<ESPNData> {
  public readonly id = 'espn';
  public readonly type = 'sports-news';

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private cache: {
    data: ESPNData | null;
    timestamp: number;
  };

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetch(): Promise<ESPNData> {
    const traceId = this.performanceMonitor.startTrace('espn-fetch');
    try {
      if (this.isCacheValid()) {
        return this.cache.data!;
      }
      const [games, headlines] = await Promise.all([this.fetchGames(), this.fetchHeadlines()]);
      const data: ESPNData = { games, headlines };
      this.cache = { data, timestamp: Date.now() };
      this.eventBus.emit('espn-updated', { data });
      this.performanceMonitor.endTrace(traceId);
      return data;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async fetchGames(): Promise<ESPNGame[]> {
    // Use ESPN's public scoreboard API (NBA example)
    const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    try {
      const res = await fetch(url);
      const json = await res.json();
      return (json.events || []).map((event: unknown) => {
        const eventData = event as Record<string, unknown>;
        const competitions = eventData.competitions as unknown[];
        const competition = competitions?.[0] as Record<string, unknown>;
        const competitors = competition?.competitors as unknown[];

        const homeCompetitor = competitors?.find((c: unknown) =>
          (c as Record<string, unknown>).homeAway === 'home'
        ) as Record<string, unknown> | undefined;

        const awayCompetitor = competitors?.find((c: unknown) =>
          (c as Record<string, unknown>).homeAway === 'away'
        ) as Record<string, unknown> | undefined;

        return {
          id: eventData.id as string,
          homeTeam: (homeCompetitor?.team as Record<string, unknown>)?.displayName as string || '',
          awayTeam: (awayCompetitor?.team as Record<string, unknown>)?.displayName as string || '',
          startTime: eventData.date as string,
          status: ((eventData.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as string,
        };
      });
    } catch {
      return [];
    }
  }

  private async fetchHeadlines(): Promise<ESPNHeadline[]> {
    // Use ESPN's NBA news RSS feed
    const url = 'https://www.espn.com/espn/rss/nba/news';
    try {
      const res = await fetch(url);
      const text = await res.text();
      const matches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      return matches.map(item => {
        const title = (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
        const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
        return { title, link, pubDate };
      });
    } catch {
      return [];
    }
  }

  private isCacheValid(): boolean {
    const cacheTimeout = 5 * 60 * 1000;
    return this.cache.data !== null && Date.now() - this.cache.timestamp < cacheTimeout;
  }

  public clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }

  public async connect(): Promise<void> { }
  public async disconnect(): Promise<void> { }
  public async getData(): Promise<ESPNData> {
    return this.cache.data as ESPNData;
  }
  public isConnected(): boolean {
    return true;
  }
  public getMetadata(): Record<string, unknown> {
    return { id: this.id, type: this.type };
  }
}
