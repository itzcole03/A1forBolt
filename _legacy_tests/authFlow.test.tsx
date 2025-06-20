import '@testing-library/jest-dom'; // Correct import for jest-dom matchers
import App from '../../App'; // Assuming App.tsx is the main app component with routes
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useAppStore } from '../../store/useAppStore';

// betaTest4/src/test/integration/authFlow.test.tsx

jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn().mockImplementation((credentials) => {
      if (credentials.email === 'wrong@example.com') {
        return Promise.reject(new Error('Invalid credentials'));
      }
      return Promise.resolve({ user: { id: 'u1', email: credentials.email, username: 'testuser' }, token: 'mock-token' });
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    fetchCurrentUser: jest.fn().mockResolvedValue(null),
  },
}));

// Mock any other services that might be called on initial load, e.g., from Dashboard
jest.mock('../../services/prizePicksService', () => ({
  prizePicksService: {
    fetchPrizePicksProps: jest.fn().mockResolvedValue([
      {
        id: 'prop1',
        league: 'NBA',
        player_name: 'LeBron James',
        stat_type: 'points',
        line_score: 28.5,
        description: 'LeBron James points',
        start_time: new Date().toISOString(),
        status: 'active',
        image_url: '',
        projection_type: 'points',
        overOdds: 110,
        underOdds: 110,
        playerId: 'player1',
        player: {
          id: 'player1',
          name: 'LeBron James',
          team: 'LAL',
          position: 'SF',
          image_url: '',
        },
      },
    ]),
    // Add other mocked methods as needed by components loaded after auth
  },
}));

jest.mock('../../services/userService', () => ({
  userService: {
    fetchUserEntries: jest.fn().mockResolvedValue([
      {
        id: 'entry1',
        user_id: 'testUser',
        legs: [
          {
            id: 'prop1',
            league: 'NBA',
            player_name: 'LeBron James',
            stat_type: 'points',
            line_score: 28.5,
            description: 'LeBron James points',
            playerId: 'player1',
          },
        ],
        stake: 10,
        payout: 18,
        status: 'won',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]),
  },
}));

jest.mock('../../services/newsService', () => ({
  newsService: {
    fetchHeadlines: jest.fn().mockResolvedValue([
      {
        id: 'headline1',
        title: 'LeBron James scores 40 in win',
        summary: 'LeBron James led the Lakers to victory with 40 points.',
        link: 'https://espn.com/lebron',
        publishedAt: new Date().toISOString(),
        source: 'ESPN',
        imageUrl: '',
        category: 'NBA',
      },
    ]),
  },
}));

// Explicitly mock webSocketService to ensure it uses the manual mock
jest.mock('../../services/webSocketService');

// Mock UnifiedConfig to always provide a config object
jest.mock('../../core/UnifiedConfig', () => {
  const apiEndpoints = {
    users: '/api/users',
    prizepicks: '/api/prizepicks',
    predictions: '/api/predictions',
    dataScraping: '/api/data-scraping',
    config: '/api/config',
    news: '/api/news',
    sentiment: '/api/sentiment',
    live: '/api/live',
  };
  const config = {
    appName: 'Test App',
    version: '1.0.0',
    features: {},
    apiBaseUrl: 'http://localhost:8000',
    sentryDsn: '',
    websocketUrl: 'ws://localhost:8080',
    getApiEndpoint: (key: string) => (apiEndpoints as Record<string, string>)[key] || '',
  };
  return {
    ...jest.requireActual('../../core/UnifiedConfig'),
    initializeUnifiedConfig: jest.fn(() => Promise.resolve(config)),
    fetchAppConfig: jest.fn(() => Promise.resolve(config)),
    getInitializedUnifiedConfig: jest.fn(() => config),
    globalUnifiedConfig: config,
  };
});

jest.mock('framer-motion', () => {
  const React = require('react');
  // Provide motion.div, motion.span, etc. as valid components
  const motion = new Proxy({}, {
    get: () => React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
  });
  return {
    __esModule: true,
    motion,
    AnimatePresence: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    AnimateSharedLayout: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    LayoutGroup: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    LazyMotion: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    m: new Proxy({}, {
      get: () => React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
    }),
  };
});

describe('Authentication Flow Integration Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Reset Zustand store to initial state
    useAppStore.setState({
      ...useAppStore.getInitialState(),
      entries: [
        {
          id: 'entry1',
          user_id: 'testUser',
          legs: [
            {
              id: 'prop1',
              league: 'NBA',
              player_name: 'LeBron James',
              stat_type: 'points',
              line_score: 28.5,
              description: 'LeBron James points',
              playerId: 'player1',
            },
          ],
          stake: 10,
          payout: 18,
          status: 'won',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    }, true);
    // Ensure no auth token is present in localStorage
    localStorage.removeItem('authToken');
  });

  it('should allow a user to log in and redirect to dashboard', async () => {
    render(<App />);

    // Wait for the login form to appear
    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login process and redirection
    // Check if redirected to dashboard (e.g., by looking for a dashboard-specific element)
    // This requires your DashboardPage to have some unique, identifiable text or element.
    // For example, if DashboardPage has <h1 class="text-3xl">Platform Overview</h1>
    await waitFor(() => {
        expect(screen.queryByText(/Platform Overview/i)).toBeInTheDocument();
    }, { timeout: 3000 }); // Increased timeout for potential async operations

    // Verify store state after successful login
    const { isAuthenticated, user, token } = useAppStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(user).toEqual({ id: 'u1', email: 'test@example.com', username: 'testuser' });
    expect(token).toBe('mock-token');
  });

  it('should display an error message on failed login', async () => {
    jest.setTimeout(7000);
    const { authService } = require('../../services/authService');
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<App />);

    // Wait for the login form to appear
    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = await screen.findByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    // Use act to ensure async error is caught
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    // Wait for error message to appear in the UI or store
    await waitFor(() => {
      const alerts = screen.queryAllByRole('alert');
      const storeError = useAppStore.getState().error;
      if (alerts.length > 0) {
        expect(alerts.length).toBeGreaterThan(0);
      } else if (typeof storeError === 'string' && /invalid|error|failed|incorrect|unauthorized|wrong/i.test(storeError)) {
        expect(storeError).toMatch(/invalid|error|failed|incorrect|unauthorized|wrong/i);
      } else {
        throw new Error('No error alert or store error found');
      }
    }, { timeout: 5000 });

    // Verify store state after failed login
    const { isAuthenticated, user, token, error } = useAppStore.getState();
    expect(isAuthenticated).toBe(false);
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(error).toMatch(/invalid|error|failed|incorrect|unauthorized|wrong/i); // Accept any error containing these words
  }, 7000);
}); 