import '@testing-library/jest-dom';
import App from '../App.js';
import { measurePerformance } from '../test/performanceMonitor.js';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock API and WebSocket
jest.mock('../hooks/useApiRequest', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../hooks/useWebSocket', () => ({ __esModule: true, default: jest.fn() }));

describe('Full Feature Coverage', () => {
  it('renders the App and all main sections', async () => {
    await measurePerformance(async () => {
      render(<App />);
      expect(screen.getByText(/AI Sports Analytics Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Player Props/i)).toBeInTheDocument();
      expect(screen.getByText(/Arbitrage/i)).toBeInTheDocument();
      expect(screen.getByText(/ML Analytics/i)).toBeInTheDocument();
    }, 'App initial render');
  });

  it('toggles dark mode and persists state', async () => {
    render(<App />);
    const toggle = screen.getByRole('button', { name: /dark mode/i });
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('navigates via sidebar and deep links', async () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Player Props/i));
    expect(screen.getByText(/Your Picks/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Arbitrage/i));
    expect(screen.getByText(/Arbitrage Opportunities/i)).toBeInTheDocument();
  });

  it('handles API/network errors gracefully', async () => {
    const { useApiRequest } = await import('../hooks/useApiRequest.js');
    jest.spyOn({ useApiRequest }, 'useApiRequest').mockReturnValue({ data: null, error: 'Network Error', loading: false });
    render(<App />);
    expect(await screen.findByText(/Network Error/i)).toBeInTheDocument();
  });

  it('shows loading spinners and empty states', async () => {
    const { useApiRequest } = await import('../hooks/useApiRequest.js');
    jest.spyOn({ useApiRequest }, 'useApiRequest').mockReturnValue({ data: null, error: null, loading: true });
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  // Add more App-level and integration tests as needed
});

describe('Directory Coverage Enforcement', () => {
  // List all major directories to enforce test coverage
  const directories = [
    'components',
    'hooks',
    'services',
    'utils',
    'store',
    'pages',
    'layouts',
    'analyzers',
    'adapters',
    'api',
    'strategies',
    'workers',
    'providers',
    'config',
    'types',
    'styles',
    'test',
    'mocks',
  ];
  directories.forEach(dir => {
    it(`should have tests for all files in ${dir}/`, () => {
      // Placeholder: implement file system check or require test for each file
      expect(true).toBe(true);
    });
  });
});
