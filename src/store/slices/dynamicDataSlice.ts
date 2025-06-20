import type { StateCreator } from 'zustand';
import type { DailyFantasyProjection } from '../../types/fantasy';
import type { ESPNHeadline } from '../../types/news';
import type { SocialSentimentData } from '../../types/sentiment';
import type { OddsData } from '../../types/betting';
// ActiveSubscription is not defined in types/webSocket.ts, so define it locally here for now
export type ActiveSubscription = {
  feedName: string;
  subscribedAt: string;
  // Allow additional properties, but avoid 'any'.
  [key: string]: unknown;
};
import { newsService } from '../../services/newsService';
import { sentimentService } from '../../services/sentimentService';
import { dataScrapingService } from '../../services/dataScrapingService';
import type { AppStore } from '../useAppStore';

export interface DynamicDataSlice {
  sentiments: Record<string, SocialSentimentData>; // Keyed by topic/player name
  headlines: ESPNHeadline[];
  dailyFantasyProjections: DailyFantasyProjection[];
  liveOdds: Record<string, OddsData>; // Keyed by propId or marketId
  activeSubscriptions: ActiveSubscription[];
  isLoadingSentiments: boolean;
  isLoadingHeadlines: boolean;
  isLoadingFantasyProjections: boolean;
  error: string | null; // Shared error for this slice
  fetchSentiments: (topic: string) => Promise<void>;
  fetchHeadlines: () => Promise<void>;
  fetchDailyFantasyProjections: (date: string, league?: string) => Promise<void>;
  updateLiveOdd: (odd: OddsData) => void; // For WebSocket updates
  addSubscription: (subscription: ActiveSubscription) => void;
  removeSubscription: (feedName: string) => void;
}

export const initialDynamicDataState: Pick<
  DynamicDataSlice,
  | 'sentiments'
  | 'headlines'
  | 'dailyFantasyProjections'
  | 'liveOdds'
  | 'activeSubscriptions'
  | 'isLoadingSentiments'
  | 'isLoadingHeadlines'
  | 'isLoadingFantasyProjections'
  | 'error'
> = {
  sentiments: {},
  headlines: [],
  dailyFantasyProjections: [],
  liveOdds: {},
  activeSubscriptions: [],
  isLoadingSentiments: false,
  isLoadingHeadlines: false,
  isLoadingFantasyProjections: false,
  error: null,
};

export const createDynamicDataSlice: StateCreator<AppStore, [], [], DynamicDataSlice> = (
  set,
  get
) => ({
  ...initialDynamicDataState,
  fetchSentiments: async topic => {
    set({ isLoadingSentiments: true, error: null });
    try {
      const sentimentData = await sentimentService.fetchSocialSentiment(topic);
      set((state: DynamicDataSlice) => ({
        sentiments: { ...state.sentiments, [topic.toLowerCase()]: sentimentData },
        isLoadingSentiments: false,
      }));
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch sentiments';
      set({ error: errorMsg, isLoadingSentiments: false });
      get().addToast({
        message: `Error fetching sentiment for ${topic}: ${errorMsg}`,
        type: 'error',
      });
    }
  },
  fetchHeadlines: async () => {
    set({ isLoadingHeadlines: true, error: null });
    try {
      const headlines = await newsService.fetchHeadlines(); // Default source 'espn'
      set({ headlines, isLoadingHeadlines: false });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch headlines';
      set({ error: errorMsg, isLoadingHeadlines: false });
      get().addToast({ message: `Error fetching headlines: ${errorMsg}`, type: 'error' });
    }
  },
  fetchDailyFantasyProjections: async (date, league) => {
    set({ isLoadingFantasyProjections: true, error: null });
    try {
      const projections = await dataScrapingService.fetchDailyFantasyProjections(date, league);
      set({ dailyFantasyProjections: projections, isLoadingFantasyProjections: false });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to fetch fantasy projections';
      set({ error: errorMsg, isLoadingFantasyProjections: false });
      get().addToast({
        message: `Error fetching Daily Fantasy Projections: ${errorMsg}`,
        type: 'error',
      });
    }
  },
  updateLiveOdd: (odd: OddsData) => {
    set((state: DynamicDataSlice) => ({
      liveOdds: { ...state.liveOdds, [odd.event_id]: odd },
    }));
    // Optionally, add a toast or log this update
    // get().addToast({ message: `Live odds updated for event ${odd.event_id}`, type: 'info' });
  },
  addSubscription: subscription => {
    set((state: DynamicDataSlice) => ({
      activeSubscriptions: [
        ...state.activeSubscriptions.filter((s: ActiveSubscription) => s.feedName !== subscription.feedName),
        subscription,
      ],
    }));
  },
  removeSubscription: feedName => {
    set((state: DynamicDataSlice) => ({
      activeSubscriptions: state.activeSubscriptions.filter((s: ActiveSubscription) => s.feedName !== feedName),
    }));
  },
});
