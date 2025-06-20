import * as Sentry from '@sentry/react';


/**
 * UnifiedError
 *
 * Centralized error handling, logging, and reporting utilities.
 * Can extend base Error class for custom error types specific to the application.
 *
 * Key Responsibilities:
 * 1. Define custom error classes (e.g., APIError, ValidationError, PredictionError) for better categorization.
 * 2. Provide utility functions to log errors consistently (e.g., to console, Sentry, or a backend logging service).
 * 3. Format error messages for user display (e.g., user-friendly toasts or messages in ErrorBoundary).
 * 4. Centralize error reporting to external services like Sentry, including context.
 * 5. Potentially handle specific error types with custom logic (e.g., retry mechanisms for network errors).
 */

export enum ErrorSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

export interface ErrorContext {
  [key: string]: any;
}

// Base custom error class
export class AppError extends Error {
  public readonly context?: ErrorContext;
  public readonly originalError?: any;

  constructor(message: string, context?: ErrorContext, originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.context = context;
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Specific error types
export class APIError extends Error {
  public readonly status?: number;
  public readonly response?: any;

  constructor(message: string, status?: number, response?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext, originalError?: any) {
    super(message, context, originalError);
    this.name = 'ValidationError';
  }
}

export class SystemError extends AppError {
  constructor(message: string, context?: ErrorContext, originalError?: any) {
    super(message, context, originalError);
    this.name = 'SystemError';
  }
}

// Centralized error handler function
export const handleAppError = (error: any, customContext?: ErrorContext): void => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, customContext, error);
  } else {
    appError = new AppError('An unknown error occurred', customContext, error);
  }

  // 1. Log to console
  console.error(`[UnifiedError] ${appError.name}: ${appError.message}`, {
    severity: ErrorSeverity.Error,
    context: { ...appError.context, ...customContext },
    stack: appError.stack,
    originalError: appError.originalError,
  });

  // 2. Report to Sentry (or other error tracking service)
  Sentry.captureException(appError.originalError || appError, {
    extra: {
      message: appError.message,
      severityLevel: ErrorSeverity.Error,
      ...appError.context,
      ...customContext,
    },
    level: ErrorSeverity.Error,
  });

  // 3. Potentially trigger UI notifications (e.g., via a toast service or event bus)
  // This part is typically handled by UI components that catch errors or by global error boundaries.
  // Example: eventBus.publish('ShowToastNotification', { message: getUserFriendlyMessage(appError), type: 'error' });
};

/**
 * Generates a user-friendly message from an error.
 * @param error The error object (preferably an AppError).
 * @returns A string suitable for display to the user.
 */
export const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof APIError) {
    if (error.status === 401) return 'Authentication failed. Please log in again.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status && error.status >= 500) return 'A server error occurred. Please try again later.';
    return error.message || 'An API error occurred.';
  }
  if (error instanceof ValidationError) {
    return `Invalid input: ${error.message}`;
  }
  if (error instanceof AppError) {
    return error.message || 'An application error occurred.';
  }
  return 'An unexpected error occurred. Please try again.';
};

export const unifiedError = {
  AppError,
  APIError,
  ValidationError,
  SystemError,
  handleAppError,
  getUserFriendlyMessage,
  ErrorSeverity,
};

// // Example Usage:
// try {
//   // someOperationThatMightFail();
//   throw new APIError('Failed to fetch user data', 404, { userId: '123' });
// } catch (e) {
//   handleAppError(e, { operation: 'fetchUser' });
//   // const userMessage = getUserFriendlyMessage(e);
//   // showToast(userMessage, 'error');
// } 