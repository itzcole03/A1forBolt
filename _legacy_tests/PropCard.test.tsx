import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropCard from '../PropCard';
import { ThemeProvider } from '../ThemeProvider';

const mockProjection = {
  playerName: 'LeBron James',
  teamAbbrev: 'LAL',
  position: 'F',
  statType: 'Points',
  opponent: 'BOS',
  lineScore: 25.5,
  confidence: 0.85,
  propType: 'normal',
  fireCount: 0,
};

describe('PropCard', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it('renders prop information correctly', () => {
    renderWithTheme(<PropCard isSelected={false} projection={mockProjection} onClick={() => {}} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('25.5')).toBeInTheDocument();
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('displays confidence rating', () => {
    renderWithTheme(<PropCard isSelected={false} projection={mockProjection} onClick={() => {}} />);

    const confidenceBadge = screen.getByText('85%');
    expect(confidenceBadge).toBeInTheDocument();
    expect(confidenceBadge).toHaveClass('bg-gray-500/20');
  });

  it('shows fire count when present', () => {
    const projectionWithFire = { ...mockProjection, fireCount: 5 };
    renderWithTheme(
      <PropCard isSelected={false} projection={projectionWithFire} onClick={() => {}} />
    );

    expect(screen.getByText('🔥5K')).toBeInTheDocument();
  });

  it('displays prop type emoji', () => {
    renderWithTheme(<PropCard isSelected={false} projection={mockProjection} onClick={() => {}} />);

    expect(screen.getByText('⇄')).toBeInTheDocument();
  });

  it('shows opponent information', () => {
    renderWithTheme(<PropCard isSelected={false} projection={mockProjection} onClick={() => {}} />);

    expect(screen.getByText('vs BOS')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <PropCard isSelected={false} projection={mockProjection} onClick={handleClick} />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies selected state styling', () => {
    renderWithTheme(<PropCard isSelected={true} projection={mockProjection} onClick={() => {}} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('applies position-specific styling', () => {
    const projectionWithPosition = { ...mockProjection, position: 'G' };
    renderWithTheme(
      <PropCard isSelected={false} projection={projectionWithPosition} onClick={() => {}} />
    );

    const positionBadge = screen.getByText('LAL • G');
    expect(positionBadge).toHaveClass('bg-green-500');
  });

  it('applies confidence-specific styling', () => {
    const highConfidenceProjection = { ...mockProjection, confidence: 0.9 };
    renderWithTheme(
      <PropCard isSelected={false} projection={highConfidenceProjection} onClick={() => {}} />
    );

    const confidenceBadge = screen.getByText('90%');
    expect(confidenceBadge).toHaveClass('bg-green-500/20', 'text-green-400');
  });

  it('applies hover effects', () => {
    renderWithTheme(<PropCard isSelected={false} projection={mockProjection} onClick={() => {}} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('hover:scale-105', 'hover:shadow-xl');
  });
});
