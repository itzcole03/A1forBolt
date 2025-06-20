// Types for ESPN headlines and news data
// Use the canonical ESPNHeadline definition from src/types.ts for compatibility
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
