export type ErrorContext = 'SYSTEM' | 'VALIDATION' | 'NETWORK' | 'AUTH' | 'BUSINESS';
export type ErrorCode =
  | 'INTERNAL_ERROR'
  | 'INVALID_INPUT'
  | 'REQUEST_FAILED'
  | 'UNAUTHORIZED'
  | 'UNKNOWN_ERROR';

export enum ErrorCategory {
  SYSTEM = 'SYSTEM',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  BUSINESS = 'BUSINESS',
  DATABASE = 'DATABASE',
  CONFIGURATION = 'CONFIGURATION',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  details?: Record<string, any>;
  stack?: string;
  userContext?: any;
  recoveryStrategy?: string;
  metrics?: {
    responseTime?: number;
    retryCount?: number;
    failureRate?: number;
  };
}

export interface BettingSystemError extends Error {
  code: string;
  component: string;
  severity: ErrorSeverity;
  context: Record<string, any>;
  timestamp: number;
  retryable: boolean;
}

export interface ErrorMetrics {
  count: number;
  lastOccurrence: number;
  meanTimeBetweenErrors: number;
  recoveryRate: number;
  meanTimeToRecovery: number;
}

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  backoffFactor: number;
  timeout: number;
  recoveryActions: Array<(error: BettingSystemError) => Promise<void>>;
}
