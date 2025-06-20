import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useAppStore, AppState, AppStore } from '../store/useAppStore';
import { useBettingStore, BettingStore } from './bettingStore';
import { useMoneyMakerStore } from './moneyMakerStore';
import type { MoneyMakerStoreState, MoneyMakerStoreActions } from '@/types/money-maker';
import { useThemeStore, ThemeState } from './themeStore';
import { BettingSlice, createBettingSlice } from './slices/bettingSlice';
import { MLSlice, createMLSlice } from './slices/mlSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { WebSocketSlice, createWebSocketSlice } from './slices/websocketSlice';

// Re-export all stores
export { useAppStore, useBettingStore, useMoneyMakerStore, useThemeStore };

// Re-export types
export type {
  AppState,
  AppStore,
  BettingStore,
  MoneyMakerStoreState,
  MoneyMakerStoreActions,
  ThemeState,
};

// Create a unified store that combines all stores
export type RootState = AppState &
  BettingStore &
  MoneyMakerStoreState &
  MoneyMakerStoreActions &
  ThemeState;

// Create a unified store with persistence
export const useStore = create<RootState>()(
  devtools(
    persist(
      (set, get, api) => ({
        // Spread all store states
        ...useAppStore.getState(),
        ...useBettingStore.getState(),
        ...useMoneyMakerStore.getState(),
        ...useThemeStore.getState(),
      }),
      {
        name: 'sports-betting-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          // Persist only necessary state
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          config: state.config,
          activeBets: state.activeBets,
          totalStake: state.totalStake,
          potentialProfit: state.potentialProfit,
        }),
      }
    )
  )
);

// Export selectors
export const selectors = {
  // Auth selectors
  selectIsAuthenticated: (state: RootState) => state.isAuthenticated,
  selectUser: (state: RootState) => state.user,

  // Betting selectors
  selectBetSlipLegs: (state: RootState) => state.legs,
  selectActiveBets: (state: RootState) => state.activeBets,
  selectTotalStake: (state: RootState) => state.totalStake,
  selectPotentialProfit: (state: RootState) => state.potentialProfit,

  // Theme selectors
  selectTheme: (state: RootState) => state.theme,
  selectIsDarkMode: (state: RootState) => state.isDarkMode,

  // Money Maker selectors
  selectConfig: (state: RootState) => state.config,
  selectOpportunities: (state: RootState) => state.opportunities,
};

// Export actions
export const actions = {
  // Auth actions
  login: useAppStore.getState().login,
  logout: useAppStore.getState().logout,

  // Betting actions
  placeBet: useBettingStore.getState().placeBet,
  updateActiveBet: useBettingStore.getState().updateActiveBet,
  clearOpportunities: useBettingStore.getState().clearOpportunities,

  // Theme actions
  toggleTheme: useThemeStore.getState().toggleTheme,

  // Money Maker actions
  updateConfig: useMoneyMakerStore.getState().updateConfig,
  addPrediction: useMoneyMakerStore.getState().addPrediction,
  updatePrediction: useMoneyMakerStore.getState().updatePrediction,
  addPortfolio: useMoneyMakerStore.getState().addPortfolio,
  updatePortfolio: useMoneyMakerStore.getState().updatePortfolio,
  updateMetrics: useMoneyMakerStore.getState().updateMetrics,
  setLoading: useMoneyMakerStore.getState().setLoading,
  setError: useMoneyMakerStore.getState().setError,
  reset: useMoneyMakerStore.getState().reset,
  loadInitialData: useMoneyMakerStore.getState().loadInitialData,
  handlePlaceBet: useMoneyMakerStore.getState().handlePlaceBet,
};

// Export initial state for testing
export function getInitialState(): RootState {
  return {
    ...useAppStore.getState(),
    ...useBettingStore.getState(),
    ...useMoneyMakerStore.getState(),
    ...useThemeStore.getState(),
  };
}

export type StoreState = BettingSlice & MLSlice & UISlice & WebSocketSlice;

export const selectBettingState = (state: StoreState) => ({
  bets: state.bets,
  odds: state.odds,
  payouts: state.payouts,
});

export const selectMLState = (state: StoreState) => ({
  predictions: state.predictions,
  modelMetrics: state.modelMetrics,
  driftAlerts: state.driftAlerts,
});

export const selectUIState = (state: StoreState) => ({
  theme: state.theme,
  userPreferences: state.userPreferences,
  notifications: state.notifications,
});

export const selectWebSocketState = (state: StoreState) => ({
  isConnected: state.isConnected,
  lastMessage: state.lastMessage,
  connectionStatus: state.connectionStatus,
});
