// Model Status Types
export interface ModelStatus {
  id: string;
  name: string;
  status: 'active' | 'training' | 'error';
  confidence: number;
  lastUpdate: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

// Prediction Types
export interface Prediction {
  id: string;
  timestamp: string;
  sport: string;
  event: string;
  market: string;
  selection: string;
  confidence: number;
  odds: number;
  expectedValue: number;
  kellyFraction: number;
  modelBreakdown: {
    [key: string]: number;
  };
}

// MoneyMaker Tab Types
export type MoneyMakerTab = 'unified' | 'prizepicks' | 'ml' | 'config' | 'results';

export interface MoneyMakerTabConfig {
  id: MoneyMakerTab;
  label: string;
  icon: string;
}

// MoneyMaker Props
export interface MoneyMakerProps {
  predictions?: Prediction[];
  opportunities?: BettingOpportunity[];
  onPlaceBet?: (betData: any) => Promise<any>;
  initialTab?: MoneyMakerTab;
}

// MoneyMaker State
export interface MoneyMakerState {
  activeTab: MoneyMakerTab;
  mlModels: ModelStatus[];
  predictions: Prediction[];
  opportunities: BettingOpportunity[];
  isLoading: boolean;
  error: string | null;
}

// MoneyMaker Actions
export interface MoneyMakerActions {
  setActiveTab: (tab: MoneyMakerTab) => void;
  setMLModels: (models: ModelStatus[]) => void;
  setPredictions: (predictions: Prediction[]) => void;
  setOpportunities: (opportunities: BettingOpportunity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadInitialData: () => Promise<void>;
  handlePlaceBet: (betData: any) => Promise<any>;
}

// MoneyMaker Configuration Types
export interface MoneyMakerConfig {
  investmentAmount: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number;
  confidenceThreshold: number;
  modelWeights: {
    [key: string]: number;
  };
  arbitrageThreshold: number;
  maxExposure: number;
  correlationLimit: number;
  strategy: {
    type: 'balanced' | 'aggressive' | 'conservative';
    maxLegs: number;
    minOdds: number;
    maxOdds: number;
    correlationThreshold: number;
  };
  portfolio: {
    maxSize: number;
    rebalanceThreshold: number;
    stopLoss: number;
    takeProfit: number;
  };
}

// MoneyMaker Prediction Types
export interface MoneyMakerPrediction {
  eventId: string;
  marketType: string;
  selection: string;
  odds: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  modelContributions: {
    [key: string]: number;
  };
  // Enhanced prediction data
  uncertainty: {
    epistemic: number;
    aleatoric: number;
    total: number;
  };
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  riskProfile: {
    level: RiskLevel;
    score: number;
    factors: Array<{
      name: string;
      impact: number;
      weight: number;
    }>;
  };
  explanation: {
    shapValues: Array<{
      feature: string;
      value: number;
      impact: number;
    }>;
    counterfactuals: Array<{
      feature: string;
      currentValue: number;
      alternativeValue: number;
      impact: number;
    }>;
    decisionPath: string[];
    featureImportance: Record<string, number>;
  };
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    drift: {
      score: number;
      lastUpdated: number;
    };
  };
  metadata: {
    timestamp: number;
    processingTime: number;
    dataFreshness: number;
    signalQuality: number;
    modelVersion: string;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

// MoneyMaker Portfolio Types
export interface MoneyMakerPortfolio {
  id: string;
  legs: MoneyMakerPrediction[];
  totalOdds: number;
  expectedValue: number;
  riskScore: number;
  confidence: number;
  arbitrageOpportunity: boolean;
  optimalStakes: {
    [key: string]: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// MoneyMaker Performance Metrics
export interface MoneyMakerMetrics {
  totalBets: number;
  winningBets: number;
  totalProfit: number;
  roi: number;
  averageOdds: number;
  successRate: number;
  riskAdjustedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winStreak: number;
  lossStreak: number;
}

// MoneyMaker Store State
export interface MoneyMakerStoreState {
  config: MoneyMakerConfig;
  predictions: MoneyMakerPrediction[];
  portfolios: MoneyMakerPortfolio[];
  metrics: MoneyMakerMetrics;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string;
  filters: {
    modelId?: string;
    minConfidence?: number;
    maxConfidence?: number;
    sport?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    riskLevel?: RiskLevel;
    minExpectedValue?: number;
  };
  sort: {
    field: keyof MoneyMakerPrediction;
    direction: 'asc' | 'desc';
  };
}

// MoneyMaker Store Actions
export interface MoneyMakerStoreActions {
  updateConfig: (config: Partial<MoneyMakerConfig>) => void;
  addPrediction: (prediction: MoneyMakerPrediction) => void;
  updatePrediction: (id: string, prediction: Partial<MoneyMakerPrediction>) => void;
  addPortfolio: (portfolio: MoneyMakerPortfolio) => void;
  updatePortfolio: (id: string, portfolio: Partial<MoneyMakerPortfolio>) => void;
  updateMetrics: (metrics: Partial<MoneyMakerMetrics>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  fetchPredictions: () => Promise<void>;
  fetchPredictionDetails: (predictionId: string) => Promise<void>;
  fetchModelMetrics: (modelId: string) => Promise<void>;
  updateFilters: (filters: Partial<MoneyMakerStoreState['filters']>) => void;
  updateSort: (sort: MoneyMakerStoreState['sort']) => void;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskProfile {
  id?: string;
  level: RiskLevel;
  maxStakePercentage: number;
  maxConcurrentBets: number;
  minConfidence: number;
  maxKellyFraction: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  diversificationRules: {
    maxBetsPerSport: number;
    maxBetsPerMarket: number;
    maxExposurePerEvent: number;
  };
}

export interface BettingOpportunity {
  id: string;
  eventId: string;
  marketType: string;
  selection: string;
  odds: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  timestamp: number;
  status: 'active' | 'expired' | 'matched';
}

export interface Uncertainty {
  epistemic: number;
  aleatoric: number;
  total: number;
}

export interface Explanation {
  shapValues: Array<{
    feature: string;
    value: number;
    impact: number;
  }>;
  counterfactuals: Array<{
    feature: string;
    currentValue: number;
    alternativeValue: number;
    impact: number;
  }>;
  decisionPath: string[];
  featureImportance: Record<string, number>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  drift: {
    score: number;
    lastUpdated: number;
  };
}
