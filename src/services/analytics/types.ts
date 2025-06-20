export interface RawPlayerData {
  stats: any[];
  injuries: any[];
  news: any[];
  gameLog: any[];
  teamStats: any;
  opponentStats: any;
}

export interface FeatureConfig {
  rollingWindows: number[];
  trendPeriods: number[];
  seasonalityPeriods: number[];
  interactionDepth: number;
  minSamplesForFeature: number;
  featureSelectionThreshold: number;
  maxFeatures: number;
  validationThreshold: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  monitoringEnabled: boolean;
  logging: FeatureLoggerConfig;
}

export interface EngineeredFeatures {
  numerical: Record<string, number[]>;
  categorical: Record<string, string[]>;
  temporal: Record<string, number[]>;
  derived: Record<string, number[]>;
  metadata: FeatureMetadata;
}

export interface FeatureValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FeatureQualityMetrics {
  completeness: number;
  consistency: number;
  relevance: number;
  stability: number;
  timestamp: number;
}

export interface FeatureMetadata {
  featureNames: string[];
  featureTypes: Record<string, string>;
  scalingParams: Record<string, { mean: number; std: number }>;
  encodingMaps: Record<string, Record<string, number>>;
  lastUpdated: string;
}

export interface FeatureSelectionResult {
  numerical: string[];
  categorical: string[];
  temporal: string[];
  derived: string[];
  importance: Record<string, number>;
}

export interface FeatureTransformationResult {
  numerical: Record<string, number[]>;
  categorical: Record<string, string[]>;
  temporal: Record<string, number[]>;
  derived: Record<string, number[]>;
  metadata: {
    transformations: Record<string, string>;
    parameters: Record<string, any>;
  };
}

export interface FeatureCacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  cleanupInterval: number;
}

export interface FeatureMonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  maxMetricsHistory: number;
  alertThresholds: {
    completeness: number;
    consistency: number;
    relevance: number;
    stability: number;
    processingTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

export interface FeatureStoreConfig {
  type: 'local' | 'remote';
  path?: string;
  connectionString?: string;
  backupEnabled: boolean;
  backupInterval: number;
}

export interface FeatureRegistryConfig {
  path: string;
  type: 'local' | 'remote';
  backupEnabled: boolean;
  backupInterval: number;
  syncEnabled: boolean;
  syncInterval: number;
}

export interface FeatureLoggerConfig {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logFormat: 'json' | 'text';
  logOutput: 'console' | 'file';
  logFile: string;
  maxLogSize: number;
  maxLogFiles: number;
}
