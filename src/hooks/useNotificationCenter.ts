// useNotificationCenter: React hook for managing notifications
// TODO: Add tests
import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info';
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}
