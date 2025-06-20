// PayoutPreview.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PayoutPreview } from './PayoutPreview.js';

describe('PayoutPreview', () => {
  it('renders payout preview title and loading state', () => {
    render(<PayoutPreview eventId="test-event" />);
    expect(screen.getByText(/Payout Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading payout preview/i)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<PayoutPreview eventId="test-event" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
