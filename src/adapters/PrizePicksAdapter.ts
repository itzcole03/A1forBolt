import {
  PrizePicksData,
  PrizePicksProjection,
  PrizePicksPlayer,
  PrizePicksLeague,
} from '../types/prizePicks.ts'; // Updated import path (adjust as needed)
import { unifiedMonitor } from './../core/UnifiedMonitor.ts'; // Updated import path
import {
  PrizePicksAPI,
  RawPrizePicksProjection,
  RawPrizePicksIncludedPlayer,
  RawPrizePicksIncludedLeague,
  PrizePicksAPIResponse,
} from './../api/PrizePicksAPI.ts'; // Updated import path

interface PrizePicksAdapterConfig {
  apiKey?: string; // VITE_PRIZEPICKS_API_KEY - made optional
  baseUrl?: string; // Optional: api.prizepicks.com is default in PrizePicksAPI
  cacheTimeout?: number; // Milliseconds, e.g., 5 minutes
  defaultLeagueId?: string; // e.g., NBA league ID for default fetches
}

export class PrizePicksAdapter {
  public readonly id = 'prize-picks';
  public readonly type = 'sports-projections';

  private readonly prizePicksApi: PrizePicksAPI;
  private readonly config: PrizePicksAdapterConfig;
  private cache: {
    data: PrizePicksData | null;
    timestamp: number;
  };

  constructor(config: PrizePicksAdapterConfig) {
    this.config = {
      cacheTimeout: 300000, // Default 5 minutes
      apiKey: '', // Explicitly pass empty string if not provided
      ...config,
    };
    this.prizePicksApi = new PrizePicksAPI({
      apiKey: this.config.apiKey, // This will be an empty string if not in .env
      baseUrl: this.config.baseUrl || 'https://api.prizepicks.com',
    });
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async isAvailable(): Promise<boolean> {
    // return Boolean(this.config.apiKey); // No longer dependent on API key
    return true; // Assume available for scraping
  }

  public async fetch(): Promise<PrizePicksData> {
    const trace = unifiedMonitor.startTrace('prize-picks-adapter-fetch', 'adapter.fetch');

    try {
      if (this.isCacheValid()) {
        return this.cache.data!;
      }

      const rawApiResponse = await this.prizePicksApi.fetchProjections(this.config.defaultLeagueId);

      const transformedData = this.transformData(rawApiResponse);

      this.cache = {
        data: transformedData,
        timestamp: Date.now(),
      };

      unifiedMonitor.endTrace(trace);
      return transformedData;
    } catch (error) {
      unifiedMonitor.endTrace(trace);
      console.error(`[PrizePicksAdapter] Error during fetch: ${(error as Error).message}`);
      throw error;
    }
  }

  private transformData(
    apiResponse: PrizePicksAPIResponse<RawPrizePicksProjection>
  ): PrizePicksData {
    const includedPlayersMap = new Map<string, PrizePicksPlayer>();
    const includedLeaguesMap = new Map<string, PrizePicksLeague>();

    if (apiResponse.included) {
      apiResponse.included.forEach(item => {
        if (item.type === 'new_player') {
          const rawPlayer = item as RawPrizePicksIncludedPlayer;
          includedPlayersMap.set(rawPlayer.id, {
            id: rawPlayer.id,
            name: rawPlayer.attributes.name,
            team: rawPlayer.attributes.team_name,
            position: rawPlayer.attributes.position,
            image_url: rawPlayer.attributes.image_url,
          });
        } else if (item.type === 'league') {
          const rawLeague = item as RawPrizePicksIncludedLeague;
          includedLeaguesMap.set(rawLeague.id, {
            id: rawLeague.id,
            name: rawLeague.attributes.name,
            sport: rawLeague.attributes.sport,
          });
        }
      });
    }

    const projections: PrizePicksProjection[] = apiResponse.data.map(rawProj => {
      const playerId = rawProj.relationships.new_player.data.id;
      const playerDetail = includedPlayersMap.get(playerId);

      return {
        id: rawProj.id,
        playerId: playerId,
        player: playerDetail,
        statType: rawProj.attributes.stat_type,
        line: rawProj.attributes.line_score,
        description: rawProj.attributes.description,
        startTime: rawProj.attributes.start_time,
      };
    });

    return {
      projections: projections,
      players: Array.from(includedPlayersMap.values()),
      leagues: Array.from(includedLeaguesMap.values()),
      lastUpdated: new Date().toISOString(),
    };
  }

  private isCacheValid(): boolean {
    if (!this.cache.data) return false;
    const age = Date.now() - this.cache.timestamp;
    return age < (this.config.cacheTimeout || 0);
  }

  public clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }

  public async connect(): Promise<void> {
    /* No-op */
  }
  public async disconnect(): Promise<void> {
    /* No-op */
  }
  public async getData(): Promise<PrizePicksData> {
    if (!this.cache.data) {
      // throw new Error('No data available in PrizePicksAdapter. Call fetch() first.');
      // Attempt to fetch if no data is available, common for initial load or if cache cleared
      console.warn('[PrizePicksAdapter] No data in cache for getData(), attempting fetch...');
      return await this.fetch();
    }
    return this.cache.data;
  }
  public isConnected(): boolean {
    return true;
  }
  public getMetadata(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      description: 'Adapter for PrizePicks projection data',
      defaultLeagueId: this.config.defaultLeagueId,
    };
  }
}
