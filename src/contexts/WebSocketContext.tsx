import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketManager } from '../services/unified/WebSocketManager';
import { errorLogger } from '../utils/errorLogger';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      errorLogger.logInfo('WebSocket connected', { context: 'WebSocketProvider' });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      errorLogger.logWarning('WebSocket disconnected', { context: 'WebSocketProvider' });
    };

    const handleError = (error: Error) => {
      errorLogger.logError(error, { context: 'WebSocketProvider' });
    };

    const handleMessage = (message: any) => {
      setLastMessage(message);
    };

    // Subscribe to WebSocketManager events
    webSocketManager.on('connect', handleConnect);
    webSocketManager.on('disconnect', handleDisconnect);
    webSocketManager.on('error', handleError);
    webSocketManager.on('message', handleMessage);

    // Cleanup on unmount
    return () => {
      webSocketManager.off('connect', handleConnect);
      webSocketManager.off('disconnect', handleDisconnect);
      webSocketManager.off('error', handleError);
      webSocketManager.off('message', handleMessage);
    };
  }, []);

  /**
   * Provides WebSocket context with unified event-driven API.
   * Use subscribe/unsubscribe to listen for specific events.
   */
  const value = {
    isConnected,
    lastMessage,
    subscribe: (event: string, callback: (data: any) => void) => webSocketManager.on(event, callback),
    unsubscribe: (event: string, callback: (data: any) => void) => webSocketManager.off(event, callback),
  };

  return (
    <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
  );
};
