// Unified API Configuration for A1Betting Platform
// Consolidates all external API integrations (Sportradar, TheOdds, PrizePicks, etc.)

export interface ApiEndpoint {
  name: string;
  baseUrl: string;
  apiKey?: string;
  version?: string;
  timeout?: number;
  rateLimit?: {
    requests: number;
    period: number; // in milliseconds
  };
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  timestamp: number;
  error?: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

// Environment-based API configuration
export const API_ENDPOINTS: Record<string, ApiEndpoint> = {
  // Sportradar Sports Data API
  SPORTRADAR: {
    name: "Sportradar",
    baseUrl:
      import.meta.env.VITE_SPORTRADAR_API_ENDPOINT ||
      "https://api.sportradar.us",
    apiKey: import.meta.env.VITE_SPORTRADAR_API_KEY,
    version: "v7",
    timeout: 15000,
    rateLimit: {
      requests: 1000,
      period: 60000, // 1000 requests per minute
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  },

  // The Odds API for live betting odds
  THE_ODDS_API: {
    name: "The Odds API",
    baseUrl:
      import.meta.env.VITE_THEODDS_API_ENDPOINT ||
      "https://api.the-odds-api.com",
    apiKey: import.meta.env.VITE_THEODDS_API_KEY,
    version: "v4",
    timeout: 10000,
    rateLimit: {
      requests: 500,
      period: 60000, // 500 requests per minute
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 500,
    },
  },

  // PrizePicks for daily fantasy sports
  PRIZEPICKS: {
    name: "PrizePicks",
    baseUrl:
      import.meta.env.VITE_PRIZEPICKS_API_ENDPOINT ||
      "https://api.prizepicks.com",
    apiKey: import.meta.env.VITE_PRIZEPICKS_API_KEY,
    version: "v1",
    timeout: 8000,
    rateLimit: {
      requests: 300,
      period: 60000,
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 750,
    },
  },

  // ESPN for news and additional stats
  ESPN: {
    name: "ESPN",
    baseUrl:
      import.meta.env.VITE_ESPN_API_ENDPOINT ||
      "https://site.api.espn.com/apis/site",
    version: "v2",
    timeout: 8000,
    rateLimit: {
      requests: 200,
      period: 60000,
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 500,
    },
  },

  // Daily Fantasy integration
  DAILY_FANTASY: {
    name: "Daily Fantasy",
    baseUrl:
      import.meta.env.VITE_DAILYFANTASY_API_ENDPOINT ||
      "https://api.draftkings.com",
    apiKey: import.meta.env.VITE_DAILYFANTASY_API_KEY,
    version: "v1",
    timeout: 10000,
    rateLimit: {
      requests: 250,
      period: 60000,
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  },

  // Weather API for outdoor sports
  WEATHER: {
    name: "Weather API",
    baseUrl:
      import.meta.env.VITE_WEATHER_API_ENDPOINT || "https://api.weatherapi.com",
    apiKey: import.meta.env.VITE_WEATHER_API_KEY,
    version: "v1",
    timeout: 5000,
    rateLimit: {
      requests: 100,
      period: 60000,
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 500,
    },
  },

  // News/Sentiment Analysis
  NEWS_API: {
    name: "News API",
    baseUrl: import.meta.env.VITE_NEWS_API_ENDPOINT || "https://newsapi.org",
    apiKey: import.meta.env.VITE_NEWS_API_KEY,
    version: "v2",
    timeout: 8000,
    rateLimit: {
      requests: 500,
      period: 86400000, // 500 requests per day for free tier
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  },

  // Injury Reports
  INJURY_API: {
    name: "Injury API",
    baseUrl:
      import.meta.env.VITE_INJURY_API_ENDPOINT || "https://api.sportsdata.io",
    apiKey: import.meta.env.VITE_INJURY_API_KEY,
    version: "v3",
    timeout: 8000,
    rateLimit: {
      requests: 200,
      period: 60000,
    },
    retryConfig: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 750,
    },
  },
};

// Cache configuration for different data types
export const CACHE_CONFIG: Record<string, CacheConfig> = {
  LIVE_ODDS: {
    enabled: true,
    ttl: 30000, // 30 seconds for live odds
    maxSize: 1000,
  },
  PLAYER_STATS: {
    enabled: true,
    ttl: 300000, // 5 minutes for player stats
    maxSize: 5000,
  },
  GAME_SCHEDULES: {
    enabled: true,
    ttl: 3600000, // 1 hour for schedules
    maxSize: 2000,
  },
  INJURIES: {
    enabled: true,
    ttl: 1800000, // 30 minutes for injuries
    maxSize: 1000,
  },
  NEWS: {
    enabled: true,
    ttl: 900000, // 15 minutes for news
    maxSize: 500,
  },
  WEATHER: {
    enabled: true,
    ttl: 1800000, // 30 minutes for weather
    maxSize: 200,
  },
  PREDICTIONS: {
    enabled: true,
    ttl: 300000, // 5 minutes for predictions
    maxSize: 2000,
  },
};

// Sports and leagues configuration
export const SPORTS_CONFIG = {
  NBA: {
    id: "basketball_nba",
    name: "NBA",
    season: "2024",
    active: true,
    sportradarId: "sr:sport:2",
    oddsApiKey: "basketball_nba",
  },
  WNBA: {
    id: "basketball_wnba",
    name: "WNBA",
    season: "2024",
    active: true,
    sportradarId: "sr:sport:17",
    oddsApiKey: "basketball_wnba",
  },
  MLB: {
    id: "baseball_mlb",
    name: "MLB",
    season: "2024",
    active: true,
    sportradarId: "sr:sport:1",
    oddsApiKey: "baseball_mlb",
  },
  EPL: {
    id: "soccer_epl",
    name: "English Premier League",
    season: "2024-25",
    active: true,
    sportradarId: "sr:sport:1",
    oddsApiKey: "soccer_epl",
  },
  NFL: {
    id: "americanfootball_nfl",
    name: "NFL",
    season: "2024",
    active: true,
    sportradarId: "sr:sport:6",
    oddsApiKey: "americanfootball_nfl",
  },
  NCAAB: {
    id: "basketball_ncaab",
    name: "NCAA Basketball",
    season: "2024-25",
    active: true,
    sportradarId: "sr:sport:2",
    oddsApiKey: "basketball_ncaab",
  },
};

// Market types for betting
export const MARKET_TYPES = {
  SPREAD: "spreads",
  TOTALS: "totals",
  MONEYLINE: "h2h",
  PLAYER_PROPS: "player_props",
  TEAM_PROPS: "team_props",
  ALTERNATE_SPREADS: "alternate_spreads",
  ALTERNATE_TOTALS: "alternate_totals",
};

// Bookmakers configuration
export const BOOKMAKERS = {
  DRAFTKINGS: {
    id: "draftkings",
    name: "DraftKings",
    active: true,
    priority: 1,
  },
  FANDUEL: {
    id: "fanduel",
    name: "FanDuel",
    active: true,
    priority: 2,
  },
  MGMBET: {
    id: "mgmbet",
    name: "MGM Bet",
    active: true,
    priority: 3,
  },
  CAESARS: {
    id: "caesars",
    name: "Caesars",
    active: true,
    priority: 4,
  },
  BETMGM: {
    id: "betmgm",
    name: "BetMGM",
    active: true,
    priority: 5,
  },
};

// API Response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Request priorities for queue management
export const REQUEST_PRIORITIES = {
  CRITICAL: 1, // Live odds during games
  HIGH: 2, // Player props, injury updates
  MEDIUM: 3, // Schedule updates, historical data
  LOW: 4, // News, weather, non-urgent updates
} as const;

// Feature flags for API integrations
export const FEATURE_FLAGS = {
  REAL_TIME_ODDS: import.meta.env.VITE_ENABLE_REAL_TIME_ODDS !== "false",
  LIVE_PREDICTIONS: import.meta.env.VITE_ENABLE_LIVE_PREDICTIONS !== "false",
  SENTIMENT_ANALYSIS: import.meta.env.VITE_ENABLE_SENTIMENT !== "false",
  WEATHER_INTEGRATION: import.meta.env.VITE_ENABLE_WEATHER !== "false",
  INJURY_TRACKING: import.meta.env.VITE_ENABLE_INJURIES !== "false",
  AUTOMATED_BETTING: import.meta.env.VITE_ENABLE_AUTO_BETTING === "true",
  ADVANCED_ANALYTICS:
    import.meta.env.VITE_ENABLE_ADVANCED_ANALYTICS !== "false",
  DEBUG_MODE: import.meta.env.NODE_ENV === "development",
};

// Validation rules for API responses
export const VALIDATION_RULES = {
  MAX_RESPONSE_SIZE: 50 * 1024 * 1024, // 50MB
  MIN_CONFIDENCE_THRESHOLD: 0.6,
  MAX_ODDS_VALUE: 50.0,
  MIN_ODDS_VALUE: 1.01,
  MAX_PREDICTION_AGE: 300000, // 5 minutes
  REQUIRED_FIELDS: {
    ODDS: ["eventId", "market", "odds", "timestamp"],
    PREDICTION: ["confidence", "prediction", "timestamp"],
    PLAYER_STATS: ["playerId", "stats", "gameId", "timestamp"],
  },
};

// Export utility function to get endpoint by name
export const getApiEndpoint = (
  name: keyof typeof API_ENDPOINTS,
): ApiEndpoint => {
  const endpoint = API_ENDPOINTS[name];
  if (!endpoint) {
    throw new Error(`API endpoint '${name}' not found`);
  }
  return endpoint;
};

// Export utility function to check if API is available
export const isApiAvailable = (name: keyof typeof API_ENDPOINTS): boolean => {
  const endpoint = API_ENDPOINTS[name];
  return !!(
    endpoint &&
    endpoint.baseUrl &&
    (endpoint.apiKey || name === "ESPN")
  );
};

// Export utility function to build API URL
export const buildApiUrl = (
  endpointName: keyof typeof API_ENDPOINTS,
  path: string,
  params?: Record<string, string | number>,
): string => {
  const endpoint = getApiEndpoint(endpointName);
  let url = `${endpoint.baseUrl}`;

  if (endpoint.version) {
    url += `/${endpoint.version}`;
  }

  url += path;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }

  return url;
};

// Default export with all configurations
export default {
  API_ENDPOINTS,
  CACHE_CONFIG,
  SPORTS_CONFIG,
  MARKET_TYPES,
  BOOKMAKERS,
  API_STATUS,
  REQUEST_PRIORITIES,
  FEATURE_FLAGS,
  VALIDATION_RULES,
  getApiEndpoint,
  isApiAvailable,
  buildApiUrl,
};
