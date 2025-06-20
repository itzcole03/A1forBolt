import { renderHook, act } from '@testing-library/react-hooks';
import { useUserStore, UserState } from '../enhanced';

describe('Enhanced State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.data.name).toBe('');
    expect(result.current.data.email).toBe('');
    expect(result.current.data.preferences.theme).toBe('light');
    expect(result.current.data.preferences.notifications).toBe(true);
    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.metrics.updateCount).toBe(0);
  });

  it('should validate state updates', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setState((state: UserState) => ({
        ...state,
        data: {
          ...state.data,
          name: 'John',
          email: 'invalid-email',
        },
      }));
    });

    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.errors).toContain('Invalid email format');
    expect(result.current.metrics.errorCount).toBe(1);
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setState((state: UserState) => ({
        ...state,
        data: {
          ...state.data,
          name: 'John',
          email: 'john@example.com',
        },
      }));
    });

    const storedState = JSON.parse(localStorage.getItem('user-store') || '{}');
    expect(storedState.state.data.name).toBe('John');
    expect(storedState.state.data.email).toBe('john@example.com');
  });

  it('should track metrics', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setState((state: UserState) => ({
        ...state,
        data: {
          ...state.data,
          name: 'John',
        },
      }));
    });

    expect(result.current.metrics.updateCount).toBe(1);
    expect(result.current.metrics.lastUpdate).toBeDefined();
  });

  it('should handle state recovery', () => {
    // Set initial state in localStorage
    localStorage.setItem(
      'user-store',
      JSON.stringify({
        state: {
          data: {
            id: 'test-id',
            name: 'John',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              notifications: false,
            },
          },
          version: '1.0.0',
        },
      })
    );

    const { result } = renderHook(() => useUserStore());

    expect(result.current.data.name).toBe('John');
    expect(result.current.data.email).toBe('john@example.com');
    expect(result.current.data.preferences.theme).toBe('dark');
    expect(result.current.data.preferences.notifications).toBe(false);
  });

  it('should handle version mismatches', () => {
    // Set state with different version
    localStorage.setItem(
      'user-store',
      JSON.stringify({
        state: {
          data: {
            id: 'test-id',
            name: 'John',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              notifications: false,
            },
          },
          version: '0.9.0',
        },
      })
    );

    const { result } = renderHook(() => useUserStore());

    // Should fall back to default state
    expect(result.current.data.name).toBe('');
    expect(result.current.data.email).toBe('');
    expect(result.current.data.preferences.theme).toBe('light');
    expect(result.current.data.preferences.notifications).toBe(true);
  });
});
