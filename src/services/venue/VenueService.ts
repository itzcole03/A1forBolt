
// VenueService: Provides venue information and advanced modeling for sports events.
import axios, { AxiosResponse } from 'axios';

export interface VenueData {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  altitude?: number;
  surfaceType?: string;
  capacity?: number;
  roofType?: 'open' | 'closed' | 'retractable' | null;
  crowdFactor?: number;
  extra?: Record<string, unknown>;
}

export class VenueService {
  /**
   * Fetch venue by ID from external API
   */
  async getVenueById(venueId: string): Promise<VenueData | null> {
    try {
      const res: AxiosResponse<VenueData> = await (axios as unknown as { get: (url: string) => Promise<AxiosResponse<VenueData>> }).get(`/api/venues/${venueId}`);
      return res.data;
    } catch (_err) {
      // fallback to null if not found
      return null;
    }
  }

  /**
   * Search venues by name/city/state
   */
  async searchVenues(query: string): Promise<VenueData[]> {
    const res: AxiosResponse<VenueData[]> = await (axios as unknown as { get: (url: string) => Promise<AxiosResponse<VenueData[]>> }).get(`/api/venues?search=${encodeURIComponent(query)}`);
    return res.data;
  }

  /**
   * Batch fetch venues by IDs
   */
  async getVenuesByIds(ids: string[]): Promise<VenueData[]> {
    const res: AxiosResponse<VenueData[]> = await (axios as unknown as { post: (url: string, body: Record<string, string[]>) => Promise<AxiosResponse<VenueData[]>> }).post(`/api/venues/batch`, { ids });
    return res.data;
  }

  /**
   * Advanced modeling endpoint for venue analytics.
   * Integrates with backend ML/analytics API for venue modeling.
   */
  async getVenueModeling(venueId: string): Promise<{ venueId: string; model: string; score: number }> {
    // Example: Replace with real API call when available
    // const response = await axios.get<{ venueId: string; model: string; score: number }>(`/api/venues/${venueId}/modeling`);
    // return response.data;
    throw new Error('Venue modeling integration not yet implemented. Please connect to the backend ML/analytics API.');
  }
}

export const venueService = new VenueService();
