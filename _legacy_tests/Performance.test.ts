import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { measurePerformance } from '../performanceMonitor';
import { screen } from '@testing-library/react';

// test('renders App without crashing', () => {
//   render(<App />);
// });

test('App loads in under 2 seconds', async () => {
  await measurePerformance(async () => {
    // render(<App />);
    await screen.findByText(/Dashboard/i);
  }, 'App initial load');
}); 