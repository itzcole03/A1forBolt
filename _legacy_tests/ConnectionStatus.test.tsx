import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../ConnectionStatus';
import { useWebSocketStore } from '../../services/websocket';

// Mock the WebSocket store
vi.mock('../../services/websocket', () => ({
  useWebSocketStore: vi.fn(),
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('shows reconnecting state with spinner', () => {
    (useWebSocketStore as any).mockReturnValue({
      isConnected: false,
      isReconnecting: true,
      lastError: null,
      resetError: vi.fn(),
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows disconnected state', () => {
    (useWebSocketStore as any).mockReturnValue({
      isConnected: false,
      isReconnecting: false,
      lastError: null,
      resetError: vi.fn(),
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows error message in snackbar', () => {
    const mockError = 'Connection failed';
    const mockResetError = vi.fn();

    (useWebSocketStore as any).mockReturnValue({
      isConnected: false,
      isReconnecting: false,
      lastError: mockError,
      resetError: mockResetError,
    });

    render(<ConnectionStatus />);

    expect(screen.getByText(mockError)).toBeInTheDocument();
  });

  it('hides status when connected', () => {
    (useWebSocketStore as any).mockReturnValue({
      isConnected: true,
      isReconnecting: false,
      lastError: null,
      resetError: vi.fn(),
    });

    render(<ConnectionStatus />);

    expect(screen.queryByText('Reconnecting...')).not.toBeInTheDocument();
    expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
  });

  it('allows dismissing error message', () => {
    const mockError = 'Connection failed';
    const mockResetError = vi.fn();

    (useWebSocketStore as any).mockReturnValue({
      isConnected: false,
      isReconnecting: false,
      lastError: mockError,
      resetError: mockResetError,
    });

    render(<ConnectionStatus />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();

    expect(mockResetError).toHaveBeenCalled();
  });

  it('applies fade-in animation', () => {
    (useWebSocketStore as any).mockReturnValue({
      isConnected: false,
      isReconnecting: true,
      lastError: null,
      resetError: vi.fn(),
    });

    const { container } = render(<ConnectionStatus />);

    const statusContainer = container.firstChild;
    expect(statusContainer).toHaveStyle({
      animation: expect.stringContaining('fadeIn'),
    });
  });
});
