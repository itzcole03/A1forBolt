import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './EntryTracking.module.css';
import { useAppState } from './StateProvider';

// EntryTracking: Real-time entry tracker for Poe UI
// Usage: <EntryTracking entries={optionalEntries} />

const WS_URL = 'ws://localhost:3001/entries';

// Match context Entry type
type Entry = {
  id: string;
  date: string;
  legs: number;
  entry: number;
  potentialPayout: number;
  status: 'won' | 'lost' | 'pending';
  picks: Array<{
    player: string;
    stat: string;
    line: string;
    result: 'won' | 'lost' | 'pending';
    current: number;
    target: number;
  }>;
};

const statusColor = (status: string) =>
  status === 'won'
    ? 'status-won bg-green-500'
    : status === 'lost'
      ? 'status-lost bg-red-500'
      : 'status-pending bg-gray-400';

// Convert incoming WebSocket entry to context Entry type if needed
function toContextEntry(e: unknown): Entry {
  if (typeof e === 'object' && e !== null && 'id' in e) {
    const obj = e as Record<string, unknown>;
    return {
      id: String(obj.id),
      date: typeof obj.date === 'string' ? obj.date : new Date((obj.timestamp as number) || Date.now()).toISOString().split('T')[0],
      legs: typeof obj.legs === 'number' ? obj.legs : Array.isArray(obj.picks) ? (obj.picks as unknown[]).length : 0,
      entry: typeof obj.entry === 'number' ? obj.entry : 0,
      potentialPayout: typeof obj.potentialPayout === 'number' ? obj.potentialPayout : typeof obj.payout === 'number' ? obj.payout : 0,
      status: typeof obj.status === 'string' ? (obj.status as Entry['status']) : 'pending',
      picks: Array.isArray(obj.picks) ? (obj.picks as Entry['picks']) : [],
    };
  }
  // fallback
  return {
    id: '',
    date: new Date().toISOString().split('T')[0],
    legs: 0,
    entry: 0,
    potentialPayout: 0,
    status: 'pending',
    picks: [],
  };
}

const EntryTracking: React.FC<{ entries?: Entry[] }> = ({ entries: propEntries }) => {
  const { entries: contextEntries, addEntry } = useAppState?.() || {
    entries: [],
    addEntry: undefined,
  };
  const [entries, setEntries] = useState<Entry[]>(propEntries || contextEntries || []);
  const [selected, setSelected] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  // WebSocket logic only if not controlled
  useEffect(() => {
    if (propEntries) return;
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout | null = null;
    function connect() {
      ws = new window.WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => setWsError(null);
      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            // Batch update: only update local state, not context (no batch setter in context)
            setEntries(data.map(toContextEntry));
            // TODO: add batch update to context if needed in future
          } else if (data && typeof data === 'object' && data.id) {
            setEntries(prev => {
              const idx = prev.findIndex(e => e.id === data.id);
              const entry = toContextEntry(data);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = entry;
                return updated;
              }
              // Add to top
              if (addEntry) addEntry(entry);
              return [entry, ...prev];
            });
          }
        } catch (_e) {
          // Ignore parse errors
        }
      };
      ws.onclose = () => {
        setWsError('Disconnected from entry server. Reconnecting...');
        reconnectTimer = setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        setWsError('WebSocket error. Attempting reconnect...');
        ws.close();
      };
    }
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [propEntries, addEntry]);

  // Sync with context if context changes (for global updates)
  useEffect(() => {
    if (!propEntries && contextEntries && contextEntries.length) {
      setEntries(contextEntries);
    }
  }, [contextEntries, propEntries]);

  // Memoize entry list and modal for performance
  const entryList = useMemo(
    () =>
      entries.map(entry => (
        <div
          key={entry.id}
          className={`modern-card p-6 hover:shadow-large transition-all entry-card-clickable animate-fade-in`}
          onClick={() => setSelected(entry.id)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-xl">{entry.legs}-Leg Entry</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {entry.date}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${statusColor(entry.status)} animate-fade-in`}>
                {entry.status === 'pending' ? '⏳' : entry.status === 'won' ? '✅' : '❌'}{' '}
                {entry.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {entry.picks.map((pick, i) => {
              const progress = pick.current / pick.target;
              const progressClass =
                pick.result === 'won' ? 'success' : pick.result === 'lost' ? 'danger' : 'pending';
              return (
                <div key={i} className="text-sm p-3 glass rounded-xl animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{pick.player}</span>
                    <span
                      className={`text-xs ${pick.result === 'won' ? 'text-green-600' : pick.result === 'lost' ? 'text-red-600' : 'text-gray-500'}`}
                    >
                      {pick.result === 'won' ? '✅' : pick.result === 'lost' ? '❌' : '⏳'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {pick.stat} {pick.line}
                  </div>
                  <div className={`${styles['progress-bar']} mb-1`}>
                    <div
                      className={`${styles['progress-fill']} ${styles[progressClass]} animate-fade-in`}
                      style={{ ['--progress-width' as string]: `${Math.min(progress * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {pick.current} / {pick.target}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Payout</div>
              <div className="font-bold text-lg">${entry.potentialPayout.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Legs</div>
              <div className="font-bold text-lg text-blue-600">{entry.legs}</div>
            </div>
          </div>
        </div>
      )),
    [entries]
  );

  const selectedEntry = useMemo(() => entries.find(e => e.id === selected), [entries, selected]);

  return (
    <div className="modern-card p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl lg:text-3xl font-bold">📋 Active Entries</h2>
          <span className="status-badge bg-primary-500 text-white">
            {entries.filter(e => e.status === 'pending').length} Active
          </span>
        </div>
      </div>
      {wsError && <div className="text-red-500 text-center mb-4 animate-fade-in">{wsError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {entryList}
      </div>
      {/* Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
          <div className="modern-card max-w-4xl w-full p-8 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold">📊 Entry Progress</h3>
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">
                  {selectedEntry.legs}-Leg Entry - {selectedEntry.date}
                </h4>
                <span
                  className={`status-badge ${statusColor(selectedEntry.status)} animate-fade-in`}
                >
                  {selectedEntry.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="glass rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    ${selectedEntry.potentialPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Potential Payout</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div
                    className={`text-2xl font-bold ${selectedEntry.status === 'won' ? 'text-green-600' : selectedEntry.status === 'lost' ? 'text-red-600' : 'text-blue-600'}`}
                  >
                    {selectedEntry.status === 'lost'
                      ? '0.00'
                      : selectedEntry.potentialPayout.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {selectedEntry.picks.filter(p => p.result === 'won').length}/
                    {selectedEntry.picks.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hits</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {selectedEntry.picks.map((pick, i) => {
                const progress = pick.current / pick.target;
                const progressClass =
                  pick.result === 'won' ? 'success' : pick.result === 'lost' ? 'danger' : 'pending';
                return (
                  <div key={i} className="modern-card p-4 animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-bold">{pick.player}</h5>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {pick.stat} {pick.line}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs ${pick.result === 'won' ? 'text-green-600' : pick.result === 'lost' ? 'text-red-600' : 'text-gray-500'}`}
                        >
                          {pick.result === 'won' ? '✅' : pick.result === 'lost' ? '❌' : '⏳'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          Progress: {pick.current} / {pick.target}
                        </span>
                        <span>{(progress * 100).toFixed(0)}%</span>
                      </div>
                      <div className={styles['progress-bar']}>
                        <div
                          className={`${styles['progress-fill']} ${styles[progressClass]} animate-fade-in`}
                          style={{ ['--progress-width' as string]: `${Math.min(progress * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {pick.result === 'pending' ? 'Live' : 'Final'}: {pick.current}{' '}
                      {pick.stat.toLowerCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryTracking;
