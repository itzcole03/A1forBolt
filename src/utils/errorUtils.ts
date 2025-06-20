import { APIError } from '../services/api';



export interface ErrorDetails {
  code: string;
  message: string;
  details?: string | number | object;
  timestamp: number;
  path?: string;
}

export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: string | number | object
  ) {
    super(message);
    this.name = 'ApplicationError';
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: Date.now()
    };
  }
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

export function normalizeError(error: unknown): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }

  if (isAPIError(error)) {
    return new ApplicationError(error.code, error.message, error.details);
  }

  if (error instanceof Error) {
    return new ApplicationError('UNKNOWN_ERROR', error.message);
  }

  return new ApplicationError(
    'UNKNOWN_ERROR',
    typeof error === 'string' ? error : 'An unknown error occurred'
  );
}

export function createErrorHandler(context: string) {
  return (error: unknown): ApplicationError => {
    const normalizedError = normalizeError(error);
    
    // Log error in development
    if (import.meta.env.MODE === 'development') {
      console.error(`Error in ${context}:`, normalizedError);
    }

    return normalizedError;
  };
}

export function handleNetworkError(error: unknown): ApplicationError {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new ApplicationError(
      'NETWORK_ERROR',
      'Unable to connect to the server. Please check your internet connection.'
    );
  }

  return normalizeError(error);
}

export function handleTimeoutError(error: unknown): ApplicationError {
  if (error instanceof Error && error.name === 'AbortError') {
    return new ApplicationError(
      'TIMEOUT_ERROR',
      'The request timed out. Please try again.'
    );
  }

  return normalizeError(error);
}

export function handleAuthenticationError(error: unknown): ApplicationError {
  const normalizedError = normalizeError(error);

  if (normalizedError.code === 'AUTH_ERROR') {
    // Dispatch event to trigger auth flow
    window.dispatchEvent(new CustomEvent('auth:error'));
  }

  return normalizedError;
}

export function getErrorMessage(error: unknown): string {
  const normalizedError = normalizeError(error);
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT_ERROR: 'The request timed out. Please try again.',
    AUTH_ERROR: 'Your session has expired. Please sign in again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.'
  };

  return errorMessages[normalizedError.code] || normalizedError.message;
}

// Example usage:
// try {
//   await someApiCall();
// } catch (error) {
//   const handler = createErrorHandler('UserProfile');
//   const normalizedError = handler(error);
//   const userMessage = getErrorMessage(normalizedError);
//   // Show error to user
// } 