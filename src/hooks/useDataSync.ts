import { useLocalStorage } from './useLocalStorage';
import { useState, useCallback, useEffect } from 'react';



interface SyncOptions<T> {
  key: string;
  initialData: T;
  onSync?: (data: T) => Promise<T>;
  syncInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface SyncState<T> {
  data: T;
  isSyncing: boolean;
  lastSynced: Date | null;
  error: Error | null;
  pendingChanges: boolean;
}

export function useDataSync<T>({
  key,
  initialData,
  onSync,
  syncInterval = 30000,
  retryAttempts = 3,
  retryDelay = 1000,
  onError
}: SyncOptions<T>) {
  const [storedData, setStoredData] = useLocalStorage<T>(key, initialData);
  const [state, setState] = useState<SyncState<T>>({
    data: storedData,
    isSyncing: false,
    lastSynced: null,
    error: null,
    pendingChanges: false
  });

  const sync = useCallback(async (retryCount = 0) => {
    if (!onSync || !state.pendingChanges) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const syncedData = await onSync(state.data);
      setState(prev => ({
        ...prev,
        data: syncedData,
        lastSynced: new Date(),
        isSyncing: false,
        error: null,
        pendingChanges: false
      }));
      setStoredData(syncedData);
    } catch (error) {
      if (error instanceof Error) {
        if (retryCount < retryAttempts) {
          setTimeout(() => sync(retryCount + 1), retryDelay);
        } else {
          setState(prev => ({
            ...prev,
            isSyncing: false,
            error,
            pendingChanges: true
          }));
          onError?.(error);
        }
      }
    }
  }, [state.data, state.pendingChanges, onSync, retryAttempts, retryDelay, onError, setStoredData]);

  const update = useCallback((updater: (prev: T) => T) => {
    setState(prev => {
      const newData = updater(prev.data);
      return {
        ...prev,
        data: newData,
        pendingChanges: true
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: initialData,
      pendingChanges: true
    }));
  }, [initialData]);

  // Auto-sync on interval
  useEffect(() => {
    if (!syncInterval) return;

    const intervalId = setInterval(() => {
      if (state.pendingChanges && !state.isSyncing) {
        sync();
      }
    }, syncInterval);

    return () => clearInterval(intervalId);
  }, [sync, syncInterval, state.pendingChanges, state.isSyncing]);

  // Sync on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (state.pendingChanges && !state.isSyncing) {
        sync();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [sync, state.pendingChanges, state.isSyncing]);

  return {
    ...state,
    update,
    sync,
    reset
  };
}

// Example usage:
/*
interface UserData {
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  bets: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'won' | 'lost';
  }>;
}

function UserDataManager() {
  const {
    data,
    isSyncing,
    lastSynced,
    error,
    pendingChanges,
    update,
    sync
  } = useDataSync<UserData>({
    key: 'user-data',
    initialData: {
      preferences: { theme: 'light', notifications: true },
      bets: []
    },
    onSync: async (data) => {
      const response = await fetch('/api/user/data', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    syncInterval: 60000,
    onError: (error) => console.error('Sync failed:', error)
  });

  const addBet = (bet: { id: string; amount: number }) => {
    update(prev => ({
      ...prev,
      bets: [...prev.bets, { ...bet, status: 'pending' }]
    }));
  };

  return (
    <div>
      {pendingChanges && <div>Unsaved changes</div>}
      {isSyncing && <div>Syncing...</div>}
      {error && <div>Error: {error.message}</div>}
      {lastSynced && <div>Last synced: {lastSynced.toLocaleString()}</div>}
      <button onClick={() => sync()}>Sync Now</button>
    </div>
  );
}
*/ 