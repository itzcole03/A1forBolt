import axios from 'axios';
import { FeatureFlags } from '../types';
import { UnifiedApplicationConfig, getInitializedUnifiedConfig } from '../core/UnifiedConfig';
import { unifiedMonitor } from '../core/UnifiedMonitor';

// import { get } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches the main application configuration from the backend.
 * This includes feature flags, API endpoints, versioning info, etc.
 * Expected backend response (from /api/config/app defined in backend routes/settings.py)
 * should match the structure of UnifiedApplicationConfig.
 * Example:
 * {
 *   "version": "0.1.0",
 *   "appName": "AI Sports Betting Analytics API",
 *   "environment": "development",
 *   "featureFlags": { "newDashboardLayout": true, "advancedAnalytics": false },
 *   "experiments": [],
 *   "apiEndpoints": { "users": "/api/users", "prizepicks": "/api/prizepicks" },
 *   "sentryDsn": "your_backend_sentry_dsn_if_any"
 * }
 */
export const fetchAppConfig = async (): Promise<UnifiedApplicationConfig> => {
  const trace = unifiedMonitor.startTrace('configService.fetchAppConfig', 'http.client');
  try {
    // Use plain Axios for the initial config fetch to avoid UnifiedConfig dependency
    const response = await axios.get<UnifiedApplicationConfig>(`${API_BASE_URL}/api/config/app`);
    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }
    return response.data;
  } catch (error: any) {
    unifiedMonitor.reportError(error, { service: 'configService', operation: 'fetchAppConfig' });
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    throw error;
  }
};

/**
 * Checks if a specific feature flag is enabled.
 * This function now relies on the UnifiedConfig which should be initialized with backend data.
 */
export const isFeatureEnabled = async (flagName: keyof FeatureFlags): Promise<boolean> => {
  try {
    let config;
    try {
      config = getInitializedUnifiedConfig();
    } catch (e) {
      throw new Error('Feature flag requested before UnifiedConfig was initialized. Ensure initializeUnifiedConfig() is awaited before any feature flag checks.');
    }
    return config.isFeatureEnabled(flagName);
  } catch (error) {
    unifiedMonitor.reportError(error, { service: 'configService', operation: 'isFeatureEnabled', flagName });
    return false;
  }
};

/**
 * Fetches all feature flags.
 */
export const fetchAllFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    let config;
    try {
      config = getInitializedUnifiedConfig();
    } catch (e) {
      throw new Error('Feature flags requested before UnifiedConfig was initialized. Ensure initializeUnifiedConfig() is awaited before any feature flag checks.');
    }
    return config.getAllFeatureFlags();
  } catch (error) {
    unifiedMonitor.reportError(error, { service: 'configService', operation: 'fetchAllFeatureFlags' });
    return {} as FeatureFlags;
  }
};

export const configService = {
  fetchAppConfig,
  isFeatureEnabled,
  fetchAllFeatureFlags,
}; 