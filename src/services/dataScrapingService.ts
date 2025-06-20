import { APIError, AppError } from '../core/UnifiedError';
import { DailyFantasyProjection } from '../types';
import { get, post } from './api';
import { unifiedMonitor } from '../core/UnifiedMonitor'; // Added for tracing/error reporting

// Import relevant types for scraped data (e.g., from ../types/scrapedData.ts - to be created)
// interface DailyFantasyProjection { ... }

const API_BASE_URL = import.meta.env.VITE_API_URL;
const DATA_SCRAPING_BACKEND_PREFIX = `${API_BASE_URL}/api/data-scraping`;

/**
 * Fetches daily fantasy projections from the backend.
 * The backend /api/data-scraping/daily-fantasy-projections endpoint is currently mocked.
 * Expected backend response is an array of BackendDFPResponseItem (defined in this file).
 * Example Item:
 * {
 *   "player_id": "string",
 *   "player_name": "string",
 *   "team": "string",
 *   "position": "string",
 *   "projection": number,
 *   "salary": number (optional),
 *   "source": "string",
 *   "game_date": "YYYY-MM-DD",
 *   "league": "string"
 * }
 */
export const fetchDailyFantasyProjections = async (date: string, league?: string): Promise<DailyFantasyProjection[]> => {
  const trace = unifiedMonitor.startTrace('dataScrapingService.fetchDailyFantasyProjections', 'http.client');
  try {
    let endpoint = `${DATA_SCRAPING_BACKEND_PREFIX}/daily-fantasy-projections`;
    const params = new URLSearchParams();
    if (date) params.append('game_date', date);
    if (league) params.append('league', league);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await get<BackendDFPResponseItem[]>(endpoint);

    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }
    
    const mappedData = response.data ? response.data.map(mapBackendDFPToFrontend) : [];
    return mappedData;

  } catch (error: any) {
    const errContext = { service: 'dataScrapingService', operation: 'fetchDailyFantasyProjections', date, league };
    unifiedMonitor.reportError(error, errContext);
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    if (error instanceof APIError || error instanceof AppError) throw error;
    throw new AppError('Failed to fetch daily fantasy projections from backend.', undefined, errContext, error);
  }
};

/**
 * Triggers a data scraping job on the backend.
 * The backend /api/data-scraping/trigger-job endpoint is currently mocked.
 * Expected backend response is BackendScrapingJobStatus (defined in this file).
 * Example Response:
 * {
 *   "job_id": "string",
 *   "status": "string (e.g., pending, running, completed, failed)",
 *   "message": "string (optional)",
 *   "created_at": "ISO_datetime_string",
 *   "updated_at": "ISO_datetime_string (optional)",
 *   "result_summary": { ... } (optional)
 * }
 */
export const triggerScrapingJob = async (job_type: string, league?: string, target_date?: string): Promise<{ jobId: string; status: string; message?: string }> => {
  const trace = unifiedMonitor.startTrace('dataScrapingService.triggerScrapingJob', 'http.client');
  try {
    let endpoint = `${DATA_SCRAPING_BACKEND_PREFIX}/trigger-job`;
    const params = new URLSearchParams();
    if (job_type) params.append('job_type', job_type);
    if (league) params.append('league', league);
    if (target_date) params.append('target_date', target_date); // alias is target_date in backend for target_date_str
    // Note: Backend uses POST but takes params in URL for this mock. Adjust if backend changes to use request body.
    if (params.toString()) endpoint += `?${params.toString()}`;

    // Backend endpoint is POST, but parameters are query parameters for the mock.
    // If it were a true POST with body, it'd be: post<BackendScrapingJobStatus>(endpoint, { job_type, league, target_date })
    const response = await post<BackendScrapingJobStatus>(endpoint, null); // Sending null body as params are in URL

    if (trace) {
      trace.setHttpStatus(response.status);
      unifiedMonitor.endTrace(trace);
    }
    return {
        jobId: response.data.job_id,
        status: response.data.status,
        message: response.data.message,
    };

  } catch (error: any) {
    const errContext = { service: 'dataScrapingService', operation: 'triggerScrapingJob', job_type, league, target_date };
    unifiedMonitor.reportError(error, errContext);
    if (trace) {
      trace.setHttpStatus(error.response?.status || 500);
      unifiedMonitor.endTrace(trace);
    }
    if (error instanceof APIError || error instanceof AppError) throw error;
    throw new AppError('Failed to trigger scraping job on backend.', undefined, errContext, error);
  }
};

interface BackendDFPResponseItem {
    player_id: string;
    player_name: string;
    team: string;
    position: string;
    projection: number;
    salary?: number;
    source: string;
    game_date: string; // date as string YYYY-MM-DD
    league: string;
}

const mapBackendDFPToFrontend = (backendItem: BackendDFPResponseItem): DailyFantasyProjection => {
    return {
        playerId: backendItem.player_id,
        playerName: backendItem.player_name,
        team: backendItem.team,
        // opponent: undefined, // Backend mock doesn't provide opponent
        projection: backendItem.projection,
        statType: backendItem.position, // Or a more specific mapping if available
        salary: backendItem.salary,
        source: backendItem.source,
        lastUpdatedAt: new Date(backendItem.game_date).toISOString(), // Using game_date as lastUpdatedAt for now
    };
};

interface BackendScrapingJobStatus {
    job_id: string;
    status: string; 
    message?: string;
    created_at: string; // datetime as string
    updated_at?: string; // datetime as string
    result_summary?: Record<string, any>;
}

export const dataScrapingService = {
  fetchDailyFantasyProjections,
  triggerScrapingJob,
  // getJobStatus: async (jobId: string) => { /* ... */ }, // Future implementation
}; 