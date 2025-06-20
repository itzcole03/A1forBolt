

Object.defineProperty(globalThis, 'import', {
  value: {},
  writable: true,
});

Object.defineProperty(globalThis, 'import.meta', {
  value: {
    env: {
      VITE_DAILY_FANTASY_API_KEY: 'test-key',
      VITE_SPORTS_RADAR_API_KEY: 'test-key',
      VITE_THEODDS_API_KEY: 'test-key',
      VITE_NODE_ENV: 'test',
      VITE_API_TIMEOUT: '30000',
      VITE_CACHE_DURATION: '300000',
      VITE_LOG_LEVEL: 'info',
      VITE_ENABLE_ANALYTICS: 'true',
      VITE_ENABLE_ERROR_REPORTING: 'true',
      VITE_SENTRY_DSN: '',
      VITE_STOP_LOSS: '0',
      // Add more as needed
    }
  },
  writable: true,
}); 