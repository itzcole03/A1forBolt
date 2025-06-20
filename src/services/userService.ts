
import { API_CONFIG } from '../config/apiConfig.js';
import { wrapWithRateLimit } from './rateLimit/wrapWithRateLimit.js';
import { User, UserPreferences } from '../types/api.js';
import type { PrizePicksEntry } from '../types';
import { unifiedMonitor } from '../core/UnifiedMonitor';

// src/services/userService.ts


/**
 * UserService: Handles user profile, preferences, and entry retrieval.
 * All methods are type-safe, production-ready, and rate-limited.
 */
export class UserService {
  /**
   * Fetch all PrizePicks entries for a user.
   */
  fetchUserEntries = wrapWithRateLimit(async (userId: string): Promise<PrizePicksEntry[]> => {
    const trace = unifiedMonitor.startTrace('userService.fetchUserEntries', 'data.fetch', `UserID: ${userId}`);
    try {
      const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}/entries`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
      });
      if (!res.ok) throw new Error(`Failed to fetch user entries: ${res.statusText}`);
      const data = (await res.json()) as PrizePicksEntry[];
      unifiedMonitor.endTrace(trace);
      return data;
    } catch (error) {
      unifiedMonitor.reportError(error, { operation: 'userService.fetchUserEntries', userId });
      if (trace) unifiedMonitor.endTrace(trace);
      throw error;
    }
  });

  /**
   * Fetch the user profile for a given userId.
   */
  fetchUserProfile = wrapWithRateLimit(async (userId: string): Promise<User> => {
    const trace = unifiedMonitor.startTrace('userService.fetchUserProfile', 'data.fetch', `UserID: ${userId}`);
    try {
      const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
      });
      if (!res.ok) throw new Error(`Failed to fetch user profile: ${res.statusText}`);
      const data = (await res.json()) as User;
      unifiedMonitor.endTrace(trace);
      return data;
    } catch (error) {
      unifiedMonitor.reportError(error, { operation: 'userService.fetchUserProfile', userId });
      if (trace) unifiedMonitor.endTrace(trace);
      throw error;
    }
  });

  /**
   * Update user preferences for a given userId.
   */
  updateUserPreferences = wrapWithRateLimit(async (userId: string, preferences: UserPreferences): Promise<User> => {
    const trace = unifiedMonitor.startTrace('userService.updateUserPreferences', 'data.update', `UserID: ${userId}`);
    try {
      const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}/preferences`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error(`Failed to update user preferences: ${res.statusText}`);
      const data = (await res.json()) as User;
      unifiedMonitor.endTrace(trace);
      return data;
    } catch (error) {
      unifiedMonitor.reportError(error, { operation: 'userService.updateUserPreferences', userId });
      if (trace) unifiedMonitor.endTrace(trace);
      throw error;
    }
  });
}

export const userService = new UserService();