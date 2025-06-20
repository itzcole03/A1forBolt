import { useEffect, useState } from 'react';
import { newsService } from '../services/newsService.js';
import type { ESPNHeadline } from '../types.js';

// Define SportsNewsArticle type if not available
export type SportsNewsArticle = {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
  category?: string;
};

export function useSportsNews() {
  const [articles, setArticles] = useState<SportsNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    newsService.fetchHeadlines('espn', 10)
      .then((headlines: ESPNHeadline[]) => {
        // Map ESPNHeadline to SportsNewsArticle if needed
        const mapped = headlines.map(h => ({
          id: h.id,
          title: h.title || h.summary || '',
          summary: h.summary || h.title || '',
          link: h.link,
          publishedAt: h.publishedAt || '',
          source: h.source || 'ESPN',
          imageUrl: h.imageUrl || '',
          category: h.category || '',
        }));
        if (mounted) setArticles(mapped);
      })
      .catch(err => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { articles, loading, error };
}
