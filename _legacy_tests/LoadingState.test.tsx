import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingState from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const message = 'Custom loading message';
    render(<LoadingState message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const size = 60;
    render(<LoadingState size={size} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveStyle({ width: `${size}px`, height: `${size}px` });
  });
});
