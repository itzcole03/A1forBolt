import React from 'react';
import { render, screen } from '@testing-library/react';
import { measurePerformance } from '../performanceMonitor';
import App from '../../../App';

// test('renders App without crashing', () => {
//   render(<App />);
// });

test('App loads in under 2 seconds', async () => {
  await measurePerformance(async () => {
    // render(<App />);
    await screen.findByText(/Dashboard/i);
  }, 'App initial load');
});
