import { affiliateService, AffiliateLink, AffiliateOffer } from '../AffiliateService';

global.fetch = jest.fn();

describe('AffiliateService', () => {
  const userId = 'user123';
  const linkId = 'link456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches affiliate links', async () => {
    const mockLinks: AffiliateLink[] = [
      { id: '1', partnerName: 'PartnerA', url: 'https://a.com', active: true },
      { id: '2', partnerName: 'PartnerB', url: 'https://b.com', active: false }
    ];
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => mockLinks });
    const links = await affiliateService.getAffiliateLinks(userId);
    expect(links).toEqual(mockLinks);
    expect(fetch).toHaveBeenCalled();
  });

  it('throws on affiliate links fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, statusText: 'Not Found' });
    await expect(affiliateService.getAffiliateLinks(userId)).rejects.toThrow('Failed to fetch affiliate links: Not Found');
  });

  it('tracks affiliate click', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    await expect(affiliateService.trackAffiliateClick(linkId, userId)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalled();
  });

  it('throws on affiliate click track failure', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, statusText: 'Bad Request' });
    await expect(affiliateService.trackAffiliateClick(linkId, userId)).rejects.toThrow('Failed to track affiliate click: Bad Request');
  });

  it('fetches affiliate offers', async () => {
    const mockOffers: AffiliateOffer[] = [
      { id: '1', partnerName: 'PartnerA', description: 'Offer1', url: 'https://a.com', validFrom: '2025-01-01', validTo: '2025-12-31', isActive: true }
    ];
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => mockOffers });
    const offers = await affiliateService.getAffiliateOffers();
    expect(offers).toEqual(mockOffers);
    expect(fetch).toHaveBeenCalled();
  });

  it('throws on affiliate offers fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, statusText: 'Server Error' });
    await expect(affiliateService.getAffiliateOffers()).rejects.toThrow('Failed to fetch affiliate offers: Server Error');
  });
});
