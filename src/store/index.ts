import { create } from 'zustand';
import { User, Bet, Prop, UserStats, PerformanceData, Headline } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Bets state
  bets: Bet[];
  addBet: (bet: Bet) => void;
  removeBet: (betId: string) => void;
  updateBet: (betId: string, updates: Partial<Bet>) => void;

  // Props state
  props: Prop[];
  setProps: (props: Prop[]) => void;
  updateProp: (propId: string, updates: Partial<Prop>) => void;

  // Stats state
  stats: UserStats | null;
  setStats: (stats: UserStats | null) => void;

  // Performance state
  performance: PerformanceData[];
  setPerformance: (data: PerformanceData[]) => void;

  // News state
  headlines: Headline[];
  setHeadlines: (headlines: Headline[]) => void;

  // UI state
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  isBetSlipOpen: boolean;
  toggleBetSlip: () => void;

  selectedSport: string;
  setSelectedSport: (sport: string) => void;

  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
}

export const useStore = create<AppState>(set => ({
  // User state
  user: null,
  setUser: user => set({ user }),

  // Bets state
  bets: [],
  addBet: bet => set(state => ({ bets: [...state.bets, bet] })),
  removeBet: betId =>
    set(state => ({
      bets: state.bets.filter(bet => bet.id !== betId),
    })),
  updateBet: (betId, updates) =>
    set(state => ({
      bets: state.bets.map(bet => (bet.id === betId ? { ...bet, ...updates } : bet)),
    })),

  // Props state
  props: [],
  setProps: props => set({ props }),
  updateProp: (propId, updates) =>
    set(state => ({
      props: state.props.map(prop => (prop.id === propId ? { ...prop, ...updates } : prop)),
    })),

  // Stats state
  stats: null,
  setStats: stats => set({ stats }),

  // Performance state
  performance: [],
  setPerformance: data => set({ performance: data }),

  // News state
  headlines: [],
  setHeadlines: headlines => set({ headlines }),

  // UI state
  isDarkMode: false,
  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

  isBetSlipOpen: false,
  toggleBetSlip: () => set(state => ({ isBetSlipOpen: !state.isBetSlipOpen })),

  selectedSport: 'all',
  setSelectedSport: sport => set({ selectedSport: sport }),

  selectedLeague: 'all',
  setSelectedLeague: league => set({ selectedLeague: league }),
}));
