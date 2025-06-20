// confidenceSlice.ts
// Zustand slice for confidence band and win probability state

import { create } from 'zustand';
import type { ConfidenceBand, WinProbability, PredictionWithConfidence } from '../../types/confidence';

interface ConfidenceState {
  prediction: PredictionWithConfidence | null;
  setPrediction: (prediction: PredictionWithConfidence) => void;
  confidenceBand: ConfidenceBand | null;
  setConfidenceBand: (band: ConfidenceBand) => void;
  winProbability: WinProbability | null;
  setWinProbability: (prob: WinProbability) => void;
  clear: () => void;
}

export const useConfidenceStore = create<ConfidenceState>((set) => ({
  prediction: null,
  setPrediction: (prediction) => set({ prediction, confidenceBand: prediction.confidenceBand, winProbability: prediction.winProbability }),
  confidenceBand: null,
  setConfidenceBand: (confidenceBand) => set({ confidenceBand }),
  winProbability: null,
  setWinProbability: (winProbability) => set({ winProbability }),
  clear: () => set({ prediction: null, confidenceBand: null, winProbability: null }),
}));
