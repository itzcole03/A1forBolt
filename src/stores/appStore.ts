import { create } from 'zustand';

interface AppState {
  user: string | null;
  setUser: (user: string | null) => void;
}

export const useAppStore = create<AppState>((set: (partial: Partial<AppState>) => void) => ({
  user: null,
  setUser: (user: string | null) => set({ user }),
}));
