

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_WS_RECONNECT_ATTEMPTS: string;
  readonly VITE_WS_RECONNECT_INTERVAL: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_DAILY_FANTASY_API_KEY: string;
  readonly VITE_SPORTS_RADAR_API_KEY: string;
  readonly VITE_THEODDS_API_KEY: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_CACHE_DURATION: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_SENTRY_DSN: string;
  // add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 