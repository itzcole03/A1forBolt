// Copied from prototype for RealTimePredictions integration
export const SPORT_OPTIONS = [
    "All",
    "NBA",
    "NFL",
    "MLB",
    "NHL",
    "Soccer",
    "Tennis",
    "Golf",
    "MMA",
    "eSports",
];

export const SPORTS_CONFIG = [
    { id: "NBA", displayName: "NBA Basketball", emoji: "🏀" },
    { id: "NFL", displayName: "NFL Football", emoji: "🏈" },
    { id: "MLB", displayName: "MLB Baseball", emoji: "⚾" },
    { id: "NHL", displayName: "NHL Hockey", emoji: "🏒" },
    { id: "Soccer", displayName: "Soccer", emoji: "⚽" },
    { id: "Tennis", displayName: "Tennis", emoji: "🎾" },
    { id: "Golf", displayName: "Golf", emoji: "⛳" },
    { id: "MMA", displayName: "MMA", emoji: "🥊" },
    { id: "eSports", displayName: "eSports", emoji: "🎮" },
];

export function getSportDisplayName(sport: string): string {
    const found = SPORTS_CONFIG.find((s) => s.id === sport);
    return found ? found.displayName : sport;
}
