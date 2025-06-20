import { PlayerProp, Entry, PerformanceMetrics, BettingOpportunity, Alert, BetRecord } from '../types/core';
import { ProcessedPrizePicksProp } from '../types/prizePicks';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';



interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AppState {
  // Auth
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;

  // Props and Entries
  props: ProcessedPrizePicksProp[];
  selectedProps: string[];
  entries: Entry[];
  
  // Performance and Analytics
  metrics: PerformanceMetrics | null;
  opportunities: BettingOpportunity[];
  alerts: Alert[];
  
  // UI State
  darkMode: boolean;
  sidebarOpen: boolean;
  activeModal: string | null;
  
  // Actions
  setProps: (props: ProcessedPrizePicksProp[]) => void;
  togglePropSelection: (propId: string) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (entryId: string, updates: Partial<Entry>) => void;
  setMetrics: (metrics: PerformanceMetrics) => void;
  addOpportunity: (opportunity: BettingOpportunity) => void;
  removeOpportunity: (opportunityId: string) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (alertId: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setActiveModal: (modalId: string | null) => void;
  bets: BetRecord[];
  addBet: (bet: BetRecord) => void;
  updateBet: (betId: string, updates: Partial<BetRecord>) => void;
  removeBet: (betId: string) => void;
}

const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial State
        user: null,
        props: [],
        selectedProps: [],
        entries: [],
        metrics: null,
        opportunities: [],
        alerts: [],
        darkMode: false,
        sidebarOpen: true,
        activeModal: null,
        bets: [],

        // Auth Actions
        login: async (email: string, password: string) => {
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
              throw new Error('Invalid credentials');
            }
            
            const user = await response.json();
            set({ user });
          } catch (error) {
            throw error;
          }
        },

        register: async (name: string, email: string, password: string) => {
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            
            if (!response.ok) {
              throw new Error('Registration failed');
            }
            
            const user = await response.json();
            set({ user });
          } catch (error) {
            throw error;
          }
        },

        logout: () => set({ user: null }),

        // Actions
        setProps: (props) => set({ props }),
        
        togglePropSelection: (propId) =>
          set((state) => ({
            selectedProps: state.selectedProps.includes(propId)
              ? state.selectedProps.filter(id => id !== propId)
              : [...state.selectedProps, propId]
          })),
        
        addEntry: (entry) =>
          set((state) => ({
            entries: [...state.entries, entry]
          })),
        
        updateEntry: (entryId, updates) =>
          set((state) => ({
            entries: state.entries.map(entry =>
              entry.id === entryId ? { ...entry, ...updates } : entry
            )
          })),
        
        setMetrics: (metrics) => set({ metrics }),
        
        addOpportunity: (opportunity) =>
          set((state) => ({
            opportunities: [...state.opportunities, opportunity]
          })),
        
        removeOpportunity: (opportunityId) =>
          set((state) => ({
            opportunities: state.opportunities.filter(opp => opp.id !== opportunityId)
          })),
        
        addAlert: (alert) =>
          set((state) => ({
            alerts: [...state.alerts, alert]
          })),
        
        removeAlert: (alertId) =>
          set((state) => ({
            alerts: state.alerts.filter(alert => alert.id !== alertId)
          })),
        
        toggleDarkMode: () =>
          set((state) => ({
            darkMode: !state.darkMode
          })),
        
        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen
          })),
        
        setActiveModal: (modalId) => set({ activeModal: modalId }),
        
        addBet: (bet) => set((state) => ({
          bets: [...state.bets, bet]
        })),
        
        updateBet: (betId, updates) => set((state) => ({
          bets: state.bets.map(bet => 
            bet.id === betId ? { ...bet, ...updates } : bet
          )
        })),
        
        removeBet: (betId) => set((state) => ({
          bets: state.bets.filter(bet => bet.id !== betId)
        })),
      }),
      {
        name: 'sports-betting-store',
        partialize: (state) => ({
          user: state.user,
          props: state.props,
          selectedProps: state.selectedProps,
          entries: state.entries,
          metrics: state.metrics,
          opportunities: state.opportunities,
          alerts: state.alerts,
          darkMode: state.darkMode,
          sidebarOpen: state.sidebarOpen,
          activeModal: state.activeModal,
          bets: state.bets
        })
      }
    )
  )
);

export default useStore; 