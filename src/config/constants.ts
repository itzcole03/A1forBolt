// Environment Detection
const getBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // If we're in development (localhost)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:8000`;
    }

    // If we're in production or using a custom domain
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }

  // Default fallback for SSR or non-browser environments
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
};

// API Configuration
export const API_BASE_URL = getBaseUrl();

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ML_PREDICTIONS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_ADVANCED_METRICS: true,
};

// WebSocket Configuration
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  getWebSocketUrl: () => {
    const baseUrl = API_BASE_URL.replace(/^http/, "ws");
    return `${baseUrl}/ws`;
  },
};

// ML Configuration
export const ML_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.6,
  MAX_FEATURES: 10,
  UPDATE_INTERVAL: 300000, // 5 minutes
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  MAX_INSIGHTS_DISPLAY: 5,
};
