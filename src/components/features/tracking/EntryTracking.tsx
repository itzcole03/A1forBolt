import React, { useEffect } from 'react';
import SkeletonLoader from '../base/SkeletonLoader'; // Import SkeletonLoader
import webSocketService from '../../services/webSocketService';
import { ListChecks, AlertTriangle } from 'lucide-react';
import { PrizePicksEntry } from '../../types'; // Assuming this type is used for entries
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';


// --- Begin inlined from shared/webSocket.ts ---
export const WebSocketMessageTypes = {
  PING: 'ping',
  PONG: 'pong',
  CLIENT_AUTH: 'client_auth',
  AUTH_STATUS: 'auth_status',
  CLIENT_SUBSCRIBE: 'client_subscribe',
  CLIENT_UNSUBSCRIBE: 'client_unsubscribe',
  LIVE_ODD_UPDATE: 'live_odd_update',
  ENTRY_UPDATE: 'entry_update',
  MARKET_UPDATE: 'market_update',
  PREDICTION_STREAM: 'prediction_stream',
  SERVER_NOTIFICATION: 'server_notification',
} as const;
export type KnownWebSocketMessageType = typeof WebSocketMessageTypes[keyof typeof WebSocketMessageTypes];
// --- End inlined from shared/webSocket.ts ---

const getStatusClasses = (status: PrizePicksEntry['status']) => {
  switch (status) {
    case 'active': return 'bg-blue-500/20 text-blue-400';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'won': return 'bg-green-500/20 text-green-400';
    case 'lost': return 'bg-red-500/20 text-red-400';
    case 'canceled':
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const EntryItemSkeleton: React.FC = () => (
  <div className="p-3 bg-surface/70 rounded-lg shadow">
    <div className="flex justify-between items-center mb-1">
      <SkeletonLoader height="1em" width="60%" />
      <SkeletonLoader height="1.2em" width="20%" />
    </div>
    <SkeletonLoader height="0.6em" width="100%" className="mt-1" />
    <SkeletonLoader height="0.8em" width="40%" className="mt-1" />
  </div>
);

const EntryTracking: React.FC = () => {
  const {
    entries,
    isLoadingEntries,
    error,
    fetchEntries,
    updateEntry, // Action to update an entry from WebSocket message
    addToast,
  } = useAppStore((state) => ({
    entries: state.entries,
    isLoadingEntries: state.isLoadingEntries,
    error: state.error, // Assuming a general error for entry fetching
    fetchEntries: state.fetchEntries,
    updateEntry: state.updateEntry,
    addToast: state.addToast,
  }));

  useEffect(() => {
    fetchEntries(); // Fetch initial entries

    const handleMessage = (type: KnownWebSocketMessageType, payload: any) => {
      // Assuming WebSocket message contains updated entry data
      if (type === WebSocketMessageTypes.ENTRY_UPDATE) {
        const updatedEntry = payload as PrizePicksEntry;
        updateEntry(updatedEntry);
        addToast({ message: `Entry #${updatedEntry.id.substring(0,6)} updated!`, type: 'info' });
      } else if (type === WebSocketMessageTypes.LIVE_ODD_UPDATE) {
        // Example: Handle live odd updates if this component needs them
        // useAppStore.getState().updateLiveOdd(payload as OddsData);
        // addToast({ message: `Live odds updated for ${payload.propId}!`, type: 'info' });
      }
      // Add more specific handling based on WebSocket message structure
    };

    webSocketService.connect(
      handleMessage, // Corrected: use the new handler
      () => addToast({ message: 'WebSocket connection error for entry updates.', type: 'error' }),
      () => addToast({ message: 'WebSocket for entry updates disconnected. Attempting to reconnect...', type: 'warning' })
    );

    return () => {
      webSocketService.disconnect();
    };
  }, [fetchEntries, updateEntry, addToast]);

  return (
    <div className="p-6 glass rounded-2xl shadow-2xl h-full flex flex-col bg-gradient-to-br from-blue-900/60 to-blue-700/60 animate-fade-in">
      <h3 className="text-2xl font-bold text-blue-100 mb-4 flex items-center drop-shadow-lg">
        <ListChecks className="w-7 h-7 mr-2 text-green-400 animate-pulse-soft" />
        Active Entries
      </h3>
      {isLoadingEntries && (
        <div className="flex-grow flex flex-col justify-center items-center space-y-3 pr-1">
          {Array.from({ length: 3 }).map((_, index) => <EntryItemSkeleton key={index} />)}
        </div>
      )}
      {!isLoadingEntries && error && (
        <div className="flex-grow flex flex-col justify-center items-center text-center text-red-400 bg-red-500/10 p-4 rounded-lg">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p>Error loading entries: {error}</p>
        </div>
      )}
      {!isLoadingEntries && !error && Array.isArray(entries) && entries.length === 0 && (
        <div className="flex-grow flex flex-col justify-center items-center text-center text-blue-200">
          <p>No active entries being tracked.</p>
          <p className="text-sm">Place a bet to see it here!</p>
        </div>
      )}
      {!isLoadingEntries && !error && Array.isArray(entries) && entries.length > 0 && (
        <div className="space-y-4 overflow-y-auto flex-grow pr-1">
          {(entries || []).map((entry, index) => (
            <motion.div 
              key={entry.id} 
              className="modern-card glass p-4 bg-gradient-to-br from-blue-800/80 to-blue-600/80 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-bold text-blue-100">Entry <span className="text-green-300">#{entry.id.substring(0,8)}...</span></p>
                <span 
                  className={`status-badge px-3 py-1 text-xs font-bold rounded-full ${getStatusClasses(entry.status)}`}
                >
                  {entry.status.toUpperCase()}
                </span>
              </div>
              {/* Animated progress bar */}
              <div className="w-full bg-blue-900/40 rounded-full h-3 mt-1">
                <motion.div 
                  className="progress-fill success h-3 rounded-full gradient-success"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(((entry.legs || []).filter(l => l.status === 'won' || l.status === 'lost' || l.status === 'void').length) / ((entry.legs || []).length || 1)) * 100}%` }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-blue-200 text-xs">
                <span>Stake: <span className="font-bold text-green-300">${entry.stake}</span></span>
                <span>Payout: <span className="font-bold text-yellow-300">${entry.payout}</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntryTracking; 