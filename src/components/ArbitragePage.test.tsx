import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ArbitragePage from './ArbitragePage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ArbitragePage Integration', () => {
  it('renders loading, fetches and displays arbitrage opportunities', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          sport: 'NBA',
          event: 'Lakers vs Celtics',
          market: 'Moneyline',
          bookmaker1: { name: 'Book1', odds: 2.1, stake: 50 },
          bookmaker2: { name: 'Book2', odds: 2.2, stake: 50 },
          profit: 10,
          profitPercentage: 10,
          expiresAt: '2025-06-11T12:00:00Z',
        },
      ],
    });
    render(<ArbitragePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/lakers vs celtics/i)).toBeInTheDocument());
    expect(screen.getByText(/nba/i)).toBeInTheDocument();
    expect(screen.getByText(/moneyline/i)).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    render(<ArbitragePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/api error/i)).toBeInTheDocument());
  });
});
