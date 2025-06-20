import {
  Sport,
  PropType,
  AlertType,
  AlertSeverity,
  EntryStatus,
  LineupType,
} from './common.js';

/**
 * SHAP (SHapley Additive exPlanations) value vector for model explainability
 */
export interface ShapVector {
  [featureName: string]: number;
}

/**
 * Game context information for model predictions
 */
export interface GameContext {
  gameId?: string;
  venue?: string;
  homeTeam?: string;
  awayTeam?: string;
  date?: string;
  weather?: WeatherData;
  isPlayoffs?: boolean;
  gameType?: 'regular' | 'playoff' | 'preseason';
  seasonYear?: number;
  gameNumber?: number;
  metadata?: Record<string, unknown>;
}

// Define BetType, BetResult, BetRecord here if needed for type references
// Example placeholder types (replace with real definitions as needed):
export type BetType = 'SINGLE' | 'PARLAY' | 'ROUND_ROBIN';
/**
 * Result of a bet. Must match AnalyticsService usage.
 */
export type BetResult = 'WIN' | 'LOSS' | 'PUSH' | 'CANCELLED' | 'PENDING';

/**
 * Strictly typed weather data interface for ALPHA1.
 */
export interface WeatherData {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    conditions: string;
    precipitation: number;
    visibility: number;
    pressure: number;
  };
  forecast: {
    timestamp: string;
    temperature: number;
    conditions: string;
    windSpeed: number;
    precipitation: number;
  }[];
  alerts: {
    type: string;
    severity: string;
    description: string;
    startTime: string;
    endTime: string;
  }[];
}

/**
 * Represents a single bet placed by a user, with all analytics fields.
 */
export interface BetRecord {
  id: string;
  userId: string;
  betType: BetType;
  amount: number;
  stake: number;
  odds: number;
  result: BetResult;
  profitLoss?: number;
  placedAt: number;
  settledAt?: number;
  playerId?: string;
  metric?: string;
  opportunityId?: string;
  metadata?: {
    closingOdds?: number;
    clv?: number;
    settlementTime?: number;
    [key: string]: unknown;
  };
  details?: Record<string, unknown>;
}

// Core Types
export interface TimestampedData {
  id?: string;
  timestamp: number;
  value?: number;
  predicted?: number;
  data?: unknown;
  metadata?: Record<string, unknown>;
  type?: string;
  source?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  metadata: Record<string, unknown>;
  read: boolean;
  acknowledged: boolean;
}

export interface PerformanceMetrics {
  totalBets: number;
  winRate: number;
  roi: number;
  profitLoss: number;
  clvAverage: number;
  edgeRetention: number;
  kellyMultiplier: number;
  marketEfficiencyScore: number;
  averageOdds: number;
  maxDrawdown: number;
  sharpeRatio: number;
  betterThanExpected: number;
  timestamp: number;
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    swap: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    latency: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    iops: number;
  };
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    transactionsPerSecond: number;
  };
  errorRate: number;
  uptime: number;
  predictionId: string;
  confidence: number;
  riskScore: number;
  duration?: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  predictions: number;
  hits?: number;
  misses?: number;
  roi?: number;
  successRate?: number[];
  dates?: string[];
}

export interface MLInsight {
  factor: string;
  impact: number;
  confidence: number;
  description: string;
}

export interface OddsUpdate {
  id: string;
  propId: string;
  bookId: string;
  bookName: string;
  odds: number;
  maxStake: number;
  timestamp: number;
  oldOdds?: number;
  newOdds?: number;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  preferences: Preferences;
  roles: string[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  title?: string;
}

export interface WSMessage {
  type: string;
  data: string | number | boolean | object;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxRetries: number;
}

export interface SystemConfig {
  features: string[];
  maxConcurrentRequests: number;
  cacheTimeout: number;
  strategy: string;
  performanceMonitoring?: {
    enabled: boolean;
    sampleRate: number;
    retentionPeriod: number;
  };
  errorHandling?: {
    maxRetries: number;
    backoffFactor: number;
    timeoutMs: number;
  };
  eventBus?: {
    maxListeners: number;
    eventTTL: number;
  };
  emergencyMode?: boolean;
  emergencyThresholds: {
    errorRate: number;
    latencyMs: number;
    memoryUsage: number;
  };
}

export interface PlayerProp {
  id: string;
  player: {
    id: string;
    name: string;
    team: {
      id: string;
      name: string;
      sport: Sport;
    };
  };
  type: PropType;
  line: number;
  odds: number;
  confidence: number;
  timestamp: number;
}

export interface Entry {
  id: string;
  userId: string;
  status: EntryStatus;
  type: LineupType;
  props: PlayerProp[];
  stake: number;
  potentialPayout: number;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  playerId: string;
  metric: string;
  currentOdds: number;
  predictedOdds: number;
  confidence: number;
  timestamp: number;
  expiryTime: number;
  correlationFactors: string[];
}

export interface MarketState {
  line: number;
  volume: number;
  movement: 'up' | 'down' | 'stable';
}

export interface MarketUpdate {
  id?: string;
  type?: string;
  timestamp: number;
  data: {
    playerId: string;
    metric: string;
    value: number;
    volume?: number;
    movement?: 'up' | 'down' | 'stable';
  };
  metadata?: Record<string, unknown>;
}

export interface MetricData {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export type MetricType =
  | 'POINTS'
  | 'REBOUNDS'
  | 'ASSISTS'
  | 'TOUCHDOWNS'
  | 'RUSHING_YARDS'
  | 'PASSING_YARDS';

export interface AnalysisResult {
  id: string;
  timestamp: number;
  confidence: number;
  risk_factors: string[];
  data: {
    historicalTrends: Array<{ trend: string; strength: number }>;
    marketSignals: Array<{ signal: string; strength: number }>;
  };
}

export interface ComponentMetrics {
  component: string;
  timestamp: number;
  value?: number;
  errorRate?: number;
  throughput?: number;
  resourceUsage?: {
    cpu: number;
    memory: number;
    network: number;
  };
  riskMitigation?: {
    riskLevel: string;
    mitigationStatus: string;
  };
  renderCount: number;
  renderTime: number;
  memoryUsage: number;
  errorCount: number;
  lastUpdate: number;
}

export interface ModelState {
  hits: number;
  misses: number;
  accuracy: number;
  lastUpdated: number;
}

export interface PredictionState {
  id: string;
  type: string;
  weight: number;
  confidence: number;
  lastUpdate: number;
  metadata: {
    predictions: number;
    accuracy: number;
    calibration: number;
  };
}

export interface State {
  data: {
    activeStreams: Map<string, { metrics: { errorCount: number } }>;
  };
}

export interface Preferences {
  defaultStake: number;
  riskTolerance: 'low' | 'medium' | 'high';
  favoriteLeagues: Sport[];
  notifications: {
    email: boolean;
    push: boolean;
    arbitrage: boolean;
    valueProps: boolean;
  };
  darkMode: boolean;
  defaultSport: Sport;
}

export interface HistoricalTrend {
  trend: string;
  strength: number;
}

export interface MarketSignal {
  signal: string;
  strength: number;
}

export interface Analysis {
  historicalTrends: Array<HistoricalTrend>;
  marketSignals: Array<MarketSignal>;
  riskFactors: string[];
  volatility?: number;
  marketVolatility?: number;
  correlationFactors?: string[];
}

/**
 * Represents a betting opportunity for analytics and tracking.
 */
export interface BettingOpportunity {
  id: string;
  propId?: string;
  type?: 'OVER' | 'UNDER';
  confidence?: number;
  expectedValue?: number;
  timestamp: number;
  edge?: number;
  marketState?: MarketState;
  analysis?: Analysis;
  [key: string]: unknown;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  opponent: string;
  gameTime: string;
  sport: Sport;
  fireCount?: string;
  winningProp?: {
    stat: string;
    line: number;
    type: PropType;
    percentage: number;
  };
  whyThisBet?: string;
}


/**
 * Strictly typed weather data interface for ALPHA1.
 */
export interface WeatherData {
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    conditions: string;
    precipitation: number;
    visibility: number;
    pressure: number;
  };
  forecast: {
    timestamp: string;
    temperature: number;
    conditions: string;
    windSpeed: number;
    precipitation: number;
  }[];
  alerts: {
    type: string;
    severity: string;
    description: string;
    startTime: string;
    endTime: string;
  }[];
}

export type RiskTolerance = 'low' | 'medium' | 'high';
export type RiskToleranceEnum = 'low' | 'medium' | 'high';

export interface ClvAnalysis {
  clvValue: number;
  edgeRetention: number;
  marketEfficiency: number;
}

export interface BettingDecision {
  id: string;
  type: BetType;
  stake: number;
  odds: number;
  confidence: number;
  shouldBet: boolean;
  metadata: {
    strategy: string;
    factors: string[];
    riskScore: number;
    propId?: string;
    playerId?: string;
  };
}

export interface BettingContext {
  bankroll: number;
  maxRiskPerBet: number;
  minOdds: number;
  maxOdds: number;
  odds: number;
  metrics: PerformanceMetrics;
  recentBets: BetRecord[];
  timestamp: number;
}

export interface Projection {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  opponent: string;
  sport: Sport;
  league: string;
  propType: PropType;
  line: number;
  overOdds: number;
  underOdds: number;
  timestamp: number;
  gameTime: string;
  status: 'active' | 'suspended' | 'settled';
  result?: number;
}

export interface PredictionUpdate {
  propId: string;
  prediction: {
    value: number;
    confidence: number;
    factors: string[];
  };
  timestamp: number;
}

export interface PredictionContext {
  playerId: string;
  metric: string;
  timestamp: number;
  marketState: MarketState;
  prediction?: PredictionUpdate;
  historicalData?: TimestampedData[];
}

export interface DataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsReport {
  timestamp: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  predictions: {
    total: number;
    successful: number;
    failed: number;
  };
  performance: {
    averageResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

// Event map for type-safe event handling
export interface EventMap {
  /**
   * Emitted when a game's status is updated from ESPNService.
   */
  'game:status': { game: import('../services/ESPNService.js').ESPNGame; timestamp: number };
  /**
   * Emitted when a player's data is updated from ESPNService.
   */
  'player:update': { player: import('../services/ESPNService.js').ESPNPlayer; timestamp: number };
  /**
   * Emitted when Sportradar injuries are updated.
   */
  'injury:update': { injuries: import('../services/SportradarService.js').SportradarInjury[]; timestamp: number };
  /**
   * Emitted when Sportradar match is updated.
   */
  'match:update': { match: import('../services/SportradarService.js').SportradarMatchupData; timestamp: number };
  /**
   * Emitted when news headlines are updated.
   */
  'news:update': { headlines: import('../types.js').ESPNHeadline[]; timestamp: number };
  /**
   * Emitted when weather data is updated.
   */
  'weather:update': { weather: WeatherData; timestamp: number };
  /**
   * Emitted when weather alerts are updated.
   */
  'weather:alerts': { alerts: WeatherData['alerts']; timestamp: number };
  /**
   * Emitted when historical weather data is returned.
   */
  'weather:historical': { weather: WeatherData; timestamp: number };
  bettingDecision: BettingDecision;
  alert: Alert;
  oddsUpdate: OddsUpdate;
  error: Error;
  'trace:completed': {
    id: string;
    name: string;
    duration: number;
    error?: string;
    metadata?: Record<string, unknown>;
  };
  'metric:recorded': {
    name: string;
    value: number;
    timestamp: number;
    labels?: Record<string, string>;
    tags?: Record<string, string>;
  };
  'config:updated': {
    section: string;
    timestamp: number;
    config?: unknown;
    values?: Record<string, unknown>;
  };
  'monitor:alert': {
    id: string;
    severity: AlertSeverity;
    message: string;
    timestamp: number;
    component: string;
    context: Record<string, unknown>;
    acknowledged: boolean;
  };
  'betting:result': {
    betId: string;
    result: BetResult;
    timestamp: number;
    metadata?: Record<string, unknown>;
  };
  'strategy:update': {
    strategyId: string;
    status: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  };
  'config:initialized': { timestamp: number; status: string };
  'config:loaded': { timestamp: number; status: string };
  'feature:update': FeatureFlag;
  'feature:updated': { featureId: string; timestamp: number };
  'experiment:update': ExperimentConfig;
  'experiment:updated': { experimentId: string; timestamp: number };
  'market:update': MarketUpdate;
  'prediction:update': Prediction;
  'prediction:error': Error;
  'risk:update': { profileId: string };
  'risk:assessment': {
    predictionId: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    maxStake: number;
    timestamp: number;
  };
  'risk:profile:updated': { profileId: string };
  'risk:profile:activated': { profileId: string };
  'model:update': string;
  'error:occurred': Error;
  'performance:metric': {
    name: string;
    value: number;
    timestamp: number;
  };
  'data:updated': { sourceId: string; data: { timestamp: number } };
  'dataSource:registered': { sourceId: string; name: string; timestamp: number };
  'dataSource:error': { sourceId: string; error: Error; timestamp: number };
  'monitor:alert:acknowledged': { alertId: string; timestamp: number };
  'risk:profile:created': { profileId: string };
  'risk:profile:deleted': { profileId: string };
  'risk:violation': {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    metadata: Record<string, unknown>;
  };
  'risk:rule:added': { profileId: string; ruleId: string };
  'risk:rule:updated': { profileId: string; ruleId: string };
  'risk:rule:deleted': { profileId: string; ruleId: string };
  'risk:rule:executed': { profileId: string; ruleId: string; context: Record<string, unknown> };
  'analytics:flushed': { count: number; timestamp: number };
  'analytics:config:updated': { config: Record<string, unknown>; timestamp: number };
  'analytics:cleanup': { timestamp: number };
  'cache:set': { key: string; timestamp: number; size: number; ttl: number };
  'cache:hit': { key: string; timestamp: number; hits: number };
  'cache:delete': { key: string; timestamp: number };
  'cache:clear': { source?: string; timestamp?: number };
  'cache:evict': { key: string; timestamp: number; reason: string };
  'cache:cleanup': { expiredCount: number; timestamp: number };
  'cache:config:updated': { config: Record<string, unknown>; timestamp: number };
  'cache:shutdown': { timestamp: number };
  'strategy:recommendation': BettingOpportunity;
  'strategy:opportunities': DataPoint[];
  'data-integration-completed': { timestamp: number; metrics: Record<string, unknown> };
  'data-source-metric-updated': {
    sourceId: string;
    latency: number;
    errorRate: number;
    lastUpdate: number;
    dataQuality: number;
  };
  'data:integrated': { integratedData: Record<string, unknown>; timestamp: number };
  'cache:cleared': { source: string };
  'config:update': ConfigUpdate;
  'bet:placed': { data: { amount: number } };
  'bet:settled': { data: { amount: number; outcome: 'win' | 'loss' } };
  'analytics:report': AnalyticsReport;
  'model:version:updated': {
    modelId: string;
    version: {
      id: string;
      version: string;
      timestamp: number;
      metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
      };
      features: string[];
      metadata: {
        trainingDataSize: number;
        trainingDuration: number;
        framework: string;
        hyperparameters: Record<string, unknown>;
      };
    };
    totalVersions: number;
  };
  'model:version:check': {
    modelId: string;
    currentVersion: {
      id: string;
      version: string;
      timestamp: number;
      metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
      };
      features: string[];
      metadata: {
        trainingDataSize: number;
        trainingDuration: number;
        framework: string;
        hyperparameters: Record<string, unknown>;
      };
    };
  };
  'prediction:validated': {
    predictionId: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metrics: {
      confidence: number;
      dataFreshness: number;
      signalQuality: number;
    };
    context?: Record<string, unknown>;
  };
  'websocket:connected': { url: string };
  'websocket:disconnected': { url: string };
  'websocket:error': { url: string; error: unknown };
  'websocket:reconnectFailed': { url: string };
  'error:reported': {
    error: Error;
    context?: Record<string, unknown>;
  };
  'error:handled': {
    error: Error;
    metrics: ErrorMetrics;
    emergency: boolean;
  };
  'error:emergency': {
    error: Error;
    timestamp: number;
  };
  'cache:miss': { key: string; timestamp: number; hits: number };
  'model:version:rolled_back': {
    modelId: string;
    targetVersion: string;
    remainingVersions: number;
    timestamp: number;
  };
  'model:version:compared': {
    modelId: string;
    version1: string;
    version2: string;
    timestamp: number;
  };
  'websocket:recovery:succeeded': {
    strategy: string;
    duration: number;
    metrics: {
      totalRecoveryAttempts: number;
      successfulRecoveries: number;
      failedRecoveries: number;
      averageRecoveryTime: number;
      lastRecoveryTime: number;
      recoveryHistory: Array<{
        timestamp: number;
        strategy: string;
        success: boolean;
        duration: number;
      }>;
    };
  };
  'websocket:recovery:failed': {
    connectionId: string;
    strategy: string;
    error: Error;
  };
  'websocket:batch:sent': {
    batchSize: number;
    totalSize: number;
    compressionRatio: number;
    timestamp: number;
  };
  'websocket:server:health': {
    server: string;
    metrics: {
      connections: number;
      latency: number;
      errorRate: number;
      lastUpdate: number;
    };
    timestamp: number;
  };
  'websocket:server:error': {
    server: string;
    error: unknown;
    timestamp: number;
  };
  'websocket:connection:created': {
    server: string;
    connectionId: string;
    timestamp: number;
  };
  'websocket:server:recovered': {
    server: string;
    timestamp: number;
    recoveryTime?: number;
  };
  'websocket:key:rotated': {
    timestamp: number;
    oldKey: string;
    newKey: string;
  };
  'websocket:metrics:updated': Record<string, unknown>;
  'websocket:security:alert': {
    id: string;
    timestamp: number;
    type: 'encryption' | 'connection' | 'rate_limit' | 'key_rotation' | 'error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: Record<string, unknown>;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
  };
  /**
   * Emitted when daily fantasy projections are updated.
   */
  'daily-fantasy:data-updated': {
    projections: import('../adapters/DailyFantasyAdapter').DailyFantasyData['projections'];
    timestamp: number;
  };
  /**
   * Emitted when social sentiment data is updated.
   */
  'social-sentiment-updated': {
    data: import('../adapters/SocialSentimentAdapter').SocialSentimentData[];
    timestamp: number;
  };
}

export type EventTypes = keyof EventMap;

export interface StreamState {
  id: string;
  type: string;
  source: string;
  isActive: boolean;
  lastUpdate: number;
  metrics: {
    throughput: number;
    latency: number;
    errorCount: number;
  };
}

export interface DataStream<T = TimestampedData> {
  id: string;
  type: string;
  source: string;
  isActive: boolean;
  lastUpdate: number;
  confidence: number;
  metrics: {
    throughput: number;
    latency: number;
    errorCount: number;
  };
  getLatestData(): T | undefined;
  subscribe(callback: (data: T) => void): () => void;
  unsubscribe(callback: (data: T) => void): void;
}

export interface DataState {
  activeStreams: Map<string, DataStream<TimestampedData>>;
  lastUpdate: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: Error;
}

export interface AppConfig {
  system: {
    environment: string;
    logLevel: string;
    debug: boolean;
  };
  apis: {
    prizePicks?: {
      baseUrl: string;
      apiKey: string;
    };
    espn: {
      baseUrl: string;
      apiKey: string;
    };
    socialSentiment: {
      baseUrl: string;
      apiKey: string;
    };
  };
  features: {
    [key: string]: boolean;
  };
  experiments: {
    [key: string]: {
      enabled: boolean;
      variants: string[];
      distribution: number[];
    };
  };
}

export interface ConfigUpdate {
  section: string;
  values: Record<string, unknown>;
  timestamp?: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  lastUpdated?: number;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: string[];
  distribution: Record<string, number>;
  startDate: number;
  endDate: number;
  status: 'active' | 'inactive' | 'completed';
  lastUpdated?: number;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  priority: number;
}

export interface ThresholdConfig {
  id: string;
  maxStakePerBet?: number;
  maxDailyLoss?: number;
  maxExposurePerStrategy?: number;
  maxLoadTime?: number;
  maxResponseTime?: number;
  minCacheHitRate?: number;
  updateInterval: number;
}

export interface StrategyConfig {
  riskTolerance?: number;
  minConfidence?: number;
  maxExposure?: number;
  hedgingEnabled?: boolean;
  adaptiveStaking?: boolean;
  profitTarget: number;
  stopLoss: number;
  confidenceThreshold?: number;
  kellyFraction?: number;
  initialBankroll?: number;
  minStake?: number;
  maxStakeLimit?: number;
  maxExposureLimit?: number;
  riskToleranceLevel?: number;
  hedgingThreshold?: number;
  updateInterval: number;
  id?: string;
}

/**
 * Represents a risk assessment for a bet or opportunity.
 */
export interface RiskAssessment {
  id: string;
  timestamp: number;
  riskLevel: number;
  maxExposure: number;
  confidenceScore: number;
  volatilityScore: number;
  correlationFactors: string[];
}

export interface StrategyRecommendation {
  id: string;
  type?: 'OVER' | 'UNDER';
  confidence: number;
  timestamp: number;
  parameters?: {
    stake: number;
    expectedValue: number;
  };
  status?: 'active' | 'closed' | 'pending';
  lastUpdate?: number;
  strategyId?: string;
  recommendedStake?: number;
  entryPoints?: number[];
  exitPoints?: number[];
  hedgingRecommendations?: string[];
  opportunityId?: string;
  riskAssessment?: RiskAssessment;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

export interface BettingStrategy {
  id: string;
  opportunityId: string;
  riskAssessment: RiskAssessment;
  recommendedStake: number;
  entryPoints: number[];
  exitPoints: number[];
  hedgingRecommendations: string[];
  timestamp: number;
  status: 'active' | 'closed' | 'pending';
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

export interface ModelOutput {
  type: string;
  prediction: number;
  confidence: number;
  features: Record<string, number>;
  timestamp: number;
  metadata?: unknown;
}

export interface LineMovement {
  id: string;
  timestamp: number;
  oldValue: number;
  newValue: number;
  velocity?: number;
  volume?: number;
  source?: string;
  confidence?: number;
  metadata?: unknown;
}

export interface BettingContext {
  [key: string]: unknown;
}

export type ErrorCategory =
  | 'SYSTEM'
  | 'VALIDATION'
  | 'NETWORK'
  | 'AUTH'
  | 'BUSINESS'
  | 'DATABASE'
  | 'CONFIGURATION'
  | 'MODEL';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorContext {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  details: Record<string, unknown>;
  stack?: string;
  userContext?: {
    userId?: string;
    sessionId?: string;
    action?: string;
  };
  recoveryStrategy?: {
    type: 'retry' | 'fallback' | 'circuit-breaker';
    maxRetries?: number;
    timeout?: number;
  };
  component?: string;
  context?: Record<string, unknown>;
  retryable?: boolean;
  metrics?: {
    retryCount: number;
    recoveryTime?: number;
  };
}

export interface RiskConfig {
  maxExposure: number;
  maxExposurePerBet: number;
  maxExposurePerPlayer: number;
  maxExposurePerMetric: number;
  maxActiveBets: number;
  minBankroll: number;
  maxBankrollPercentage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  volatilityThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface ErrorMetrics {
  count: number;
  lastError: Error;
  timestamp: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
}

export interface Prediction {
  id: string;
  event: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  metadata: {
    modelVersion: string;
    features: string[];
    processingTime: number;
  };
}

export interface RiskProfile {
  id: string;
  name: string;
  riskToleranceLevel: 'low' | 'medium' | 'high';
  maxRiskScore: number;
  minConfidenceThreshold: number;
  maxStake?: number;
  maxExposure: number;
  maxDrawdown: number;
  stopLoss: number;
  takeProfit: number;
  hedgingEnabled: boolean;
  diversificationRules: {
    maxPositionsPerMarket: number;
    maxPositionsTotal: number;
    minDiversificationScore: number;
  };
  customRules: Array<{
    id: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>;
}

export interface ErrorDetails {
  action: string;
  predictionId?: string;
  profileId?: string;
  data?: unknown;
}
