// Unified WebSocket message structure and payloads
export type WebSocketData = BetData | OddsUpdate | SystemMessage | null;

export interface WebSocketMessage<T = WebSocketData> {
  type?: string; // Message type identifier
  event?: string;
  data?: T;
  payload?: T;
  sequence?: number;
  timestamp?: string | number;
  correlationId?: string;
}

// Example strict types for WebSocketData
export interface OddsUpdate {
  eventId: string;
  marketId: string;
  odds: number;
  timestamp: number;
}

export interface SystemMessage {
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: number;
}

// WebSocket configuration for client
export interface WebSocketConfig {
  url: string;
  onMessage: (message: WebSocketMessage) => void;
  onError: (error: Error) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  batchSize?: number;
  batchInterval?: number;
}

// WebSocket connection metrics
export interface WebSocketMetrics {
  latency: number;
  messageCount: number;
  errorCount: number;
  messageSize: number;
  compressionRatio: number;
  isConnected: boolean;
  lastError: string | null;
  timestamp: number;
}

// WebSocket connection instance
export interface WebSocketConnection {
  id: string;
  connectedAt: Date;
  metrics: WebSocketMetrics;
}

// WebSocket error structure
export interface WebSocketError {
  message: string;
  code?: string;
  timestamp: number;
}

// Example payload types for betting and odds updates
export interface BetData {
  betId: string;
  eventId: string;
  selectionId: string;
  stake: number;
  odds: number;
  type: 'SINGLE' | 'MULTIPLE' | 'SYSTEM';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SETTLED';
  timestamp?: number;
  clientId?: string;
}

export interface OddsUpdate {
  eventId: string;
  selectionId: string;
  odds: number;
  timestamp: number;
}

export interface ResultUpdate {
  eventId: string;
  selectionId: string;
  result: string;
  timestamp: number;
}

export interface StatusUpdate {
  eventId: string;
  status: string;
  timestamp: number;
}

// --- Specific Payload Types for Incoming Messages from shared/webSocket.ts ---
export type LiveOddUpdatePayload = OddsUpdate;
// Replaced 'unknown' with PrizePicksEntry and related types for type safety
import type { PrizePicksEntry } from './prizePicks';
import type { MarketUpdate, Prediction } from './core';
export type EntryUpdatePayload = PrizePicksEntry;
export type MarketUpdatePayload = MarketUpdate;
export type PredictionStreamPayload = Prediction;

export interface NotificationPayload {
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  details?: Record<string, unknown>;
}

export interface AuthStatusPayload {
  status: 'success' | 'failure' | 'required';
  message?: string;
  userId?: string;
}

// --- Outgoing Message Types (Client to Server) ---
export interface ClientAuthPayload {
  token: string;
}
export type ClientAuthMessage = WebSocketMessage<ClientAuthPayload>;
