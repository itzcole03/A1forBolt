import { EventEmitter } from "eventemitter3";
import {
  API_ENDPOINTS,
  SPORTS_CONFIG,
  CACHE_CONFIG,
  FEATURE_FLAGS,
  buildApiUrl,
  isApiAvailable,
} from "../../config/unifiedApiConfig";
import { storeEventBus } from "../../store/unified/UnifiedStoreManager";

// Core Data Types
export interface GameData {
  id: string;
  sport: string;
  league: string;
  homeTeam: TeamData;
  awayTeam: TeamData;
  startTime: string;
  status: "scheduled" | "live" | "finished" | "postponed";
  venue?: VenueData;
  weather?: WeatherData;
  officials?: OfficialData[];
}

export interface TeamData {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  conference?: string;
  division?: string;
  record: {
    wins: number;
    losses: number;
    ties?: number;
  };
  stats: TeamStats;
  injuries: InjuryData[];
  recentForm: number[];
  eloRating: number;
}

export interface PlayerData {
  id: string;
  name: string;
  position: string;
  teamId: string;
  jersey: number;
  stats: PlayerStats;
  recentPerformance: PerformanceData[];
  injuries: InjuryData[];
  salaryInfo?: {
    draftKings?: number;
    fanduel?: number;
    prizePicks?: number;
  };
}

export interface TeamStats {
  offensiveRating: number;
  defensiveRating: number;
  pace: number;
  netRating: number;
  homeAdvantage: number;
  awayPerformance: number;
  recentForm: number;
  strengthOfSchedule: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  averages: Record<string, number>;
  per36: Record<string, number>;
  advanced: Record<string, number>;
  seasonTotals: Record<string, number>;
  last5Games: Record<string, number>;
  last10Games: Record<string, number>;
  vsOpponent: Record<string, number>;
}

export interface PerformanceData {
  gameId: string;
  date: string;
  opponent: string;
  stats: Record<string, number>;
  minutesPlayed: number;
  efficiency: number;
}

export interface InjuryData {
  playerId: string;
  type: string;
  severity: "minor" | "moderate" | "major" | "season-ending";
  status: "questionable" | "doubtful" | "out" | "day-to-day";
  expectedReturn?: string;
  impact: number; // 0-1 scale
}

export interface OddsData {
  eventId: string;
  bookmaker: string;
  market: string;
  outcomes: Array<{
    name: string;
    odds: number;
    line?: number;
  }>;
  timestamp: number;
  volume?: number;
  sharpMoney?: number;
}

export interface LineMovement {
  eventId: string;
  market: string;
  history: Array<{
    timestamp: number;
    line: number;
    odds: number;
    volume: number;
  }>;
}

export interface VenueData {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  surface?: string;
  elevation?: number;
  advantages: Record<string, number>;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
  conditions: string;
}

export interface OfficialData {
  id: string;
  name: string;
  position: string;
  experience: number;
  tendencies: Record<string, number>;
}

export interface MarketData {
  eventId: string;
  market: string;
  currentOdds: OddsData[];
  lineMovement: LineMovement;
  volume: number;
  sharpMoney: number;
  publicBetting: {
    percentage: number;
    tickets: number;
    money: number;
  };
}

// Data Source Interfaces
interface DataSource {
  name: string;
  isAvailable(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

interface SportRadarSource extends DataSource {
  getGames(sport: string, date?: string): Promise<GameData[]>;
  getGameStats(gameId: string): Promise<any>;
  getPlayerStats(playerId: string): Promise<PlayerData>;
  getTeamStats(teamId: string): Promise<TeamData>;
  getInjuries(sport: string): Promise<InjuryData[]>;
}

interface OddsSource extends DataSource {
  getOdds(sport: string, market?: string): Promise<OddsData[]>;
  getLineMovement(eventId: string, market: string): Promise<LineMovement>;
  getMarketDepth(eventId: string): Promise<MarketData>;
}

interface PrizePicksSource extends DataSource {
  getProjections(sport?: string): Promise<any[]>;
  getPlayerPool(): Promise<PlayerData[]>;
  getMultipliers(): Promise<Record<string, number>>;
}

// Rate Limiting and Queue Management
class RateLimiter {
  private requestCounts: Map<string, { count: number; resetTime: number }> =
    new Map();

  canMakeRequest(endpoint: string): boolean {
    const config = API_ENDPOINTS[endpoint as keyof typeof API_ENDPOINTS];
    if (!config?.rateLimit) return true;

    const now = Date.now();
    const key = `${endpoint}:${Math.floor(now / config.rateLimit.period)}`;
    const current = this.requestCounts.get(key) || {
      count: 0,
      resetTime: now + config.rateLimit.period,
    };

    if (now > current.resetTime) {
      this.requestCounts.set(key, {
        count: 0,
        resetTime: now + config.rateLimit.period,
      });
      return true;
    }

    return current.count < config.rateLimit.requests;
  }

  recordRequest(endpoint: string): void {
    const config = API_ENDPOINTS[endpoint as keyof typeof API_ENDPOINTS];
    if (!config?.rateLimit) return;

    const now = Date.now();
    const key = `${endpoint}:${Math.floor(now / config.rateLimit.period)}`;
    const current = this.requestCounts.get(key) || {
      count: 0,
      resetTime: now + config.rateLimit.period,
    };

    current.count++;
    this.requestCounts.set(key, current);
  }
}

class RequestQueue {
  private queue: Array<{
    id: string;
    priority: number;
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing: boolean = false;

  enqueue<T>(
    id: string,
    priority: number,
    executor: () => Promise<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        priority,
        execute: executor,
        resolve,
        reject,
      });

      this.queue.sort((a, b) => a.priority - b.priority);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      try {
        const result = await item.execute();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}

// Cache Implementation
class DataCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Main Data Pipeline
export class UnifiedDataPipeline extends EventEmitter {
  private static instance: UnifiedDataPipeline;
  private cache: DataCache;
  private rateLimiter: RateLimiter;
  private requestQueue: RequestQueue;
  private activeConnections: Map<string, boolean> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
    this.cache = new DataCache();
    this.rateLimiter = new RateLimiter();
    this.requestQueue = new RequestQueue();
    this.initializeConnections();
  }

  public static getInstance(): UnifiedDataPipeline {
    if (!UnifiedDataPipeline.instance) {
      UnifiedDataPipeline.instance = new UnifiedDataPipeline();
    }
    return UnifiedDataPipeline.instance;
  }

  private async initializeConnections(): Promise<void> {
    // Check API availability and establish connections
    for (const [name, endpoint] of Object.entries(API_ENDPOINTS)) {
      try {
        const available = await isApiAvailable(
          name as keyof typeof API_ENDPOINTS,
        );
        this.activeConnections.set(name, available);

        if (available) {
          this.emit("connection:established", { source: name });
        } else {
          this.emit("connection:failed", {
            source: name,
            reason: "API unavailable",
          });
        }
      } catch (error) {
        this.activeConnections.set(name, false);
        this.emit("connection:failed", { source: name, error });
      }
    }

    // Start real-time data streams
    this.startRealTimeStreams();
  }

  private startRealTimeStreams(): void {
    if (FEATURE_FLAGS.REAL_TIME_ODDS) {
      this.startOddsStream();
    }

    if (FEATURE_FLAGS.LIVE_PREDICTIONS) {
      this.startLiveGamesStream();
    }

    if (FEATURE_FLAGS.INJURY_TRACKING) {
      this.startInjuryUpdates();
    }
  }

  private startOddsStream(): void {
    const interval = setInterval(async () => {
      try {
        const activeGames = await this.getActiveGames();
        for (const game of activeGames) {
          await this.fetchLiveOdds(game.id);
        }
      } catch (error) {
        this.emit("error", { type: "odds_stream", error });
      }
    }, 30000); // Update every 30 seconds

    this.refreshIntervals.set("odds", interval);
  }

  private startLiveGamesStream(): void {
    const interval = setInterval(async () => {
      try {
        const liveGames = await this.getLiveGames();
        for (const game of liveGames) {
          await this.fetchLiveGameData(game.id);
        }
      } catch (error) {
        this.emit("error", { type: "live_games", error });
      }
    }, 15000); // Update every 15 seconds

    this.refreshIntervals.set("live_games", interval);
  }

  private startInjuryUpdates(): void {
    const interval = setInterval(async () => {
      try {
        for (const sport of Object.keys(SPORTS_CONFIG)) {
          await this.fetchInjuries(sport.toLowerCase());
        }
      } catch (error) {
        this.emit("error", { type: "injury_updates", error });
      }
    }, 1800000); // Update every 30 minutes

    this.refreshIntervals.set("injuries", interval);
  }

  // Public API Methods
  public async getGameData(gameId: string): Promise<GameData> {
    const cacheKey = `game:${gameId}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    return this.requestQueue.enqueue(
      `game-${gameId}`,
      2, // Medium priority
      async () => {
        if (!this.rateLimiter.canMakeRequest("SPORTRADAR")) {
          throw new Error("Rate limit exceeded for SportRadar");
        }

        const gameData = await this.fetchGameFromSportradar(gameId);
        this.rateLimiter.recordRequest("SPORTRADAR");
        this.cache.set(cacheKey, gameData, CACHE_CONFIG.GAME_SCHEDULES.ttl);

        this.emit("data:updated", { type: "game", id: gameId, data: gameData });
        return gameData;
      },
    );
  }

  public async getPlayerData(playerId: string): Promise<PlayerData> {
    const cacheKey = `player:${playerId}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    return this.requestQueue.enqueue(`player-${playerId}`, 2, async () => {
      if (!this.rateLimiter.canMakeRequest("SPORTRADAR")) {
        throw new Error("Rate limit exceeded for SportRadar");
      }

      const playerData = await this.fetchPlayerFromSportradar(playerId);
      this.rateLimiter.recordRequest("SPORTRADAR");
      this.cache.set(cacheKey, playerData, CACHE_CONFIG.PLAYER_STATS.ttl);

      this.emit("data:updated", {
        type: "player",
        id: playerId,
        data: playerData,
      });
      return playerData;
    });
  }

  public async getLiveOdds(
    eventId: string,
    market?: string,
  ): Promise<OddsData[]> {
    const cacheKey = `odds:${eventId}:${market || "all"}`;
    const cached = this.cache.get(cacheKey);

    if (cached && FEATURE_FLAGS.REAL_TIME_ODDS) {
      return cached;
    }

    return this.requestQueue.enqueue(
      `odds-${eventId}`,
      1, // High priority for live odds
      async () => {
        if (!this.rateLimiter.canMakeRequest("THE_ODDS_API")) {
          throw new Error("Rate limit exceeded for The Odds API");
        }

        const oddsData = await this.fetchOddsFromTheOddsApi(eventId, market);
        this.rateLimiter.recordRequest("THE_ODDS_API");
        this.cache.set(cacheKey, oddsData, CACHE_CONFIG.LIVE_ODDS.ttl);

        this.emit("data:updated", {
          type: "odds",
          id: eventId,
          data: oddsData,
        });
        storeEventBus.emit("odds:updated", { eventId, odds: oddsData });

        return oddsData;
      },
    );
  }

  public async getPrizePicksProjections(): Promise<any[]> {
    const cacheKey = "prizepicks:projections";
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    return this.requestQueue.enqueue("prizepicks-projections", 2, async () => {
      const projections = await this.fetchPrizePicksProjections();
      this.cache.set(cacheKey, projections, 300000); // 5 minutes cache

      this.emit("data:updated", { type: "projections", data: projections });
      return projections;
    });
  }

  public async getInjuries(sport: string): Promise<InjuryData[]> {
    const cacheKey = `injuries:${sport}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    return this.requestQueue.enqueue(`injuries-${sport}`, 2, async () => {
      const injuries = await this.fetchInjuries(sport);
      this.cache.set(cacheKey, injuries, CACHE_CONFIG.INJURIES.ttl);

      this.emit("data:updated", { type: "injuries", sport, data: injuries });
      return injuries;
    });
  }

  public async getWeatherData(venueId: string): Promise<WeatherData | null> {
    if (!FEATURE_FLAGS.WEATHER_INTEGRATION) return null;

    const cacheKey = `weather:${venueId}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    return this.requestQueue.enqueue(
      `weather-${venueId}`,
      4, // Low priority
      async () => {
        const weather = await this.fetchWeatherData(venueId);
        this.cache.set(cacheKey, weather, CACHE_CONFIG.WEATHER.ttl);

        this.emit("data:updated", { type: "weather", venueId, data: weather });
        return weather;
      },
    );
  }

  // Private fetch methods
  private async fetchGameFromSportradar(gameId: string): Promise<GameData> {
    const url = buildApiUrl("SPORTRADAR", `/games/${gameId}`, {
      api_key: API_ENDPOINTS.SPORTRADAR.apiKey!,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SportRadar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformSportradarGame(data);
  }

  private async fetchPlayerFromSportradar(
    playerId: string,
  ): Promise<PlayerData> {
    const url = buildApiUrl("SPORTRADAR", `/players/${playerId}`, {
      api_key: API_ENDPOINTS.SPORTRADAR.apiKey!,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SportRadar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformSportradarPlayer(data);
  }

  private async fetchOddsFromTheOddsApi(
    eventId: string,
    market?: string,
  ): Promise<OddsData[]> {
    const params: Record<string, string> = {
      apiKey: API_ENDPOINTS.THE_ODDS_API.apiKey!,
      regions: "us",
      oddsFormat: "american",
    };

    if (market) {
      params.markets = market;
    }

    const url = buildApiUrl(
      "THE_ODDS_API",
      `/sports/americanfootball_nfl/odds`,
      params,
    );

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The Odds API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformOddsData(data, eventId);
  }

  private async fetchPrizePicksProjections(): Promise<any[]> {
    const url = buildApiUrl("PRIZEPICKS", "/projections");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PrizePicks API error: ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchInjuries(sport: string): Promise<InjuryData[]> {
    const url = buildApiUrl("INJURY_API", `/injuries/${sport}`, {
      key: API_ENDPOINTS.INJURY_API.apiKey!,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Injury API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformInjuryData(data);
  }

  private async fetchWeatherData(venueId: string): Promise<WeatherData> {
    const url = buildApiUrl("WEATHER", `/current`, {
      key: API_ENDPOINTS.WEATHER.apiKey!,
      q: venueId,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformWeatherData(data);
  }

  // Data transformation methods
  private transformSportradarGame(data: any): GameData {
    return {
      id: data.id,
      sport: data.sport || "unknown",
      league: data.league?.name || "unknown",
      homeTeam: this.transformTeamData(data.home_team),
      awayTeam: this.transformTeamData(data.away_team),
      startTime: data.scheduled,
      status: data.status,
      venue: data.venue ? this.transformVenueData(data.venue) : undefined,
    };
  }

  private transformSportradarPlayer(data: any): PlayerData {
    return {
      id: data.id,
      name: data.name,
      position: data.position,
      teamId: data.team?.id || "",
      jersey: data.jersey || 0,
      stats: this.transformPlayerStats(data.statistics),
      recentPerformance: [],
      injuries: [],
    };
  }

  private transformTeamData(data: any): TeamData {
    return {
      id: data.id,
      name: data.name,
      abbreviation: data.abbreviation,
      city: data.market || "",
      record: {
        wins: data.wins || 0,
        losses: data.losses || 0,
      },
      stats: {
        offensiveRating: 0,
        defensiveRating: 0,
        pace: 0,
        netRating: 0,
        homeAdvantage: 0,
        awayPerformance: 0,
        recentForm: 0,
        strengthOfSchedule: 0,
      },
      injuries: [],
      recentForm: [],
      eloRating: 1500,
    };
  }

  private transformPlayerStats(data: any): PlayerStats {
    return {
      gamesPlayed: data.games_played || 0,
      averages: data.averages || {},
      per36: data.per_36 || {},
      advanced: data.advanced || {},
      seasonTotals: data.totals || {},
      last5Games: {},
      last10Games: {},
      vsOpponent: {},
    };
  }

  private transformVenueData(data: any): VenueData {
    return {
      id: data.id,
      name: data.name,
      city: data.city,
      state: data.state,
      capacity: data.capacity || 0,
      advantages: {},
    };
  }

  private transformOddsData(data: any[], eventId: string): OddsData[] {
    return data.map((bookmaker) => ({
      eventId,
      bookmaker: bookmaker.key,
      market: "h2h",
      outcomes: bookmaker.markets?.[0]?.outcomes || [],
      timestamp: Date.now(),
    }));
  }

  private transformInjuryData(data: any[]): InjuryData[] {
    return data.map((injury) => ({
      playerId: injury.player_id,
      type: injury.type,
      severity: injury.severity || "minor",
      status: injury.status || "questionable",
      expectedReturn: injury.expected_return,
      impact: injury.impact || 0.1,
    }));
  }

  private transformWeatherData(data: any): WeatherData {
    const current = data.current;
    return {
      temperature: current.temp_f,
      humidity: current.humidity,
      windSpeed: current.wind_mph,
      windDirection: current.wind_degree,
      precipitation: current.precip_in,
      visibility: current.vis_miles,
      conditions: current.condition.text,
    };
  }

  // Utility methods
  private async getActiveGames(): Promise<GameData[]> {
    // Return games that are currently live or starting soon
    return [];
  }

  private async getLiveGames(): Promise<GameData[]> {
    // Return games that are currently in progress
    return [];
  }

  private async fetchLiveOdds(gameId: string): Promise<void> {
    try {
      await this.getLiveOdds(gameId);
    } catch (error) {
      this.emit("error", { type: "live_odds_fetch", gameId, error });
    }
  }

  private async fetchLiveGameData(gameId: string): Promise<void> {
    try {
      await this.getGameData(gameId);
    } catch (error) {
      this.emit("error", { type: "live_game_fetch", gameId, error });
    }
  }

  // Public management methods
  public clearCache(): void {
    this.cache.clear();
    this.emit("cache:cleared");
  }

  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache["cache"].size,
      hitRate: 0.85, // Mock hit rate
    };
  }

  public getConnectionStatus(): Record<string, boolean> {
    return Object.fromEntries(this.activeConnections);
  }

  public async refreshAllData(): Promise<void> {
    this.clearCache();
    this.emit("refresh:started");

    try {
      // Refresh critical data
      await Promise.all([
        this.refreshGames(),
        this.refreshOdds(),
        this.refreshInjuries(),
      ]);

      this.emit("refresh:completed");
    } catch (error) {
      this.emit("refresh:failed", error);
    }
  }

  private async refreshGames(): Promise<void> {
    // Implementation for refreshing game data
  }

  private async refreshOdds(): Promise<void> {
    // Implementation for refreshing odds data
  }

  private async refreshInjuries(): Promise<void> {
    // Implementation for refreshing injury data
  }

  public shutdown(): void {
    // Clear all intervals
    for (const interval of this.refreshIntervals.values()) {
      clearInterval(interval);
    }
    this.refreshIntervals.clear();

    // Clear cache
    this.clearCache();

    // Reset connections
    this.activeConnections.clear();

    this.emit("shutdown");
  }
}

// Export singleton instance
export const dataPipeline = UnifiedDataPipeline.getInstance();

// Export types
export type {
  GameData,
  TeamData,
  PlayerData,
  OddsData,
  InjuryData,
  MarketData,
  WeatherData,
  LineMovement,
};
