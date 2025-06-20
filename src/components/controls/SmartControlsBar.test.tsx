// SmartControlsBar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartControlsBar } from './SmartControlsBar';

describe('SmartControlsBar', () => {
  it('renders model, risk profile, and confidence controls', () => {
    render(<SmartControlsBar />);
    expect(screen.getByText(/Model:/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk Profile:/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence Threshold:/i)).toBeInTheDocument();
  });

  it('calls setModel when model is changed', () => {
    // Mock store logic if needed
    render(<SmartControlsBar />);
    fireEvent.change(screen.getByDisplayValue('Default'), { target: { value: 'ensemble' } });
    expect(screen.getByDisplayValue('Ensemble')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<SmartControlsBar />);
    expect(asFragment()).toMatchSnapshot();
  });
});
