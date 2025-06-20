
// AffiliateService: Manages affiliate/partner links, tracking, and offers.
// Integrates with affiliate APIs and tracking partners.

import { wrapWithRateLimit } from '../rateLimit/wrapWithRateLimit.js';
import { API_CONFIG } from '../../config/apiConfig.js';


export interface AffiliateLink {
  id: string;
  partnerName: string;
  url: string;
  campaignCode?: string;
  active: boolean;
  offerId?: string;
}

export interface AffiliateOffer {
  id: string;
  partnerName: string;
  description: string;
  url: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}


export class AffiliateService {
  /**
   * Fetch all affiliate links for a user from backend/partner API
   */
  getAffiliateLinks = wrapWithRateLimit(async (userId: string): Promise<AffiliateLink[]> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/users/${userId}/affiliate-links`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch affiliate links: ${res.statusText}`);
    return (await res.json()) as AffiliateLink[];
  });

  /**
   * Track a click on an affiliate link
   */
  trackAffiliateClick = wrapWithRateLimit(async (linkId: string, userId: string): Promise<void> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/affiliate-links/${linkId}/track`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error(`Failed to track affiliate click: ${res.statusText}`);
  });

  /**
   * Fetch all active affiliate offers
   */
  getAffiliateOffers = wrapWithRateLimit(async (): Promise<AffiliateOffer[]> => {
    const url = `${API_CONFIG.SPORTS_DATA.BASE_URL}/affiliate-offers`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY }
    });
    if (!res.ok) throw new Error(`Failed to fetch affiliate offers: ${res.statusText}`);
    return (await res.json()) as AffiliateOffer[];
  });
}

export const affiliateService = new AffiliateService();
