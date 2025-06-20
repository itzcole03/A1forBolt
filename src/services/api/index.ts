export { get, post } from "./client.js";
export { apiService } from "./ApiService.js";
import { apiService } from "./ApiService.js";
export const api = apiService;

// Import types
export type { Player } from "../../types/api.js";

// Lineup API functions
export interface LineupSubmission {
  players: string[]; // player IDs
  totalSalary: number;
  sport: string;
  contestId?: string;
}

export async function getPlayers(): Promise<Player[]> {
  // TODO: Replace with actual API call when backend is ready
  // For now, return mock data to prevent build failures
  return [];
}

export async function submitLineup(
  lineup: LineupSubmission,
): Promise<{ success: boolean; lineupId?: string }> {
  // TODO: Replace with actual API call when backend is ready
  // For now, return mock response to prevent build failures
  return { success: true, lineupId: "mock-lineup-id" };
}
