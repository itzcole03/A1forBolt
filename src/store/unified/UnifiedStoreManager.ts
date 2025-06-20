import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { EventEmitter } from "eventemitter3";

// Core Types
interface PredictionData {
  id: string;
  confidence: number;
  predictedValue: number;
  factors: Array<{ name: string; impact: number; weight: number }>;
  timestamp: number;
  metadata?: {
    modelVersion?: string;
    features?: Record<string, number>;
    shapValues?: Record<string, number>;
    performanceMetrics?: Record<string, number>;
  };
}

interface BettingState {
  bets: Bet[];
  activeBets: Bet[];
  opportunities: BettingOpportunity[];
  bankroll: number;
  isLoading: boolean;
  error: string | null;
}

interface Bet {
  id: string;
  eventId: string;
  amount: number;
  odds: number;
  timestamp: number;
  status: "active" | "won" | "lost" | "cancelled";
  prediction?: PredictionData;
}

interface BettingOpportunity {
  id: string;
  eventId: string;
  market: string;
  odds: number;
  prediction: PredictionData;
  valueEdge: number;
  kellyFraction: number;
  recommendedStake: number;
  timestamp: number;
}

interface ThemeState {
  mode: "light" | "dark";
  primaryColor: string;
  accentColor: string;
}

interface UserState {
  user: any | null;
  preferences: {
    minConfidence: number;
    maxRiskPerBet: number;
    bankrollPercentage: number;
    autoRefresh: boolean;
    notifications: boolean;
  };
  settings: Record<string, any>;
}

interface FilterState {
  sport: string | null;
  confidence: [number, number];
  riskLevel: "low" | "medium" | "high" | null;
  timeRange: string;
  search: string;
}

// Main Store Interface
interface UnifiedStore {
  // Prediction State
  predictions: Record<string, PredictionData>;
  latestPredictions: PredictionData[];

  // Betting State
  betting: BettingState;

  // User State
  user: UserState;

  // Theme State
  theme: ThemeState;

  // Filter State
  filters: FilterState;

  // UI State
  ui: {
    toasts: Array<{
      id: string;
      type: "success" | "error" | "warning" | "info";
      title: string;
      message: string;
      duration?: number;
    }>;
    loading: Record<string, boolean>;
    modals: Record<string, boolean>;
  };

  // Actions
  actions: {
    // Prediction Actions
    updatePrediction: (eventId: string, prediction: PredictionData) => void;
    getPrediction: (eventId: string) => PredictionData | undefined;
    clearPredictions: () => void;

    // Betting Actions
    addBet: (bet: Omit<Bet, "id" | "timestamp">) => void;
    updateBetStatus: (betId: string, status: Bet["status"]) => void;
    addOpportunity: (opportunity: BettingOpportunity) => void;
    removeOpportunity: (opportunityId: string) => void;
    updateBankroll: (amount: number) => void;
    setBettingLoading: (loading: boolean) => void;
    setBettingError: (error: string | null) => void;

    // User Actions
    setUser: (user: any) => void;
    updatePreferences: (preferences: Partial<UserState["preferences"]>) => void;
    updateSettings: (settings: Record<string, any>) => void;

    // Theme Actions
    setTheme: (theme: Partial<ThemeState>) => void;
    toggleTheme: () => void;

    // Filter Actions
    setFilters: (filters: Partial<FilterState>) => void;
    clearFilters: () => void;

    // UI Actions
    addToast: (toast: Omit<UnifiedStore["ui"]["toasts"][0], "id">) => void;
    removeToast: (id: string) => void;
    setLoading: (key: string, loading: boolean) => void;
    setModal: (key: string, open: boolean) => void;
  };
}

// Event Bus for cross-component communication
export const storeEventBus = new EventEmitter();

// Main Store Implementation
export const useUnifiedStore = create<UnifiedStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        predictions: {},
        latestPredictions: [],

        betting: {
          bets: [],
          activeBets: [],
          opportunities: [],
          bankroll: 0,
          isLoading: false,
          error: null,
        },

        user: {
          user: null,
          preferences: {
            minConfidence: 0.6,
            maxRiskPerBet: 0.05,
            bankrollPercentage: 0.02,
            autoRefresh: true,
            notifications: true,
          },
          settings: {},
        },

        theme: {
          mode: "dark",
          primaryColor: "#3b82f6",
          accentColor: "#10b981",
        },

        filters: {
          sport: null,
          confidence: [0.6, 1.0],
          riskLevel: null,
          timeRange: "24h",
          search: "",
        },

        ui: {
          toasts: [],
          loading: {},
          modals: {},
        },

        // Actions Implementation
        actions: {
          // Prediction Actions
          updatePrediction: (eventId: string, prediction: PredictionData) => {
            set((state) => {
              const updatedPredictions = {
                ...state.predictions,
                [eventId]: prediction,
              };

              const latestPredictions = Object.values(updatedPredictions)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 50); // Keep last 50 predictions

              storeEventBus.emit("prediction:updated", { eventId, prediction });

              return {
                predictions: updatedPredictions,
                latestPredictions,
              };
            });
          },

          getPrediction: (eventId: string) => {
            return get().predictions[eventId];
          },

          clearPredictions: () => {
            set(() => ({
              predictions: {},
              latestPredictions: [],
            }));
            storeEventBus.emit("predictions:cleared");
          },

          // Betting Actions
          addBet: (betData) => {
            const bet: Bet = {
              ...betData,
              id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
            };

            set((state) => ({
              betting: {
                ...state.betting,
                bets: [...state.betting.bets, bet],
                activeBets:
                  bet.status === "active"
                    ? [...state.betting.activeBets, bet]
                    : state.betting.activeBets,
                bankroll: state.betting.bankroll - bet.amount,
              },
            }));

            storeEventBus.emit("bet:placed", bet);
          },

          updateBetStatus: (betId: string, status: Bet["status"]) => {
            set((state) => {
              const updatedBets = state.betting.bets.map((bet) =>
                bet.id === betId ? { ...bet, status } : bet,
              );

              const activeBets = updatedBets.filter(
                (bet) => bet.status === "active",
              );

              storeEventBus.emit("bet:status_updated", { betId, status });

              return {
                betting: {
                  ...state.betting,
                  bets: updatedBets,
                  activeBets,
                },
              };
            });
          },

          addOpportunity: (opportunity: BettingOpportunity) => {
            set((state) => ({
              betting: {
                ...state.betting,
                opportunities: [...state.betting.opportunities, opportunity],
              },
            }));

            storeEventBus.emit("opportunity:found", opportunity);
          },

          removeOpportunity: (opportunityId: string) => {
            set((state) => ({
              betting: {
                ...state.betting,
                opportunities: state.betting.opportunities.filter(
                  (opp) => opp.id !== opportunityId,
                ),
              },
            }));
          },

          updateBankroll: (amount: number) => {
            set((state) => ({
              betting: {
                ...state.betting,
                bankroll: amount,
              },
            }));
          },

          setBettingLoading: (loading: boolean) => {
            set((state) => ({
              betting: {
                ...state.betting,
                isLoading: loading,
              },
            }));
          },

          setBettingError: (error: string | null) => {
            set((state) => ({
              betting: {
                ...state.betting,
                error,
              },
            }));
          },

          // User Actions
          setUser: (user: any) => {
            set((state) => ({
              user: {
                ...state.user,
                user,
              },
            }));
            storeEventBus.emit("user:updated", user);
          },

          updatePreferences: (
            preferences: Partial<UserState["preferences"]>,
          ) => {
            set((state) => ({
              user: {
                ...state.user,
                preferences: {
                  ...state.user.preferences,
                  ...preferences,
                },
              },
            }));
          },

          updateSettings: (settings: Record<string, any>) => {
            set((state) => ({
              user: {
                ...state.user,
                settings: {
                  ...state.user.settings,
                  ...settings,
                },
              },
            }));
          },

          // Theme Actions
          setTheme: (theme: Partial<ThemeState>) => {
            set((state) => ({
              theme: {
                ...state.theme,
                ...theme,
              },
            }));
            storeEventBus.emit("theme:changed", theme);
          },

          toggleTheme: () => {
            set((state) => ({
              theme: {
                ...state.theme,
                mode: state.theme.mode === "dark" ? "light" : "dark",
              },
            }));
          },

          // Filter Actions
          setFilters: (filters: Partial<FilterState>) => {
            set((state) => ({
              filters: {
                ...state.filters,
                ...filters,
              },
            }));
            storeEventBus.emit("filters:changed", filters);
          },

          clearFilters: () => {
            set(() => ({
              filters: {
                sport: null,
                confidence: [0.6, 1.0],
                riskLevel: null,
                timeRange: "24h",
                search: "",
              },
            }));
          },

          // UI Actions
          addToast: (toastData) => {
            const toast = {
              ...toastData,
              id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };

            set((state) => ({
              ui: {
                ...state.ui,
                toasts: [...state.ui.toasts, toast],
              },
            }));

            // Auto-remove toast after duration
            if (toast.duration !== 0) {
              setTimeout(() => {
                get().actions.removeToast(toast.id);
              }, toast.duration || 5000);
            }
          },

          removeToast: (id: string) => {
            set((state) => ({
              ui: {
                ...state.ui,
                toasts: state.ui.toasts.filter((toast) => toast.id !== id),
              },
            }));
          },

          setLoading: (key: string, loading: boolean) => {
            set((state) => ({
              ui: {
                ...state.ui,
                loading: {
                  ...state.ui.loading,
                  [key]: loading,
                },
              },
            }));
          },

          setModal: (key: string, open: boolean) => {
            set((state) => ({
              ui: {
                ...state.ui,
                modals: {
                  ...state.ui.modals,
                  [key]: open,
                },
              },
            }));
          },
        },
      }),
      {
        name: "a1betting-store",
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          filters: state.filters,
          betting: {
            bankroll: state.betting.bankroll,
            bets: state.betting.bets,
          },
        }),
      },
    ),
    { name: "A1Betting Store" },
  ),
);

// Convenience Hooks
export const usePredictions = () => {
  const predictions = useUnifiedStore((state) => state.predictions);
  const latestPredictions = useUnifiedStore((state) => state.latestPredictions);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    predictions,
    latestPredictions,
    updatePrediction: actions.updatePrediction,
    getPrediction: actions.getPrediction,
    clearPredictions: actions.clearPredictions,
  };
};

export const useBetting = () => {
  const betting = useUnifiedStore((state) => state.betting);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    ...betting,
    addBet: actions.addBet,
    updateBetStatus: actions.updateBetStatus,
    addOpportunity: actions.addOpportunity,
    removeOpportunity: actions.removeOpportunity,
    updateBankroll: actions.updateBankroll,
    setBettingLoading: actions.setBettingLoading,
    setBettingError: actions.setBettingError,
  };
};

export const useUser = () => {
  const user = useUnifiedStore((state) => state.user);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    ...user,
    setUser: actions.setUser,
    updatePreferences: actions.updatePreferences,
    updateSettings: actions.updateSettings,
  };
};

export const useTheme = () => {
  const theme = useUnifiedStore((state) => state.theme);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    ...theme,
    setTheme: actions.setTheme,
    toggleTheme: actions.toggleTheme,
  };
};

export const useFilters = () => {
  const filters = useUnifiedStore((state) => state.filters);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    ...filters,
    setFilters: actions.setFilters,
    clearFilters: actions.clearFilters,
  };
};

export const useUI = () => {
  const ui = useUnifiedStore((state) => state.ui);
  const actions = useUnifiedStore((state) => state.actions);

  return {
    ...ui,
    addToast: actions.addToast,
    removeToast: actions.removeToast,
    setLoading: actions.setLoading,
    setModal: actions.setModal,
  };
};

// Export types for use in components
export type {
  PredictionData,
  BettingState,
  Bet,
  BettingOpportunity,
  ThemeState,
  UserState,
  FilterState,
  UnifiedStore,
};
