import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { updatePerformanceMetrics } from './monitoring';

export interface UserStateData {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export interface UserState {
  data: UserStateData;
  validation: {
    isValid: boolean;
    errors: string[];
  };
  metrics: {
    updateCount: number;
    errorCount: number;
    lastUpdate: string | null;
  };
}

export interface UserStore extends UserState {
  setState: (updater: (state: UserState) => UserState) => void;
}

const initialState: UserState = {
  data: {
    id: uuidv4(),
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true,
    },
  },
  validation: {
    isValid: true,
    errors: [],
  },
  metrics: {
    updateCount: 0,
    errorCount: 0,
    lastUpdate: null,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    devtools(
      immer(set => ({
        ...initialState,
        setState: updater => {
          set(state => {
            const start = performance.now();
            const { setState, ...userState } = state;
            const newState = updater(userState);
            const end = performance.now();
            updatePerformanceMetrics(end - start);
            // Validate state
            const errors: string[] = [];
            if (!newState.data.name) {
              errors.push('Name is required');
            }
            if (!newState.data.email) {
              errors.push('Email is required');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newState.data.email)) {
              errors.push('Invalid email format');
            }
            // Update validation and metrics
            newState.validation.isValid = errors.length === 0;
            newState.validation.errors = errors;
            newState.metrics.updateCount += 1;
            newState.metrics.errorCount += errors.length;
            newState.metrics.lastUpdate = new Date().toISOString();
            return { ...newState, setState };
          });
        },
      })),
      { name: 'UserStore' }
    ),
    {
      name: 'user-store',
      version: 1,
      partialize: (state: UserStore) => ({
        data: state.data,
        version: '1.0.0',
      }),
    }
  )
);
