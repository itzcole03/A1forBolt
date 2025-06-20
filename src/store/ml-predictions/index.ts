import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ModelOutput, PredictionState } from '../../types/prediction';

interface MLPredictionsState extends PredictionState {
  // Actions
  setPredictions: (predictions: Map<string, ModelOutput>) => void;
  addPrediction: (id: string, prediction: ModelOutput) => void;
  removePrediction: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMLPredictionsStore = create<MLPredictionsState>()(
  devtools(
    set => ({
      predictions: new Map(),
      isLoading: false,
      error: null,

      setPredictions: predictions => set({ predictions }),
      addPrediction: (id, prediction) =>
        set(state => {
          const newPredictions = new Map(state.predictions);
          newPredictions.set(id, prediction);
          return { predictions: newPredictions };
        }),
      removePrediction: id =>
        set(state => {
          const newPredictions = new Map(state.predictions);
          newPredictions.delete(id);
          return { predictions: newPredictions };
        }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'ml-predictions-store' }
  )
);
