import React, { createContext } from 'react';
import { UnifiedLogger } from '../unified/logging/types';

export const LoggerContext = createContext<UnifiedLogger | null>(null);

interface LoggerProviderProps {
  logger: UnifiedLogger;
  children: React.ReactNode;
}

export const LoggerProvider: React.FC<LoggerProviderProps> = ({ logger, children }) => {
  return <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>;
};
