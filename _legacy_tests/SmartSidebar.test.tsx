import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { SmartSidebar } from '../SmartSidebar';
import { useStore } from '../../../stores/useStore';

// Mock the useStore hook
jest.mock('../../../stores/useStore', () => ({
  useStore: jest.fn(),
}));

describe('SmartSidebar', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useStore as jest.Mock).mockReturnValue({
      state: {
        // Add any required state here
      },
    });
  });

  it('renders correctly when open', () => {
    render(<SmartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SmartSidebar isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('has correct initial animation state', () => {
    render(<SmartSidebar isOpen={false} onClose={mockOnClose} />);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveStyle({ transform: 'translateX(-300px)' });
  });
});
