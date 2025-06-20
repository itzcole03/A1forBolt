import { EventBus } from '@/core/EventBus';
import { PerformanceMonitor } from '@/core/PerformanceMonitor';
import { UnifiedBettingSystem } from '@/core/UnifiedBettingSystem';
import { useState, useEffect } from 'react';



export function useInitializeApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize core systems
        const eventBus = EventBus.getInstance();
        const performanceMonitor = PerformanceMonitor.getInstance();
        const bettingSystem = UnifiedBettingSystem.getInstance();

        // Start performance monitoring
        const traceId = performanceMonitor.startTrace('app-initialization');

        // Initialize betting system
        await bettingSystem.initialize();

        // Set up global error handling
        window.onerror = (message, source, lineno, colno, error) => {
          eventBus.publish({
            type: 'error',
            payload: {
              error: error || new Error(message as string),
              source: source || 'window',
              context: { lineno, colno }
            }
          });
          return false;
        };

        // End performance trace
        performanceMonitor.endTrace(traceId);

        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
      }
    };

    initializeApp();
  }, []);

  return { isInitialized, error };
} 