import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { predictionService } from '@/services/predictionService';
import {
  MoneyMakerState,
  MoneyMakerActions,
  MoneyMakerTab,
  ModelStatus,
  MoneyMakerPrediction,
  BettingOpportunity,
  MoneyMakerStoreState,
  MoneyMakerStoreActions,
  MoneyMakerConfig,
  MoneyMakerPortfolio,
  MoneyMakerMetrics,
  Uncertainty,
  Explanation,
  RiskProfile,
  ModelMetrics,
  RiskLevel,
} from '@/types/money-maker';

// Define local interfaces for prediction service types
interface PredictionFilter {
  modelId?: string;
  minConfidence?: number;
  maxConfidence?: number;
  sport?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  riskLevel?: 'low' | 'medium' | 'high';
  minExpectedValue?: number;
}

interface PredictionSort {
  field: keyof MoneyMakerPrediction;
  direction: 'asc' | 'desc';
}

const initialState: MoneyMakerStoreState = {
  config: {
    investmentAmount: 1000,
    riskProfile: 'moderate',
    timeHorizon: 30,
    confidenceThreshold: 0.7,
    modelWeights: {
      xgboost_v1: 0.6,
      lightgbm_v2: 0.4,
    },
    arbitrageThreshold: 0.05,
    maxExposure: 0.2,
    correlationLimit: 0.7,
    strategy: {
      type: 'balanced',
      maxLegs: 3,
      minOdds: 1.5,
      maxOdds: 5.0,
      correlationThreshold: 0.3,
    },
    portfolio: {
      maxSize: 10,
      rebalanceThreshold: 0.1,
      stopLoss: 0.15,
      takeProfit: 0.25,
    },
  },
  predictions: [],
  portfolios: [],
  metrics: {
    totalBets: 0,
    winningBets: 0,
    totalProfit: 0,
    roi: 0,
    averageOdds: 0,
    successRate: 0,
    riskAdjustedReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winStreak: 0,
    lossStreak: 0,
  },
  isLoading: false,
  error: null,
  lastUpdate: new Date().toISOString(),
  filters: {},
  sort: {
    field: 'confidence',
    direction: 'desc',
  },
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useMoneyMakerStore = create<MoneyMakerStoreState & MoneyMakerStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        updateConfig: (config: Partial<MoneyMakerConfig>) =>
          set(state => ({
            config: {
              ...state.config,
              ...config,
            },
            lastUpdate: new Date().toISOString(),
          })),

        addPrediction: (prediction: MoneyMakerPrediction) =>
          set(state => ({
            predictions: [...state.predictions, prediction],
            lastUpdate: new Date().toISOString(),
          })),

        updatePrediction: (id: string, updates: Partial<MoneyMakerPrediction>) =>
          set(state => ({
            predictions: state.predictions.map(p => (p.eventId === id ? { ...p, ...updates } : p)),
            lastUpdate: new Date().toISOString(),
          })),

        updatePredictionUncertainty: (id: string, uncertainty: Uncertainty) =>
          set(state => ({
            predictions: state.predictions.map(p =>
              p.eventId === id
                ? {
                    ...p,
                    uncertainty,
                    lastUpdate: new Date().toISOString(),
                  }
                : p
            ),
          })),

        updatePredictionExplanation: (id: string, explanation: Explanation) =>
          set(state => ({
            predictions: state.predictions.map(p =>
              p.eventId === id
                ? {
                    ...p,
                    explanation,
                    lastUpdate: new Date().toISOString(),
                  }
                : p
            ),
          })),

        updatePredictionRiskProfile: (id: string, riskProfile: RiskProfile) =>
          set(state => ({
            predictions: state.predictions.map(p =>
              p.eventId === id
                ? {
                    ...p,
                    riskProfile,
                    lastUpdate: new Date().toISOString(),
                  }
                : p
            ),
          })),

        updatePredictionModelMetrics: (id: string, modelMetrics: ModelMetrics) =>
          set(state => ({
            predictions: state.predictions.map(p =>
              p.eventId === id
                ? {
                    ...p,
                    modelMetrics,
                    lastUpdate: new Date().toISOString(),
                  }
                : p
            ),
          })),

        addPortfolio: (portfolio: MoneyMakerPortfolio) =>
          set(state => ({
            portfolios: [...state.portfolios, portfolio],
            lastUpdate: new Date().toISOString(),
          })),

        updatePortfolio: (id: string, portfolio: Partial<MoneyMakerPortfolio>) =>
          set(state => ({
            portfolios: state.portfolios.map(p => (p.id === id ? { ...p, ...portfolio } : p)),
            lastUpdate: new Date().toISOString(),
          })),

        updateMetrics: (metrics: Partial<MoneyMakerMetrics>) =>
          set(state => ({
            metrics: {
              ...state.metrics,
              ...metrics,
            },
            lastUpdate: new Date().toISOString(),
          })),

        setLoading: (loading: boolean) =>
          set(() => ({
            isLoading: loading,
            lastUpdate: new Date().toISOString(),
          })),

        setError: (error: string | null) =>
          set(() => ({
            error,
            lastUpdate: new Date().toISOString(),
          })),

        reset: () => set(initialState),

        // New actions for filtering and sorting
        setFilter: (filter: Partial<PredictionFilter>) =>
          set(state => ({
            filters: {
              ...state.filters,
              ...filter,
            },
            lastUpdate: new Date().toISOString(),
          })),

        setSort: (sort: PredictionSort) =>
          set(state => ({
            sort,
            lastUpdate: new Date().toISOString(),
          })),

        clearFilters: () =>
          set(state => ({
            filters: initialState.filters,
            lastUpdate: new Date().toISOString(),
          })),

        // New actions for prediction service integration
        fetchPredictions: async () => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          let retries = 0;
          let lastError: Error | null = null;

          while (retries < MAX_RETRIES) {
            try {
              const predictions = await predictionService.getPredictions(get().filters, get().sort);
              set(state => ({
                predictions,
                lastUpdate: new Date().toISOString(),
              }));
              setLoading(false);
              return;
            } catch (error) {
              lastError = error instanceof Error ? error : new Error('Unknown error');
              retries++;
              if (retries < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
                await sleep(delay);
              }
            }
          }

          setError(lastError?.message || 'Failed to fetch predictions');
          setLoading(false);
        },

        fetchPredictionDetails: async (predictionId: string) => {
          const { setLoading, setError, updatePrediction } = get();
          setLoading(true);
          setError(null);

          let retries = 0;
          let lastError: Error | null = null;

          while (retries < MAX_RETRIES) {
            try {
              const details = await predictionService.getPredictionDetails(predictionId);
              updatePrediction(predictionId, details);
              setLoading(false);
              return details;
            } catch (error) {
              lastError = error instanceof Error ? error : new Error('Unknown error');
              retries++;
              if (retries < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
                await sleep(delay);
              }
            }
          }

          setError(lastError?.message || 'Failed to fetch prediction details');
          setLoading(false);
          return null;
        },

        fetchModelMetrics: async (modelId: string) => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          let retries = 0;
          let lastError: Error | null = null;

          while (retries < MAX_RETRIES) {
            try {
              const metrics = await predictionService.getModelMetrics(modelId);
              setLoading(false);
              return metrics;
            } catch (error) {
              lastError = error instanceof Error ? error : new Error('Unknown error');
              retries++;
              if (retries < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
                await sleep(delay);
              }
            }
          }

          setError(lastError?.message || 'Failed to fetch model metrics');
          setLoading(false);
          return null;
        },

        updateFilters: (filters: Partial<MoneyMakerStoreState['filters']>) =>
          set(state => ({
            filters: { ...state.filters, ...filters },
            lastUpdate: new Date().toISOString(),
          })),

        updateSort: (sort: MoneyMakerStoreState['sort']) =>
          set(state => ({
            sort,
            lastUpdate: new Date().toISOString(),
          })),
      }),
      {
        name: 'money-maker-storage',
        partialize: state => ({
          config: state.config,
          metrics: state.metrics,
          filters: state.filters,
          sort: state.sort,
        }),
      }
    )
  )
);
