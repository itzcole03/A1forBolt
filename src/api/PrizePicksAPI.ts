import { EventBus } from '@core/EventBus.ts'; // Corrected import path

// import { EventMap } from './../../../src/types/core.ts'; // Temporarily remove as EventMap might not have these keys, FILE NOT FOUND

const API_BASE_URL = 'https://api.prizepicks.com';

export interface PrizePicksAPIConfig {
  apiKey?: string;
  baseUrl?: string;
  eventBus?: EventBus; // Keep for potential future use or other events
}

export interface RawPrizePicksProjection {
  id: string;
  type: 'projection';
  attributes: {
    description: string;
    display_stat: string;
    flash_sale_line_score?: number; // Optional for flash sales
    is_promo: boolean;
    line_score: number;
    odds_type: string;
    promotion_id?: string | null; // Optional
    projection_type: string; // e.g., "over_under"
    pt_old?: string | null; // Optional
    rank: number;
    refundable: boolean;
    source: string;
    start_time: string; // ISO 8601 date string
    stat_type: string; // e.g., "Rebounds", "Points"
    status: string; // e.g., "active"
    custom_image_url?: string | null; // Optional
    updated_at: string; // ISO 8601 date string
  };
  relationships: {
    league: { data: { id: string; type: 'league' } };
    new_player: { data: { id: string; type: 'new_player' } };
    stat_type: { data: { id: string; type: 'stat_type' } };
  };
}

export interface RawPrizePicksIncludedPlayer {
  id: string;
  type: 'new_player';
  attributes: {
    name: string;
    display_name: string;
    short_name: string;
    position: string;
    team_name: string;
    team_nickname: string;
    image_url: string;
  };
}

export interface RawPrizePicksIncludedLeague {
  id: string;
  type: 'league';
  attributes: {
    name: string;
    sport: string;
    abbreviation: string;
    active: boolean;
  };
}

export interface RawPrizePicksIncludedStatType {
  id: string;
  type: 'stat_type';
  attributes: {
    name: string;
    display_name: string;
    abbreviation: string;
  };
}

export type PrizePicksIncludedResource =
  | RawPrizePicksIncludedPlayer
  | RawPrizePicksIncludedLeague
  | RawPrizePicksIncludedStatType;

export interface PrizePicksAPIResponse<T> {
  data: T[];
  included?: PrizePicksIncludedResource[];
  links?: {
    first?: string;
    last?: string;
    next?: string | null;
    prev?: string | null;
  };
  meta?: Record<string, unknown>;
}

export class PrizePicksAPI {
  private apiKey?: string;
  private baseUrl: string;

  constructor(config: PrizePicksAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
    additionalHeaders?: Record<string, string>,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...additionalHeaders,
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }

    const configInit: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      configInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), configInit);

      if (!response.ok) {
        const errorBody = await response.text();
        // Removed eventBus.emit for 'api:error'
        // this.eventBus?.emit('api:error' as any, {
        //   source: 'PrizePicksAPI',
        //   endpoint,
        //   status: response.status,
        //   error: errorBody,
        // });
        console.error(
          `PrizePicksAPI request failed: ${response.status} ${response.statusText} to ${endpoint} - Body: ${errorBody}`
        );
        throw new Error(
          `PrizePicks API request failed to ${endpoint}: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }

      if (response.status === 204) {
        // No Content
        return null as T;
      }

      const responseData = await response.json();
      // Removed eventBus.emit for 'api:success'
      // this.eventBus?.emit('api:success' as any, {
      //     source: 'PrizePicksAPI',
      //     endpoint,
      //     status: response.status,
      //     data: responseData,
      // });
      return responseData as T;
    } catch (error) {
      // Removed eventBus.emit for 'api:error'
      // this.eventBus?.emit('api:error' as any, {
      //     source: 'PrizePicksAPI',
      //     endpoint,
      //     status: (error instanceof Response) ? error.status : 0,
      //     error: (error instanceof Error) ? error.message : String(error),
      // });
      console.error(`PrizePicksAPI Error during request to ${endpoint}:`, error);
      throw error;
    }
  }

  public async fetchProjections(
    leagueId?: string,
    queryParams: Record<string, string> = {}
  ): Promise<PrizePicksAPIResponse<RawPrizePicksProjection>> {
    const endpoint = '/projections';
    const params: Record<string, string> = { single_stat: 'true', ...queryParams };

    if (leagueId) {
      params['league_id'] = leagueId;
    } else if (!params['league_id']) {
      // If no leagueId is provided in args or queryParams, default to NBA
      params['league_id'] = 'NBA';
    }

    return this.request<PrizePicksAPIResponse<RawPrizePicksProjection>>(
      endpoint,
      'GET',
      undefined,
      undefined,
      params
    );
  }

  public async fetchProjectionById(
    projectionId: string
  ): Promise<PrizePicksAPIResponse<RawPrizePicksProjection>> {
    const endpoint = `/projections/${projectionId}`;
    return this.request<PrizePicksAPIResponse<RawPrizePicksProjection>>(endpoint);
  }

  public async fetchLeagues(): Promise<PrizePicksAPIResponse<RawPrizePicksIncludedLeague>> {
    const endpoint = '/leagues';
    return this.request<PrizePicksAPIResponse<RawPrizePicksIncludedLeague>>(endpoint);
  }

  public async fetchStatTypes(): Promise<PrizePicksAPIResponse<RawPrizePicksIncludedStatType>> {
    const endpoint = '/stat_types';
    return this.request<PrizePicksAPIResponse<RawPrizePicksIncludedStatType>>(endpoint);
  }

  public async fetchPlayerById(playerId: string): Promise<{ data: RawPrizePicksIncludedPlayer }> {
    const endpoint = `/new_players/${playerId}`;
    return this.request<{ data: RawPrizePicksIncludedPlayer }>(endpoint);
  }
}
