import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../Dashboard';
import { getActiveBets, getTotalWinnings, getWinRate } from '@services/bettingService';

// Mock the betting service
jest.mock('@services/bettingService', () => ({
  getActiveBets: jest.fn(),
  getTotalWinnings: jest.fn(),
  getWinRate: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderDashboard = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderDashboard();
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  it('renders error state when API calls fail', async () => {
    (getActiveBets as jest.Mock).mockRejectedValue(new Error('API Error'));
    (getTotalWinnings as jest.Mock).mockRejectedValue(new Error('API Error'));
    (getWinRate as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('renders dashboard data when API calls succeed', async () => {
    (getActiveBets as jest.Mock).mockResolvedValue(5);
    (getTotalWinnings as jest.Mock).mockResolvedValue(1000);
    (getWinRate as jest.Mock).mockResolvedValue(75);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});
