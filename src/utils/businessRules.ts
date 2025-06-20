import { PlayerProp, Entry } from '../types/core';


// Centralized business rules for the app

// Minimum win rate (e.g., 84%)
export const MIN_WIN_RATE = 0.84;

// Example: Enforce team diversification (no more than X players from the same team)
export function isTeamDiversified(props: PlayerProp[], maxPerTeam = 2): boolean {
  const teamCounts: Record<string, number> = {};
  for (const prop of props) {
    const teamId = prop.player.team.id;
    teamCounts[teamId] = (teamCounts[teamId] || 0) + 1;
    if (teamCounts[teamId] > maxPerTeam) return false;
  }
  return true;
}

/**
 * Returns the multiplier for a given entry type.
 * Extend this logic as new types or business rules are added.
 */
export function getMultiplier(type: 'goblin' | 'normal' | 'demon'): number {
  switch (type) {
    case 'goblin': return 1.5;
    case 'demon': return 3.0;
    case 'normal':
    default:
      return 2.0;
  }
}

// Validate entry against all business rules
export function validateEntry(entry: Entry): string[] {
  const errors: string[] = [];
  // Enforce minimum win rate
  if (entry.props.some(prop => prop.confidence < MIN_WIN_RATE)) {
    errors.push(`All props must have at least ${(MIN_WIN_RATE * 100).toFixed(0)}% win rate.`);
  }
  // Enforce team diversification
  if (!isTeamDiversified(entry.props)) {
    errors.push('Too many props from the same team.');
  }
  // Add more rules as needed
  return errors;
}