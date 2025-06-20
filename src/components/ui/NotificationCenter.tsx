import React, { useEffect, useState } from 'react';
import { Button, Card, Badge, Icon } from './UnifiedUI.js';
import {
  UnifiedNotificationService,
  Notification,
} from '../../services/unified/UnifiedNotificationService.js';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService.js';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry.js';
import { UnifiedWebSocketService } from '../../services/unified/UnifiedWebSocketService.js';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const webSocketService = serviceRegistry.getService<UnifiedWebSocketService>('websocket');

  useEffect(() => {
    const updateNotifications = () => {
      const state = stateService.getState();
      setNotifications(state.notifications);
      setUnreadCount(notificationService.getUnreadCount());
    };

    // Initial update
    updateNotifications();

    // Setup WebSocket connection
    webSocketService.connect();

    // Subscribe to real-time updates
    const unsubscribe = webSocketService.subscribe('notifications', (_data: unknown) => {
      updateNotifications();
    });

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, [notificationService, stateService, webSocketService]);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  };

  const getNotificationVariant = (
    type: Notification['type']
  ): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="relative">
      <Button className="relative" size="small" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
        <Icon className="w-5 h-5" name="bell" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1" variant="danger">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50"
          variant="bordered"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="space-x-2">
                <Button size="small" variant="ghost" onClick={handleClearAll}>
                  Clear all
                </Button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon
                        className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-blue-500'
                          }`}
                        name={getNotificationIcon(notification.type)}
                      />
                      <div className="flex-1">
                        {notification.title && (
                          <h4 className="font-medium mb-1">{notification.title}</h4>
                        )}
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
