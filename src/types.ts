// Type definitions for feature engineering analytics
export type FeatureConfig = object;

export type EngineeredFeatures = object;

export type RawPlayerData = object;

// ESPN Headline interface for newsService
export interface ESPNHeadline {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: string;
  imageUrl: string;
  category: string;
}
