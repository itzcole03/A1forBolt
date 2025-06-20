export const API_CONFIG = {
  theOdds: {
    apiKey:
      import.meta.env.VITE_THE_ODDS_API_KEY ||
      "8684be37505fc5ce63b0337d472af0ee",
    baseUrl: "https://api.the-odds-api.com/v4",
  },
  sportRadar: {
    apiKey:
      import.meta.env.VITE_SPORTRADAR_API_KEY ||
      "zi7atwynSXOAyizHo1L3fR5Yv8mfBX12LccJbCHb",
    baseUrl: "https://api.sportradar.com/v1",
  },
  dailyFantasy: {
    apiKey:
      import.meta.env.VITE_DAILYFANTASY_API_KEY ||
      "f3ac5a9c-cf01-4dc8-8edb-c02bf6c31a4d",
    baseUrl: "https://api.dailyfantasy.com/v1",
  },
};
