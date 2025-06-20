/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Core API URLs
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;

  // Alpha1 External API Keys and Endpoints
  readonly VITE_SPORTRADAR_API_KEY: string;
  readonly VITE_SPORTRADAR_API_ENDPOINT: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_WEATHER_API_URL: string;
  readonly VITE_INJURY_API_KEY: string;
  readonly VITE_INJURY_API_URL: string;
  readonly VITE_ODDS_API_KEY: string;
  readonly VITE_ODDS_API_URL: string;
  readonly VITE_ESPN_API_KEY: string;
  readonly VITE_ESPN_API_URL: string;
  readonly VITE_DAILYFANTASY_API_KEY: string;
  readonly VITE_DAILYFANTASY_API_URL: string;
  readonly VITE_SOCIAL_API_KEY: string;
  readonly VITE_SOCIAL_API_URL: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_WEBSOCKET: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;

  // Performance
  readonly VITE_API_CACHE_DURATION: string;
  readonly VITE_WEBSOCKET_RECONNECT_INTERVAL: string;

  // Environment
  readonly NODE_ENV: string;
  readonly VITE_APP_VERSION: string;
  // Add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
