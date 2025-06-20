import { unifiedMonitor } from '../../core/UnifiedMonitor';
// import { APIError, AppError } from '../../core/UnifiedError'; // File does not exist, use UnifiedErrorService if needed

// Error handling utilities
export const handleApiError = (error: any, context: string): never => {
  const trace = unifiedMonitor.startTrace(`error.${context}`, 'error');

  if (trace) {
    trace.setHttpStatus(error.response?.status || 500);
    unifiedMonitor.endTrace(trace);
  }

  if (error instanceof APIError) throw error;
  if (error instanceof AppError) throw error;

  throw new AppError(`Error in ${context}`, error.response?.status || 500, { context }, error);
};

// Data transformation utilities
export const transformData = <T, R>(data: T, transformer: (data: T) => R, context: string): R => {
  try {
    return transformer(data);
  } catch (error) {
    handleApiError(error, `${context}.transform`);
  }
};

// Validation utilities
export const validateResponse = <T>(
  response: any,
  validator: (data: any) => data is T,
  context: string
): T => {
  if (!validator(response)) {
    throw new AppError(`Invalid response in ${context}`, 500, { response, context });
  }
  return response;
};

// Cache utilities
const cache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedData = <T>(key: string, ttl: number = DEFAULT_CACHE_TTL): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
};

export const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Retry utilities
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    context?: string;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = 2, context = 'retry' } = options;

  let lastError: any;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const trace = unifiedMonitor.startTrace(`retry.${context}.attempt${attempt}`, 'retry');
      if (trace) {
        trace.setHttpStatus(error.response?.status || 500);
        unifiedMonitor.endTrace(trace);
      }

      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }

  throw lastError;
};

// Rate limiting utilities
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, limit: number, window: number): boolean => {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || now > current.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + window });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
};

// Logging utilities
export const logServiceCall = (
  service: string,
  method: string,
  params?: any,
  result?: any,
  error?: any
): void => {
  const trace = unifiedMonitor.startTrace(`${service}.${method}`, 'service');

  if (trace) {
    if (error) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.captureException(error, {
        extra: {
          service,
          method,
          params,
          result,
        },
      });
    } else {
      trace.setHttpStatus(200);
    }
    unifiedMonitor.endTrace(trace);
  }
};

// Performance monitoring utilities
export const measurePerformance = async <T>(fn: () => Promise<T>, context: string): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    const trace = unifiedMonitor.startTrace(`performance.${context}`, 'performance');
    if (trace) {
      trace.setDuration(duration);
      unifiedMonitor.endTrace(trace);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    const trace = unifiedMonitor.startTrace(`performance.${context}.error`, 'performance');
    if (trace) {
      trace.setDuration(duration);
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }

    throw error;
  }
};
