import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LiveOddsTicker } from '../LiveOddsTicker';
import { useWebSocketStore } from '../../services/websocket';
import { useOddsStore } from '../../stores/oddsStore';

// Mock the stores
vi.mock('../../services/websocket', () => ({
  useWebSocketStore: vi.fn(),
}));

vi.mock('../../stores/oddsStore', () => ({
  useOddsStore: vi.fn(),
}));

describe('LiveOddsTicker', () => {
  const mockEventId = 'test-event-123';
  const mockOdds = {
    markets: [
      {
        market_type: 'Match Winner',
        selection: 'Home',
        odds: 2.5,
        timestamp: '2024-03-20T12:00:00Z',
      },
      {
        market_type: 'Match Winner',
        selection: 'Away',
        odds: 3.2,
        timestamp: '2024-03-20T12:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock WebSocket store
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEventUpdates: vi.fn(),
      unsubscribeFromEventUpdates: vi.fn(),
    });

    // Mock Odds store
    (useOddsStore as any).mockReturnValue({
      getOddsForEvent: vi.fn().mockReturnValue(mockOdds),
    });
  });

  it('renders loading state initially', () => {
    // Mock empty odds
    (useOddsStore as any).mockReturnValue({
      getOddsForEvent: vi.fn().mockReturnValue(null),
    });

    render(<LiveOddsTicker eventId={mockEventId} />);
    expect(screen.getByText('Loading odds...')).toBeInTheDocument();
  });

  it('renders odds correctly', () => {
    render(<LiveOddsTicker eventId={mockEventId} />);

    // Check if market types are rendered
    expect(screen.getByText('Match Winner')).toBeInTheDocument();

    // Check if selections are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Away')).toBeInTheDocument();

    // Check if odds are rendered
    expect(screen.getByText('2.50')).toBeInTheDocument();
    expect(screen.getByText('3.20')).toBeInTheDocument();
  });

  it('subscribes to event updates on mount and unsubscribes on unmount', () => {
    const { unmount } = render(<LiveOddsTicker eventId={mockEventId} />);

    expect(useWebSocketStore().subscribeToEventUpdates).toHaveBeenCalledWith(mockEventId);

    unmount();

    expect(useWebSocketStore().unsubscribeFromEventUpdates).toHaveBeenCalledWith(mockEventId);
  });

  it('shows animation when odds change', async () => {
    const initialOdds = {
      markets: [
        {
          market_type: 'Match Winner',
          selection: 'Home',
          odds: 2.5,
          timestamp: '2024-03-20T12:00:00Z',
        },
      ],
    };

    const updatedOdds = {
      markets: [
        {
          market_type: 'Match Winner',
          selection: 'Home',
          odds: 2.7,
          timestamp: '2024-03-20T12:00:01Z',
        },
      ],
    };

    // Start with initial odds
    (useOddsStore as any).mockReturnValue({
      getOddsForEvent: vi.fn().mockReturnValue(initialOdds),
    });

    const { rerender } = render(<LiveOddsTicker eventId={mockEventId} />);

    // Update odds
    (useOddsStore as any).mockReturnValue({
      getOddsForEvent: vi.fn().mockReturnValue(updatedOdds),
    });

    rerender(<LiveOddsTicker eventId={mockEventId} />);

    // Check if the odds value has the changed class
    const oddsElement = screen.getByText('2.70');
    expect(oddsElement).toHaveClass('MuiTypography-root');
  });
});
