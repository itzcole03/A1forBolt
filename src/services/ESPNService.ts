import axios, { AxiosInstance } from 'axios';
import { EventBus } from '../unified/EventBus.js';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';

export interface ESPNConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  cacheTimeout: number;
}

export interface ESPNGame {
  id: string;
  sport: string;
  league: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score?: number;
  };
  startTime: string;
  status: 'scheduled' | 'inProgress' | 'final' | 'postponed';
  venue: {
    name: string;
    city: string;
    state: string;
  };
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
  };
}

export interface ESPNPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  jersey: string;
  status: 'active' | 'injured' | 'questionable' | 'out';
  stats: {
    [key: string]: number;
  };
  projections?: {
    [key: string]: number;
  };
}

export interface ESPNHeadline {
  id: string;
  title: string;
  description: string;
  link: string;
  published: string;
  updated: string;
  sport: string;
  league?: string;
  team?: string;
  player?: string;
  type: 'news' | 'injury' | 'rumor' | 'analysis';
}

export interface ESPNEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  published: string;
  type: 'news' | 'injury' | 'rumor' | 'analysis';
}

export interface ESPNFeatures {
  // Game-level
  gameId?: string;
  sport?: string;
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  status?: 'scheduled' | 'inProgress' | 'final' | 'postponed';
  venue?: string;
  weather_temperature?: number;
  weather_condition?: string;
  weather_windSpeed?: number;
  startTime?: string;
  // Player-level
  playerId?: string;
  playerName?: string;
  playerPosition?: string;
  playerTeam?: string;
  playerStatus?: 'active' | 'injured' | 'questionable' | 'out';
  // Flattened stats and projections
  [key: `playerStat_${string}`]: number;
  [key: `playerProjection_${string}`]: number;
  // Team-level
  teamRosterSize?: number;
  [key: `teamStat_${string}`]: number;
  // News/headlines
  news_count?: number;
  news_types?: string[];
}

export class ESPNService {
  /**
   * Extracts and returns normalized features for a given context (game, player, team, etc.)
   * to be used in ensemble prediction. This enables ESPNService to contribute structured
   * data to the unified prediction engine for maximum accuracy.
   *
   * @param context - An object containing identifiers and parameters for feature extraction.
   *                  Example: { gameId, playerId, teamId, metric, date, ... }
   * @returns A Promise resolving to a normalized feature object.
   */
  public async getFeatures(context: {
    gameId?: string;
    playerId?: string;
    teamId?: string;
    metric?: string;
    date?: string;
  }): Promise<ESPNFeatures> {
    const features: ESPNFeatures = { };
    // Game-level features
    if (context.gameId) {
      const game = await this.getGame(context.gameId);
      if (game) {
        features.gameId = game.id;
        features.sport = game.sport;
        features.league = game.league;
        features.homeTeam = game.homeTeam.name;
        features.awayTeam = game.awayTeam.name;
        features.homeScore = game.homeTeam.score ?? 0;
        features.awayScore = game.awayTeam.score ?? 0;
        features.status = game.status;
        features.venue = game.venue.name;
        if (game.weather) {
          features.weather_temperature = game.weather.temperature;
          features.weather_condition = game.weather.condition;
          features.weather_windSpeed = game.weather.windSpeed;
        }
        features.startTime = game.startTime;
      }
    }
    // Player-level features
    if (context.playerId) {
      const player = await this.getPlayer(context.playerId);
      if (player) {
        features.playerId = player.id;
        features.playerName = player.name;
        features.playerPosition = player.position;
        features.playerTeam = player.team;
        features.playerStatus = player.status;
        // Flatten stats
        for (const [statKey, statValue] of Object.entries(player.stats)) {
          features[`playerStat_${statKey}`] = statValue;
        }
        // Flatten projections
        if (player.projections) {
          for (const [projKey, projValue] of Object.entries(player.projections)) {
            features[`playerProjection_${projKey}`] = projValue;
          }
        }
      }
    }
    // Team-level features
    if (context.teamId) {
      const roster = await this.getTeamRoster(context.teamId);
      features.teamRosterSize = roster.length;
      // Optionally, aggregate team stats from roster
      const totalStats: Record<string, number> = {};
      for (const player of roster) {
        for (const [statKey, statValue] of Object.entries(player.stats)) {
          totalStats[statKey] = (totalStats[statKey] || 0) + statValue;
        }
      }
      for (const [statKey, statValue] of Object.entries(totalStats)) {
        features[`teamStat_${statKey}`] = statValue;
      }
    }
    // News/headlines features
    if (context.teamId || context.playerId) {
      const headlines = await this.getHeadlines({
        team: context.teamId,
        player: context.playerId,
        limit: 5,
      });
      features.news_count = headlines.length;
      features.news_types = Array.from(new Set(headlines.map(h => h.type)));
    }
    return features;
  }

  private static instance: ESPNService;
  private readonly eventBus: EventBus;
  private readonly configManager: UnifiedConfig;
  private readonly client: AxiosInstance;
  private readonly cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly espnConfig: ESPNConfig;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.configManager = UnifiedConfig.getInstance();
    this.cache = new Map();
    this.espnConfig = this.configManager.get('espn');

    this.client = axios.create({
      baseURL: this.espnConfig.baseUrl,
      timeout: this.espnConfig.timeout,
    }) as AxiosInstance;

    this.setupEventListeners();
  }

  public static getInstance(): ESPNService {
    if (!ESPNService.instance) {
      ESPNService.instance = new ESPNService();
    }
    return ESPNService.instance;
  }

  // Legacy config initializer is now unused; config is loaded directly from UnifiedConfig
// private initializeConfig(): ESPNConfig { ... }

  private setupEventListeners(): void {
    // Listen for game status updates
    this.eventBus.on('game:status', async (event: { game: ESPNGame; timestamp: number }) => {
      try {
        const game = await this.getGame(event.game.id);
        if (game) {
          this.eventBus.emit('game:status', {
            game,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error handling game status update:', error);
      }
    });

    // Listen for player updates
    this.eventBus.on('player:update', async (event: { player: ESPNPlayer; timestamp: number }) => {
      try {
        const player = await this.getPlayer(event.player.id);
        if (player) {
          this.eventBus.emit('player:update', {
            player,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error handling player update:', error);
      }
    });
  }

  private getCacheKey(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    return `${endpoint}:${params ? JSON.stringify(params) : ''}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.espnConfig.cacheTimeout) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  public async getGames(params: {
    sport?: string;
    league?: string;
    date?: string;
    status?: 'scheduled' | 'inProgress' | 'final';
  }): Promise<ESPNGame[]> {
    const cacheKey = this.getCacheKey('games', params);
    const cached = this.getCachedData<ESPNGame[]>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/games', { params });
    const games = response.data.games as ESPNGame[];

    this.setCachedData(cacheKey, games);
    return games;
  }

  public async getGame(gameId: string): Promise<ESPNGame | null> {
    const cacheKey = this.getCacheKey(`game:${gameId}`);
    const cached = this.getCachedData<ESPNGame>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/games/${gameId}`);
    const game = response.data as ESPNGame;

    this.setCachedData(cacheKey, game);
    return game;
  }

  public async getPlayers(params: {
    sport?: string;
    league?: string;
    team?: string;
    position?: string;
    status?: string;
  }): Promise<ESPNPlayer[]> {
    const cacheKey = this.getCacheKey('players', params);
    const cached = this.getCachedData<ESPNPlayer[]>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/athletes', { params });
    const players = response.data.athletes as ESPNPlayer[];

    this.setCachedData(cacheKey, players);
    return players;
  }

  public async getPlayer(playerId: string): Promise<ESPNPlayer | null> {
    const cacheKey = this.getCacheKey(`player:${playerId}`);
    const cached = this.getCachedData<ESPNPlayer>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/athletes/${playerId}`);
    const player = response.data as ESPNPlayer;

    this.setCachedData(cacheKey, player);
    return player;
  }

  public async getPlayerStats(
    playerId: string,
    params: {
      season?: string;
      seasonType?: 'regular' | 'postseason';
      split?: 'game' | 'season';
    }
  ): Promise<Record<string, number>> {
    const cacheKey = this.getCacheKey(`player:${playerId}:stats`, params);
    const cached = this.getCachedData<Record<string, number>>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/athletes/${playerId}/stats`, { params });
    const stats = response.data.stats as Record<string, number>;

    this.setCachedData(cacheKey, stats);
    return stats;
  }

  public async getPlayerProjections(
    playerId: string,
    params: {
      season?: string;
      week?: number;
    }
  ): Promise<Record<string, number>> {
    const cacheKey = this.getCacheKey(`player:${playerId}:projections`, params);
    const cached = this.getCachedData<Record<string, number>>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/athletes/${playerId}/projections`, { params });
    const projections = response.data.projections as Record<string, number>;

    this.setCachedData(cacheKey, projections);
    return projections;
  }

  public async getHeadlines(params: {
    sport?: string;
    league?: string;
    team?: string;
    player?: string;
    type?: 'news' | 'injury' | 'rumor' | 'analysis';
    limit?: number;
  }): Promise<ESPNHeadline[]> {
    const cacheKey = this.getCacheKey('headlines', params);
    const cached = this.getCachedData<ESPNHeadline[]>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/news', { params });
    const headlines = response.data.articles as ESPNHeadline[];

    this.setCachedData(cacheKey, headlines);
    return headlines;
  }

  public async getTeamSchedule(
    teamId: string,
    params: {
      season?: string;
      seasonType?: 'regular' | 'postseason';
    }
  ): Promise<ESPNGame[]> {
    const cacheKey = this.getCacheKey(`team:${teamId}:schedule`, params);
    const cached = this.getCachedData<ESPNGame[]>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/teams/${teamId}/schedule`, { params });
    const games = response.data.games as ESPNGame[];

    this.setCachedData(cacheKey, games);
    return games;
  }

  public async getTeamRoster(teamId: string): Promise<ESPNPlayer[]> {
    const cacheKey = this.getCacheKey(`team:${teamId}:roster`);
    const cached = this.getCachedData<ESPNPlayer[]>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(`/teams/${teamId}/roster`);
    const players = response.data.athletes as ESPNPlayer[];

    this.setCachedData(cacheKey, players);
    return players;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public clearCacheItem(key: string): void {
    this.cache.delete(key);
  }
}