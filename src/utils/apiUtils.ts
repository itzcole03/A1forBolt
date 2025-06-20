import axios, { AxiosError, AxiosRequestConfig } from 'axios';



interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000
};

export async function retryableAxios<T>(
  config: AxiosRequestConfig,
  retryConfig: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: Error | null = null;
  let delay = retryConfig.baseDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof AxiosError) {
        // Don't retry on 4xx errors (except 429 - rate limit)
        if (error.response?.status && error.response.status < 500 && error.response.status !== 429) {
          throw error;
        }
      }

      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      delay = Math.min(
        delay * (1.5 + Math.random() * 0.5),
        retryConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export function createAxiosWithRetry(baseURL: string, retryConfig?: RetryConfig) {
  return {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      return retryableAxios<T>({
        ...config,
        method: 'GET',
        url,
        baseURL
      }, retryConfig);
    },
    post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
      return retryableAxios<T>({
        ...config,
        method: 'POST',
        url,
        data,
        baseURL
      }, retryConfig);
    }
  };
} 