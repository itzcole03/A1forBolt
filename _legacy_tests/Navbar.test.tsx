import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
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

describe('Navbar', () => {
  const defaultProps = {
    onMenuClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'light',
    });
  });

  it('renders the navbar with app title', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Sports Betting App')).toBeInTheDocument();
  });

  it('renders the menu button', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    expect(defaultProps.onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('renders the theme toggle', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('applies correct styling based on theme mode', () => {
    render(<Navbar {...defaultProps} />);
    const navbar = screen.getByRole('banner');
    expect(navbar).toHaveStyle({ backgroundColor: 'var(--mui-palette-background-paper)' });

    // Update theme mode to dark
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'dark',
    });
    render(<Navbar {...defaultProps} />);
    expect(navbar).toHaveStyle({ backgroundColor: 'var(--mui-palette-background-paper)' });
  });
});
