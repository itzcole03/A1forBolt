import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

test('renders dashboard route by default', () => {
  render(<App />);
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});
