import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { webSocketManager } from '../services/unified/WebSocketManager';

export interface WebSocketState {
  isConnected: boolean;
  clientId: string | null;
  activeSubscriptions: Array<{
    feedName: string;
    parameters?: Record<string, unknown>;
  }>;
  lastMessage: unknown;
  error: string | null;
  setConnected: (isConnected: boolean) => void;
  setClientId: (clientId: string) => void;
  addSubscription: (subscription: { feedName: string; parameters?: Record<string, unknown> }) => void;
  removeSubscription: (feedName: string) => void;
  setLastMessage: (message: unknown) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}


const initialState: Omit<WebSocketState, 'setConnected' | 'setClientId' | 'addSubscription' | 'removeSubscription' | 'setLastMessage' | 'setError' | 'reset'> = {
  isConnected: false,
  clientId: null,
  activeSubscriptions: [],
  lastMessage: null,
  error: null,
};

import { webSocketManager } from '../services/unified/WebSocketManager';

/**
 * Zustand store for WebSocket state, fully synchronized with WebSocketManager events.
 * On initialization, subscribes to connection, message, and error events.
 * Keeps all state reactive to the backend WebSocket.
 */
export const useWebSocketStore = create<WebSocketState>()(
  persist(
    (set: (partial: Partial<WebSocketState> | ((state: WebSocketState) => Partial<WebSocketState>), replace?: boolean) => void) => {
      // Subscribe to WebSocketManager events once on store initialization
      if (typeof window !== 'undefined' && !(window as any).__webSocketStoreInitialized) {
        webSocketManager.on('connect', () => set({ isConnected: true }));
        webSocketManager.on('disconnect', () => set({ isConnected: false }));
        webSocketManager.on('message', (msg: unknown) => set({ lastMessage: msg }));
        webSocketManager.on('error', (err: Error) => set({ error: err.message }));
        (window as any).__webSocketStoreInitialized = true;
      }
      return {
        ...initialState,
        setConnected: (isConnected: boolean) => set({ isConnected }),
        setClientId: (clientId: string) => set({ clientId }),
        addSubscription: (subscription: { feedName: string; parameters?: Record<string, unknown> }) =>
          set(state => ({
            activeSubscriptions: [...state.activeSubscriptions, subscription],
          })),
        removeSubscription: (feedName: string) =>
          set(state => ({
            activeSubscriptions: state.activeSubscriptions.filter(sub => sub.feedName !== feedName),
          })),
        setLastMessage: (message: unknown) => set({ lastMessage: message }),
        setError: (error: string | null) => set({ error }),
        reset: () => set(initialState),
      };
    },
    {
      name: 'websocket-storage',
    }
  )
);

// All WebSocket state is now managed in sync with WebSocketManager.
// No direct WebSocket/EventBus code remains in the store.
// This enables robust, testable, and maintainable real-time state management.

