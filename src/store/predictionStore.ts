import { create } from 'zustand';
import { LineupBuilderOutput, MoneyMakerOpportunity } from '@/types/predictions';
import { Lineup, isLineup } from '@/types/lineup';

interface PredictionSettings {
  enableSocialSentiment: boolean;
  enableWeatherData: boolean;
  enableInjuryData: boolean;
  enableMarketData: boolean;
  enableHistoricalData: boolean;
  enableSentimentData: boolean;
}

interface AnalyticsMetrics {
  accuracy: number;
  profitLoss: number;
  sampleSize: number;
  winRate: number;
  roi: number;
  averageOdds: number;
  bestPerformingSport: string;
  bestPerformingProp: string;
}

interface PredictionState {
  // Lineup Builder State
  currentLineup: Lineup | null;
  savedLineups: Lineup[];

  // Money Maker State
  opportunities: MoneyMakerOpportunity[];

  // Settings
  settings: PredictionSettings;

  // Analytics
  analytics: AnalyticsMetrics;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentLineup: (lineup: Lineup | null) => void;
  addSavedLineup: (lineup: Lineup) => void;
  setOpportunities: (opportunities: MoneyMakerOpportunity[]) => void;
  updateSettings: (settings: Partial<PredictionSettings>) => void;
  updateAnalytics: (metrics: Partial<AnalyticsMetrics>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  automatedStrategies: Record<string, boolean>;
  setStrategyAutomation: (strategyName: string, enabled: boolean) => void;
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  // Initial State
  currentLineup: null,
  savedLineups: [],
  opportunities: [],
  settings: {
    enableSocialSentiment: true,
    enableWeatherData: true,
    enableInjuryData: true,
    enableMarketData: true,
    enableHistoricalData: true,
    enableSentimentData: true,
  },
  analytics: {
    accuracy: 0,
    profitLoss: 0,
    sampleSize: 0,
    winRate: 0,
    roi: 0,
    averageOdds: 0,
    bestPerformingSport: '',
    bestPerformingProp: '',
  },
  isLoading: false,
  error: null,
  automatedStrategies: {},

  // Actions
  setCurrentLineup: lineup => {
    if (lineup === null || isLineup(lineup)) {
      set({ currentLineup: lineup });
    } else {
      console.error('Invalid lineup object:', lineup);
    }
  },

  addSavedLineup: lineup => {
    if (isLineup(lineup)) {
      set(state => ({
        savedLineups: [...state.savedLineups, lineup],
      }));
    } else {
      console.error('Invalid lineup object:', lineup);
    }
  },

  setOpportunities: opportunities => set({ opportunities }),

  updateSettings: newSettings =>
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    })),

  updateAnalytics: newMetrics =>
    set(state => ({
      analytics: { ...state.analytics, ...newMetrics },
    })),

  setIsLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  setStrategyAutomation: (strategyName, enabled) => {
    set(state => ({
      automatedStrategies: {
        ...state.automatedStrategies,
        [strategyName]: enabled,
      },
    }));
  },
}));
