import { useDataSync } from './useDataSync';
import { useRealtimeData } from './useRealtimeData';
import { useState, useEffect, useCallback } from 'react';



export type AlertType = 'INJURY' | 'LINEUP' | 'WEATHER' | 'LINE_MOVEMENT' | 'ARBITRAGE';

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: number;
  metadata: {
    sportId?: string;
    gameId?: string;
    playerId?: string;
    teamId?: string;
    impactScore?: number;
    lineMovement?: {
      from: number;
      to: number;
      book: string;
    };
  };
  read: boolean;
}

interface WebSocketMessage {
  type: string;
  data: Alert;
}

interface SmartAlertsConfig {
  enabledTypes?: AlertType[];
  minSeverity?: 'low' | 'medium' | 'high';
  wsEndpoint: string;
  onNewAlert?: (alert: Alert) => void;
}

interface SmartAlertsResult {
  alerts: Alert[];
  unreadCount: number;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  isConnected: boolean;
}

export function useSmartAlerts({
  enabledTypes = ['INJURY', 'LINEUP', 'WEATHER', 'LINE_MOVEMENT', 'ARBITRAGE'],
  minSeverity = 'low',
  wsEndpoint,
  onNewAlert
}: SmartAlertsConfig): SmartAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const { data: realtimeData, isConnected } = useRealtimeData<Alert>({
    url: wsEndpoint,
    onMessage: (message: WebSocketMessage) => {
      if (message.type === 'ALERT' && isAlertRelevant(message.data)) {
        handleNewAlert(message.data);
      }
    }
  });

  const { data: syncedAlerts } = useDataSync({
    key: 'smart-alerts',
    initialData: alerts,
    syncInterval: 60000
  });

  const isAlertRelevant = useCallback((alert: Alert) => {
    const severityLevels = { low: 0, medium: 1, high: 2 };
    return (
      enabledTypes.includes(alert.type) &&
      severityLevels[alert.severity] >= severityLevels[minSeverity]
    );
  }, [enabledTypes, minSeverity]);

  const handleNewAlert = useCallback((alert: Alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 100)); // Keep last 100 alerts
    onNewAlert?.(alert);
  }, [onNewAlert]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev =>
      prev.map(alert => ({ ...alert, read: true }))
    );
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    isConnected
  };
} 