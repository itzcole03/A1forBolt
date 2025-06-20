// betHistorySlice.ts
// Zustand slice for user/model bet history state

import { create } from 'zustand';
import type { UserBetHistoryEntry, UserPerformanceHistory, ModelPerformanceHistory } from '../../types/history';

interface BetHistoryState {
  userHistory: UserPerformanceHistory | null;
  setUserHistory: (history: UserPerformanceHistory) => void;
  addUserEntry: (entry: UserBetHistoryEntry) => void;
  modelHistory: ModelPerformanceHistory[];
  setModelHistory: (history: ModelPerformanceHistory[]) => void;
  addModelHistory: (history: ModelPerformanceHistory) => void;
  clear: () => void;
}

export const useBetHistoryStore = create<BetHistoryState>((set) => ({
  userHistory: null,
  setUserHistory: (history) => set({ userHistory: history }),
  addUserEntry: (entry) => set((state) => state.userHistory ? { userHistory: { ...state.userHistory, entries: [...state.userHistory.entries, entry] } } : {}),
  modelHistory: [],
  setModelHistory: (history) => set({ modelHistory: history }),
  addModelHistory: (history) => set((state) => ({ modelHistory: [...state.modelHistory, history] })),
  clear: () => set({ userHistory: null, modelHistory: [] }),
}));
