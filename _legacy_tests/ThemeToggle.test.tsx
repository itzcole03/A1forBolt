import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { useThemeStore } from '@stores/themeStore';
import type { ThemeState } from '@stores/themeStore';

// Mock the theme store
jest.mock('@stores/themeStore', () => ({
  useThemeStore: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct icon based on theme mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();

    // Update theme mode to dark
    (useThemeStore as unknown as jest.Mock).mockReturnValue({
      mode: 'dark',
      toggleTheme: mockToggleTheme,
    });
    render(<ThemeToggle />);
    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
