export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorCategory {
  SYSTEM = 'SYSTEM',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  BUSINESS = 'BUSINESS',
  DATABASE = 'DATABASE',
  CONFIGURATION = 'CONFIGURATION',
  MODEL = 'MODEL',
}

export interface ErrorContext {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  component?: string;
  details?: Record<string, any>;
  originalError?: Error;
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
  backoffFactor?: number;
  timeout?: number;
}

export interface ErrorMetrics {
  count: number;
  lastOccurrence: number;
  occurrences: Array<{
    timestamp: number;
    severity: ErrorSeverity;
    category: ErrorCategory;
  }>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  averageRecoveryTime: number;
}

export interface ErrorRecoveryStrategy {
  name: string;
  description: string;
  canHandle: (error: ErrorContext) => boolean;
  execute: (error: ErrorContext) => Promise<boolean>;
  maxRetries: number;
  backoffFactor: number;
  timeout: number;
}

export class UnifiedError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'UnifiedError';
  }
}
