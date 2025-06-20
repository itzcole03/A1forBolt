import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import BankrollPage from './BankrollPage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BankrollPage Integration', () => {
  it('renders loading, fetches and displays transactions', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          date: '2025-06-11T12:00:00Z',
          type: 'deposit',
          amount: 100,
          description: 'Initial deposit',
          balance: 100,
        },
      ],
    });
    render(<BankrollPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/initial deposit/i)).toBeInTheDocument());
    expect(screen.getByText(/deposit/i)).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    render(<BankrollPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/api error/i)).toBeInTheDocument());
  });
});
