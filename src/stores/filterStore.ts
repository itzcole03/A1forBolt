import { create } from 'zustand';

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

// Only the serializable values for a filter preset
export type FilterValues = {
  activeFilters: string[];
  riskProfile: RiskProfile;
  stakeSizing: number;
  model: string;
  confidenceThreshold: number;
};

interface FilterState {
  activeFilters: Set<string>;
  riskProfile: RiskProfile;
  setRiskProfile: (profile: RiskProfile) => void;
  stakeSizing: number; // percent of bankroll (0-100)
  setStakeSizing: (value: number) => void;
  model: string;
  setModel: (model: string) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  toggleFilter: (filterId: string) => void;
  clearFilters: () => void;
}

interface FilterPreset {
  name: string;
  filters: FilterValues;
}

const FILTER_PRESETS_KEY = 'betting-filter-presets';

function getPresetsFromStorage(): FilterPreset[] {
  try {
    const raw = window.localStorage.getItem(FILTER_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: FilterPreset[]) {
  window.localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
}

export const useFilterStore = create<
  FilterState & {
    savePreset: (name: string) => void;
    loadPreset: (name: string) => void;
    removePreset: (name: string) => void;
    listPresets: () => FilterPreset[];
  }
>(set => ({
  activeFilters: new Set<string>(),
  riskProfile: 'balanced',
  setRiskProfile: profile => set({ riskProfile: profile }),
  stakeSizing: 5,
  setStakeSizing: value => set({ stakeSizing: value }),
  model: 'default',
  setModel: model => set({ model }),
  confidenceThreshold: 0,
  setConfidenceThreshold: value => set({ confidenceThreshold: value }),
  toggleFilter: (filterId: string) =>
    set(state => {
      const newFilters = new Set(state.activeFilters);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return { activeFilters: newFilters };
    }),
  clearFilters: () => set({ activeFilters: new Set<string>() }),
  savePreset: (name: string) =>
    set(state => {
      const presets = getPresetsFromStorage();
      const newPreset: FilterPreset = {
        name,
        filters: {
          activeFilters: Array.from(state.activeFilters),
          riskProfile: state.riskProfile,
          stakeSizing: state.stakeSizing,
          model: state.model,
          confidenceThreshold: state.confidenceThreshold,
        },
      };
      const updated = presets.filter(p => p.name !== name).concat(newPreset);
      savePresetsToStorage(updated);
      return {};
    }),
  loadPreset: (name: string) =>
    set(state => {
      const presets = getPresetsFromStorage();
      const preset = presets.find(p => p.name === name);
      if (preset) {
        return {
          activeFilters: new Set(preset.filters.activeFilters),
          riskProfile: preset.filters.riskProfile,
          stakeSizing: preset.filters.stakeSizing,
          model: preset.filters.model,
          confidenceThreshold: preset.filters.confidenceThreshold,
        };
      }
      return {};
    }),
  removePreset: (name: string) =>
    set(() => {
      const presets = getPresetsFromStorage().filter(p => p.name !== name);
      savePresetsToStorage(presets);
      return {};
    }),
  listPresets: () => getPresetsFromStorage(),
}));
