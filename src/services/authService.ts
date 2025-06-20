import { AppError, APIError } from '../core/UnifiedError';
import { User } from '../types';
import { unifiedMonitor } from '../core/UnifiedMonitor';

// src/services/authService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_API_PREFIX = `${API_BASE_URL}/api/auth`;

// Matches the Token model from backend/routes/auth_route.py
interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user: User; // Assuming backend User model matches frontend User type
}

// Response structure expected by the original frontend code (e.g., AuthSlice)
interface AuthServiceLoginResponse {
  user: User;
  token: string;
}

/**
 * Logs in a user.
 * Expected backend response (from /api/auth/login):
 * {
 *   "access_token": "string (jwt)",
 *   "token_type": "bearer",
 *   "user": { "id": "string", "username": "string", "email": "string", ... }
 * }
 */
export const login = async (credentials: { email: string; password: string }): Promise<AuthServiceLoginResponse> => {
  const trace = unifiedMonitor.startTrace('authService.login', 'http.client');
  try {
    const { post } = await import('./api');
    const response = await post<BackendTokenResponse>(`${AUTH_API_PREFIX}/login`, credentials);
    
    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }

    // Adapt backend response to the structure AuthSlice expects
    return {
      user: response.data.user,
      token: response.data.access_token,
    };
  } catch (error: any) {
    const errContext = { service: 'authService', operation: 'login', email: credentials.email };
    unifiedMonitor.reportError(error, errContext);
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    if (error.response && error.response.data && error.response.data.detail) {
      throw new APIError(error.response.data.detail, error.response.status, errContext, error);
    }
    throw new AppError('Login failed. Please check your credentials or try again later.', undefined, errContext, error);
  }
};

// Logout is typically a client-side token removal. 
// The backend /auth/logout is a placeholder but can be called for completeness.
export const logout = async (): Promise<void> => {
  const trace = unifiedMonitor.startTrace('authService.logout', 'http.client');
  try {
    const { post } = await import('./api');
    await post(`${AUTH_API_PREFIX}/logout`); 
    if (trace) {
        trace.setHttpStatus(200); // Assuming logout call is fire and forget or returns 200
        unifiedMonitor.endTrace(trace);
    }
  } catch (error: any) {
    // Usually, logout errors aren't critical for the client's ability to log out (clear token).
    unifiedMonitor.reportError(error, { service: 'authService', operation: 'logout' }, 'warning');
    if (trace) {
        trace.setHttpStatus(error.response?.status || 500);
        unifiedMonitor.endTrace(trace);
    }
  }
  // Primary logout action (clearing token) is handled in the authSlice or consuming component.
};

/**
 * Fetches the current authenticated user's details.
 * Requires a valid JWT in the Authorization header (handled by apiClient interceptor).
 * Expected backend response (from /api/users/me, which should be a protected route):
 * {
 *   "id": "string",
 *   "username": "string",
 *   "email": "string",
 *   // ... other user fields as defined in the User type
 * }
 */
export const fetchCurrentUser = async (): Promise<User> => {
    const trace = unifiedMonitor.startTrace('authService.fetchCurrentUser', 'http.client');
    try {
        const { get } = await import('./api');
        const response = await get<User>(`${API_BASE_URL}/api/users/me`);
        if (trace) {
            trace.setHttpStatus(response.status);
            unifiedMonitor.endTrace(trace);
        }
        return response.data;
    } catch (error: any) {
        const errContext = { service: 'authService', operation: 'fetchCurrentUser' };
        unifiedMonitor.reportError(error, errContext);
        if (trace) {
            trace.setHttpStatus(error.response?.status || 500);
            unifiedMonitor.endTrace(trace);
        }
        if (error.response && error.response.status === 401) {
             throw new APIError('Unauthorized. Please log in again.', 401, errContext, error);
        }
        throw new AppError('Failed to fetch user profile.', undefined, errContext, error);
    }
};

// Combining into a service object as per original structure
export const authService = {
  login,
  logout,
  fetchCurrentUser,
}; 