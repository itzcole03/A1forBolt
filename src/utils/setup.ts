import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';



// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(): void {}
  // For test compatibility
  mockReturnValue(): void {}
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
  // For test compatibility
  mockReturnValue(): void {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => null,
    removeListener: () => null,
    addEventListener: () => null,
    removeEventListener: () => null,
    dispatchEvent: () => false,
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
  clear: () => null,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock WebSocket
class MockWebSocket implements WebSocket {
  binaryType: BinaryType = 'blob';
  bufferedAmount: number = 0;
  extensions: string = '';
  protocol: string = '';
  readyState: number = WebSocket.CONNECTING;
  url: string = '';
  CONNECTING = WebSocket.CONNECTING;
  OPEN = WebSocket.OPEN;
  CLOSING = WebSocket.CLOSING;
  CLOSED = WebSocket.CLOSED;

  onclose: ((this: WebSocket, ev: CloseEvent) => void) | null = null;
  onerror: ((this: WebSocket, ev: Event) => void) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent<unknown>) => void) | null = null;
  onopen: ((this: WebSocket, ev: Event) => void) | null = null;

  constructor() {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  close(code?: number | undefined, reason?: string | undefined): void {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }

  send( 
_: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Mock sending data
  }

  addEventListener<K extends keyof WebSocketEventMap>(
    _type: K,
    _listener: (this: WebSocket, ev: WebSocketEventMap[K]) => void,
    _options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions | undefined
  ): void {
    // Implementation not needed for our tests
  }

  removeEventListener<K extends keyof WebSocketEventMap>(
    _type: K,
    _listener: (this: WebSocket, ev: WebSocketEventMap[K]) => void,
    _options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(
    _type: string,
    _listener: EventListenerOrEventListenerObject,
    _options?: boolean | EventListenerOptions | undefined
  ): void {
    // Implementation not needed for our tests
  }

  dispatchEvent( 
_: Event): boolean {
    return true;
  }
}

// Replace the global WebSocket with our mock
(global as unknown as { WebSocket: unknown }).WebSocket = MockWebSocket;

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: function() {
    return {
      permission: 'granted',
      requestPermission: () => Promise.resolve('granted'),
    };
  },
});

// Set timezone for consistent date handling in tests
process.env.TZ = 'UTC'; 