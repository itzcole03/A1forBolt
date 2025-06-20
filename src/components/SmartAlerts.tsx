import React from 'react';
import { Alert, useSmartAlerts } from '../hooks/useSmartAlerts';

interface SmartAlertsProps {
  wsEndpoint: string;
  onAlertClick?: (alert: Alert) => void;
}

const severityColors = {
  low: 'bg-blue-100 border-blue-500 text-blue-800',
  medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  high: 'bg-red-100 border-red-500 text-red-800',
};

const typeIcons = {
  INJURY: '🏥',
  LINEUP: '👥',
  WEATHER: '🌤️',
  LINE_MOVEMENT: '📈',
  ARBITRAGE: '💰',
};

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ wsEndpoint, onAlertClick }) => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, clearAlerts, isConnected } =
    useSmartAlerts({
      wsEndpoint,
      onNewAlert: alert => {
        // Show browser notification for high severity alerts
        if (alert.severity === 'high' && Notification.permission === 'granted') {
          new Notification(`${typeIcons[alert.type]} ${alert.title}`, {
            body: alert.message,
            icon: '/favicon.ico',
          });
        }
      },
    });

  const handleAlertClick = (alert: Alert) => {
    markAsRead(alert.id);
    onAlertClick?.(alert);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">Smart Alerts</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-sm bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-sm text-gray-600 hover:text-gray-800"
            onClick={() => markAllAsRead()}
          >
            Mark All Read
          </button>
          <button className="text-sm text-red-600 hover:text-red-800" onClick={() => clearAlerts()}>
            Clear All
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`px-4 py-2 ${isConnected ? 'bg-green-50' : 'bg-red-50'}`}>
        <span className="text-sm flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No alerts to display</div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                !alert.read ? 'bg-opacity-50' : ''
              } ${severityColors[alert.severity]}`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{typeIcons[alert.type]}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  {alert.metadata && (
                    <div className="mt-2 text-sm text-gray-500">
                      {alert.metadata.impactScore && (
                        <span className="mr-3">
                          Impact: {alert.metadata.impactScore.toFixed(2)}
                        </span>
                      )}
                      {alert.metadata.lineMovement && (
                        <span>
                          Movement: {alert.metadata.lineMovement.from} →{' '}
                          {alert.metadata.lineMovement.to} ({alert.metadata.lineMovement.book})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
