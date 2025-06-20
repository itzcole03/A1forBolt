import { unifiedMonitor } from '../../core/UnifiedMonitor.js';
import { APIError, AppError } from '../../core/UnifiedError.js';
import { getInitializedUnifiedConfig } from '../../core/UnifiedConfig.js';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;


  constructor() {
    const config = getInitializedUnifiedConfig();
    this.baseUrl = (config.get('api.baseUrl') as string || 'http://localhost:8000') + '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultTimeout = 30000; // 30 seconds
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const trace = unifiedMonitor.startTrace(
      `api.${method.toLowerCase()}.${endpoint}`,
      'http.client'
    );
    const url = new URL(endpoint, this.baseUrl);

    // Add query parameters
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
    };

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
      });

      // Utility to safely convert Headers to Record<string, string>
      const headersToObject = (headers: Headers): Record<string, string> => {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      };

      if (trace) {
        trace.setHttpStatus(response.status);
        unifiedMonitor.endTrace(trace);
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new APIError(
          responseData.message || 'API request failed',
          response.status,
          responseData
        );
      }

      return {
        data: responseData,
        status: response.status,
        headers: headersToObject(response.headers),
      };
    } catch (error: unknown) {
      if (trace) {
        // error is unknown, so we must check its shape
        let errStatus = 500;
        if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as Record<string, unknown>).response === 'object' && (error as { response?: { status?: number } }).response?.status) {
          errStatus = (error as { response?: { status?: number } }).response!.status!;
        }
        trace.setHttpStatus(errStatus);
        unifiedMonitor.endTrace(trace);
      }

      if (error instanceof APIError) throw error;
      // If error is an AbortError
      if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'AbortError') {
        throw new AppError('Request timeout', { status: 408 }, error);
      }
      // Type guard for error with response.status
      function hasResponseStatus(err: unknown): err is { response: { status: number } } {
        return (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as { response?: unknown }).response === 'object' &&
          (err as { response?: { status?: unknown } }).response?.status !== undefined &&
          typeof (err as { response: { status: unknown } }).response.status === 'number'
        );
      }
      const status = hasResponseStatus(error) ? error.response.status : 500;
      throw new AppError(
        'API request failed',
        { status, endpoint, method },
        error
      );
    }
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export get and post for compatibility with legacy imports
export const get = apiClient.get.bind(apiClient);
export const post = apiClient.post.bind(apiClient);
