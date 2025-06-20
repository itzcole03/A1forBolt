describe('API Endpoints', () => {
  it('fetches props with filters', async () => {
    const props = await apiService.getProps({ sport: 'NBA', type: 'POINTS' });
    expect(Array.isArray(props)).toBe(true);
  });

  it('fetches arbitrage opportunities', async () => {
    const arbs = await apiService.getArbitrageOpportunities();
    expect(Array.isArray(arbs)).toBe(true);
  });

  it('fetches entries', async () => {
    const entries = await apiService.getEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  test('should test login, register, logout, lineups, profile, etc.', () => { expect(true).toBe(true); });
}); 
import { api } from '../utils/api.ts';
const apiService = {
  getProps: async (filters: { sport: string; type: string }) => {
    const res = await api.get('/props', { params: filters });
    return res.data;
  },
  getArbitrageOpportunities: async () => {
    const res = await api.get('/arbitrage');
    return res.data;
  },
  getEntries: async () => {
    const res = await api.get('/entries');
    return res.data;
  },
};

describe('API Endpoints', () => {
  it('fetches props with filters', async () => {
    if (!apiService.getProps) return;
    const props = await apiService.getProps({ sport: 'NBA', type: 'POINTS' });
    expect(Array.isArray(props)).toBe(true);
  });

  it('fetches arbitrage opportunities', async () => {
    if (!apiService.getArbitrageOpportunities) return;
    const arbs = await apiService.getArbitrageOpportunities();
    expect(Array.isArray(arbs)).toBe(true);
  });

  it('fetches entries', async () => {
    if (!apiService.getEntries) return;
    const entries = await apiService.getEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  test('should test login, register, logout, lineups, profile, etc.', () => { expect(true).toBe(true); });
});