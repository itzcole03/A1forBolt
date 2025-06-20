// simulationSlice.ts
// Zustand slice for bet simulation input/result state

import { create } from 'zustand';
import type { BetSimulationInput, BetSimulationResult } from '../../types/simulation';

interface SimulationState {
  input: BetSimulationInput | null;
  setInput: (input: BetSimulationInput) => void;
  result: BetSimulationResult | null;
  setResult: (result: BetSimulationResult) => void;
  clear: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  input: null,
  setInput: (input) => set({ input }),
  result: null,
  setResult: (result) => set({ result }),
  clear: () => set({ input: null, result: null }),
}));
