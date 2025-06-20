import AuthPage from '../../pages/AuthPage';
import { MemoryRouter } from 'react-router-dom'; // Needed because AuthPage uses useNavigate
import { axe, toHaveNoViolations } from 'jest-axe';
import { initializeUnifiedConfig } from '../../core/UnifiedConfig';
import { render, act } from '@testing-library/react';

// betaTest4/src/test/a11y/authPageA11y.test.tsx


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

expect.extend(toHaveNoViolations);

const realAuthServiceModule = jest.requireActual('../../services/authService');
beforeAll(async () => {
  await initializeUnifiedConfig();
  jest.spyOn(realAuthServiceModule.authService, 'login').mockResolvedValue({ user: { id: 'u1', email: 'test@example.com', username: 'testuser' }, token: 'mock-token' });
  jest.spyOn(realAuthServiceModule.authService, 'logout').mockResolvedValue(undefined);
});

describe('AuthPage Accessibility', () => {
  it('should not have any automatically detectable accessibility issues', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('AuthPage Accessibility Tests', () => {
  it('AuthPage should have no accessibility violations on initial render', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AuthPage should have no accessibility violations after form interaction (e.g., error messages shown)', async () => {
    const { container, getByRole } = render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    // Simulate form submit with empty fields to trigger error
    const submitBtn = getByRole('button', { name: /sign in/i });
    await act(async () => {
      submitBtn.click();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 