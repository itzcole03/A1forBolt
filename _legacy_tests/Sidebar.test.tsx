import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { useThemeStore } from '@stores/themeStore';
import type { ThemeState } from '@stores/themeStore';

// Mock the theme store
jest.mock('@stores/themeStore', () => ({
  useThemeStore: jest.fn(),
}));

// Mock the router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

describe('Sidebar', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'light',
    });
  });

  it('renders the sidebar with navigation items', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bets')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders the theme toggle', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('applies correct styling based on theme mode', () => {
    render(<Sidebar {...defaultProps} />);
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveStyle({ backgroundColor: 'var(--mui-palette-background-paper)' });

    // Update theme mode to dark
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'dark',
    });
    render(<Sidebar {...defaultProps} />);
    expect(sidebar).toHaveStyle({ backgroundColor: 'var(--mui-palette-background-paper)' });
  });

  it('calls onClose when clicking outside', () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(document.body);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
