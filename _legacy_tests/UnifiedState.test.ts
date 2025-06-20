import { UnifiedStateManager, StateChange } from '../UnifiedState';
import { SystemError } from '../UnifiedError';

describe('UnifiedStateManager', () => {
  let stateManager: UnifiedStateManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Get a fresh instance
    stateManager = UnifiedStateManager.getInstance();
  });

  afterEach(() => {
    // Clean up after each test
    stateManager.clearState();
    stateManager.clearHistory();
  });

  describe('Initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = UnifiedStateManager.getInstance();
      const instance2 = UnifiedStateManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize successfully', async () => {
      await expect(stateManager.initialize()).resolves.not.toThrow();
    });

    it('should throw error when accessing state before initialization', () => {
      expect(() => stateManager.get('test')).toThrow(SystemError);
      expect(() => stateManager.set('test', 'value')).toThrow(SystemError);
    });
  });

  describe('State Operations', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should set and get state values', () => {
      stateManager.set('test', 'value');
      expect(stateManager.get('test')).toBe('value');
    });

    it('should handle different value types', () => {
      const testCases = [
        { key: 'string', value: 'test' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'object', value: { test: 'value' } },
        { key: 'array', value: [1, 2, 3] },
      ];

      testCases.forEach(({ key, value }) => {
        stateManager.set(key, value);
        expect(stateManager.get(key)).toEqual(value);
      });
    });

    it('should validate state values', () => {
      expect(() => stateManager.set('test', undefined)).toThrow(SystemError);
    });
  });

  describe('State History', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should track state changes in history', () => {
      stateManager.set('test', 'value1');
      stateManager.set('test', 'value2');
      stateManager.set('test', 'value3');

      const history = stateManager.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].newValue).toBe('value1');
      expect(history[1].newValue).toBe('value2');
      expect(history[2].newValue).toBe('value3');
    });

    it('should limit history size', () => {
      const maxSize = 5;
      for (let i = 0; i < maxSize + 2; i++) {
        stateManager.set('test', `value${i}`);
      }

      const history = stateManager.getHistory();
      expect(history).toHaveLength(maxSize);
      expect(history[0].newValue).toBe('value2');
      expect(history[history.length - 1].newValue).toBe('value6');
    });

    it('should support time travel', () => {
      stateManager.set('test', 'value1');
      stateManager.set('test', 'value2');
      stateManager.set('test', 'value3');

      stateManager.timeTravel(1);
      expect(stateManager.get('test')).toBe('value2');
    });

    it('should throw error on invalid time travel index', () => {
      expect(() => stateManager.timeTravel(-1)).toThrow(SystemError);
      expect(() => stateManager.timeTravel(0)).toThrow(SystemError);
    });
  });

  describe('State Persistence', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should persist state to localStorage', () => {
      stateManager.set('test', 'value');
      const savedState = JSON.parse(localStorage.getItem('app_state') || '{}');
      expect(savedState.test).toBe('value');
    });

    it('should create backup on save', () => {
      stateManager.set('test', 'value');
      const backup = JSON.parse(localStorage.getItem('app_state_backup') || '{}');
      expect(backup.test).toBe('value');
    });

    it('should load state from localStorage on initialization', async () => {
      localStorage.setItem('app_state', JSON.stringify({ test: 'value' }));
      await stateManager.initialize();
      expect(stateManager.get('test')).toBe('value');
    });

    it('should recover from backup if main state is corrupted', async () => {
      localStorage.setItem('app_state', 'invalid json');
      localStorage.setItem('app_state_backup', JSON.stringify({ test: 'value' }));
      await stateManager.initialize();
      expect(stateManager.get('test')).toBe('value');
    });
  });

  describe('State Subscriptions', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should notify subscribers of state changes', () => {
      const listener = jest.fn();
      stateManager.subscribe('test', listener);

      stateManager.set('test', 'value');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          newValue: 'value',
        })
      );
    });

    it('should support wildcard subscriptions', () => {
      const listener = jest.fn();
      stateManager.subscribe('*', listener);

      stateManager.set('test1', 'value1');
      stateManager.set('test2', 'value2');

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should allow unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = stateManager.subscribe('test', listener);

      stateManager.set('test', 'value1');
      unsubscribe();
      stateManager.set('test', 'value2');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should provide initial value to subscribers', () => {
      stateManager.set('test', 'initial');
      const listener = jest.fn();

      stateManager.subscribe('test', listener);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          newValue: 'initial',
        })
      );
    });
  });

  describe('Metrics and Validation', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should track metrics', () => {
      stateManager.set('test1', 'value1');
      stateManager.set('test2', 'value2');

      const metrics = stateManager.getMetrics();
      expect(metrics.updateCount).toBe(2);
      expect(metrics.lastUpdate).not.toBeNull();
      expect(metrics.averageUpdateTime).toBeGreaterThan(0);
    });

    it('should track validation errors', () => {
      try {
        stateManager.set('test', undefined);
      } catch (error) {
        // Expected error
      }

      const validation = stateManager.getValidation();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
    });

    it('should track recovery attempts', async () => {
      localStorage.setItem('app_state', 'invalid json');
      await stateManager.initialize();

      const metrics = stateManager.getMetrics();
      expect(metrics.recoveryAttempts).toBe(1);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should handle storage errors gracefully', () => {
      const mockLocalStorage = {
        getItem: jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        }),
        setItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      expect(() => stateManager.set('test', 'value')).not.toThrow();
      const metrics = stateManager.getMetrics();
      expect(metrics.errorCount).toBeGreaterThan(0);
    });

    it('should handle invalid state recovery', async () => {
      localStorage.setItem('app_state', 'invalid json');
      localStorage.setItem('app_state_backup', 'invalid json');

      await stateManager.initialize();
      const metrics = stateManager.getMetrics();
      expect(metrics.errorCount).toBeGreaterThan(0);
    });
  });
});
