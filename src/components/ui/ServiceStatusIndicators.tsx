import React, { useEffect, useState } from 'react';

const SERVICE_KEYS = [
  'analytics', 'espn', 'odds', 'news', 'weather', 'injuries', 'realtime'
];

/**
 * Displays real-time connection/health status for all core backend services.
 * Reads from window.appStatus, which is updated by each service.
 */
export const ServiceStatusIndicators: React.FC = () => {
  /**
 * Service status object keyed by service name.
 */
type ServiceStatus = {
  connected: boolean;
  quality: number;
  timestamp: number;
};

const [status, setStatus] = useState<Record<string, ServiceStatus | undefined>>({});

  useEffect(() => {
    const updateStatus = () => setStatus(window.appStatus || {});
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {SERVICE_KEYS.map(key => (
        <div key={key} className="p-4 border rounded-lg bg-white dark:bg-gray-900">
          <div className="font-semibold capitalize">{key}</div>
          {status[key] ? (
            <>
              <div>
                <span
                  className={
                    status[key].connected
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {status[key].connected ? 'Online' : 'Offline'}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  Q: {status[key].quality}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(status[key].timestamp).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <span className="text-gray-400">No Data</span>
          )}
        </div>
      ))}
    </div>
  );
};
