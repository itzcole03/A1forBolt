// BetBuilder.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BetBuilder } from './BetBuilder';

describe('BetBuilder', () => {
  it('renders SmartControlsBar and PayoutPreview', () => {
    render(<BetBuilder />);
    expect(screen.getByText(/Model:/i)).toBeInTheDocument();
    expect(screen.getByText(/Payout Preview/i)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<BetBuilder />);
    expect(asFragment()).toMatchSnapshot();
  });
});
