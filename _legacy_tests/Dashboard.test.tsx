import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { ThemeProvider } from '../ThemeProvider';
import { prizePicksService } from '../../services/prizePicksService';

// Mock services
jest.mock('../../services/prizePicksService', () => ({
  prizePicksService: {
    fetchPrizePicksProps: jest.fn(),
  },
}));

// Mock WebSocket service
jest.mock('../../services/websocket_service', () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

describe('Dashboard', () => {
  const mockProjections = [
    {
      playerName: 'LeBron James',
      teamAbbrev: 'LAL',
      position: 'F',
      statType: 'Points',
      opponent: 'BOS',
      lineScore: 25.5,
      confidence: 0.85,
      propType: 'normal',
      fireCount: 0,
    },
    {
      playerName: 'Stephen Curry',
      teamAbbrev: 'GSW',
      position: 'G',
      statType: '3PM',
      opponent: 'PHX',
      lineScore: 4.5,
      confidence: 0.75,
      propType: 'goblin',
      fireCount: 2,
    },
  ];

  const mockInitialMetrics = {
    monthlyPL: 1200,
    monthlyROI: 0.15,
    aiAccuracy: 0.85,
    activeArbitrage: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prizePicksService.fetchPrizePicksProps as jest.Mock).mockResolvedValue(mockProjections);
  });

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it('renders dashboard with initial state', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    expect(screen.getByText('Sports Betting Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loading props...')).toBeInTheDocument();
  });

  it('loads and displays props', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    });

    expect(prizePicksService.fetchPrizePicksProps).toHaveBeenCalled();
  });

  it('handles filter changes', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Filter by player or stat...');
    fireEvent.change(filterInput, { target: { value: 'LeBron' } });

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
  });

  it('handles sort changes', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'confidence' } });

    const projections = screen.getAllByTestId('prop-card');
    expect(projections[0]).toHaveTextContent('LeBron James'); // Higher confidence first
  });

  it('handles error state', async () => {
    (prizePicksService.fetchPrizePicksProps as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('Error loading props')).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    (prizePicksService.fetchPrizePicksProps as jest.Mock).mockResolvedValue([]);

    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('No props available')).toBeInTheDocument();
    });
  });

  it('updates props on refresh', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(prizePicksService.fetchPrizePicksProps).toHaveBeenCalledTimes(2);
  });

  it('handles prop selection', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const propCard = screen.getByText('LeBron James').closest('button');
    fireEvent.click(propCard!);

    expect(screen.getByText('Selected Prop Details')).toBeInTheDocument();
  });

  it('applies responsive layout', async () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    const container = screen.getByTestId('dashboard-container');
    expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('shows loading skeleton during initial load', () => {
    renderWithTheme(<Dashboard initialMetrics={mockInitialMetrics} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});
