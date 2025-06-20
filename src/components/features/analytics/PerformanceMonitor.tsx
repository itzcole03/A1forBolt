import React, { useEffect } from 'react';
import { performanceService } from '../services/performanceService';
import { errorLogger } from '../utils/errorLogger';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  useEffect(() => {
    const startMonitoring = async () => {
      try {
        // Initialize performance monitoring
        await performanceService.initialize();

        // Set up performance observers
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            performanceService.trackMetric(entry);
          }
        });

        // Observe various performance metrics
        observer.observe({
          entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'],
        });

        // Track React component render times
        const originalRender = React.Component.prototype.render;
        React.Component.prototype.render = function () {
          const start = performance.now();
          const result = originalRender.apply(this);
          const end = performance.now();

          performanceService.trackComponentRender(this.constructor.name, end - start);
          return result;
        };

        // Cleanup function
        return () => {
          observer.disconnect();
          React.Component.prototype.render = originalRender;
        };
      } catch (error) {
        errorLogger.logError(error as Error, { context: 'PerformanceMonitor' });
      }
    };

    startMonitoring();
  }, []);

  return <>{children}</>;
};
