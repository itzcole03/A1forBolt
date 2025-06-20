// This file was renamed from setupTests.ts to setupTests.mts to ensure Jest ESM compatibility.
import '@testing-library/jest-dom';
import 'jest-canvas-mock'; // Added to mock canvas for chart.js

// Mock import.meta.env for Jest environment
const globalAny = globalThis as any;

globalAny.import = globalAny.import || {};
globalAny.import.meta = globalAny.import.meta || {};
globalAny.import.meta.env = globalAny.import.meta.env || {};

globalAny.import.meta.env.VITE_API_URL = 'http://localhost:3001/api/test';
globalAny.import.meta.env.VITE_SENTRY_DSN = '';
globalAny.import.meta.env.VITE_WEBSOCKET_URL = 'ws://localhost:8080/test';
globalAny.import.meta.env.VITE_DAILYFANTASY_API_KEY = 'test-dailyfantasy-key';
globalAny.import.meta.env.VITE_SPORTRADAR_API_KEY = 'test-sportradar-key';
globalAny.import.meta.env.VITE_THEODDS_API_KEY = 'test-theodds-key';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

(globalThis as any).ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })),
});

jest.mock('chart.js', () => ({
  Chart: function () {
    return {
      destroy: jest.fn(),
      update: jest.fn(),
      config: {},
      data: {},
      options: {},
    };
  },
}));

jest.mock('chart.js/auto', () => ({
  __esModule: true,
  default: function () {
    return {
      destroy: jest.fn(),
      update: jest.fn(),
      config: {},
      data: {},
      options: {},
    };
  },
  registerables: [],
}));

jest.mock('../core/UnifiedConfig', () => {
  const apiEndpoints = {
    users: '/api/users',
    prizepicks: '/api/prizepicks',
    predictions: '/api/v1/predictions',
    dataScraping: '/api/data-scraping',
    config: '/api/config',
    news: '/api/news',
    sentiment: '/api/sentiment',
    live: '/api/live',
  };
  const config = {
    appName: 'Test App',
    version: '1.0.0',
    environment: 'test',
    featureFlags: {},
    experiments: [],
    apiEndpoints,
    getApiEndpoint: (key: string) => typeof key === 'string' && (apiEndpoints as Record<string, string>)[key] !== undefined ? (apiEndpoints as Record<string, string>)[key] : `/api/${key}`,
    isFeatureEnabled: () => false,
    getAllFeatureFlags: () => ({}),
    getExperiment: () => undefined,
    getAllExperiments: () => [],
    getBettingLimits: () => undefined,
    getSentryDsn: () => '',
    getLogLevel: () => 'info',
  };
  return { __esModule: true, default: config };
});
