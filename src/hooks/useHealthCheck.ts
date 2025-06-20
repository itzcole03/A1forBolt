import { useState, useEffect } from 'react';

interface HealthStatus {
  healthy: boolean;
  lastChecked: number;
  error?: string;
}

export const useHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    healthy: true,
    lastChecked: Date.now(),
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        setHealthStatus({
          healthy: data.status === 'ok',
          lastChecked: Date.now(),
        });
      } catch (error) {
        setHealthStatus({
          healthy: false,
          lastChecked: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    // Initial check
    checkHealth();

    // Set up interval for regular checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { healthStatus };
};
