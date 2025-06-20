// EnhancedPropCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedPropCard } from './EnhancedPropCard';

describe('EnhancedPropCard', () => {
  const baseProps = {
    playerName: 'LeBron James',
    statType: 'Points',
    line: 27.5,
    overOdds: 1.85,
    underOdds: 1.95,
    sentiment: 'Bullish',
    aiBoost: 0.12,
    patternStrength: 0.8,
    bonusPercent: 4,
    enhancementPercent: 2.5,
    selected: true,
  };

  it('renders player name and stat type', () => {
    render(<EnhancedPropCard {...baseProps} />);
    expect(screen.getByText(/LeBron James/)).toBeInTheDocument();
    expect(screen.getByText(/Points/)).toBeInTheDocument();
  });

  it('calls onSelect when over/under is clicked', () => {
    const onSelect = jest.fn();
    render(<EnhancedPropCard {...baseProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByText(/Over/i));
    expect(onSelect).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<EnhancedPropCard {...baseProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
