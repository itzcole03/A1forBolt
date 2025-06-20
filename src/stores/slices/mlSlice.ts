import { StateCreator } from 'zustand';
import { MLState, RootState, ModelMetrics, Prediction, DriftAlert } from '../../types';

export const createMLSlice: StateCreator<RootState, [], [], MLState> = (set, get) => ({
  predictions: [],
  modelMetrics: {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    lastUpdated: new Date(),
  },
  driftAlerts: [],

  updatePredictions: (predictions: Prediction[]) => {
    set(state => ({
      predictions: [...state.predictions, ...predictions],
    }));
  },

  updateModelMetrics: (metrics: Partial<ModelMetrics>) => {
    set(state => ({
      modelMetrics: {
        ...state.modelMetrics,
        ...metrics,
        lastUpdated: new Date(),
      },
    }));
  },

  addDriftAlert: (alert: DriftAlert) => {
    set(state => ({
      driftAlerts: [...state.driftAlerts, alert],
    }));
  },

  clearDriftAlerts: () => {
    set(state => ({
      driftAlerts: [],
    }));
  },
});
