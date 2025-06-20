import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PerformanceAlert, { PerformanceAlert as AlertType } from './PerformanceAlert';

interface PerformanceAlertContainerProps {
  alerts: AlertType[];
  onDismiss?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  maxAlerts?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

const PerformanceAlertContainer: React.FC<PerformanceAlertContainerProps> = ({
  alerts,
  onDismiss,
  onAcknowledge,
  maxAlerts = 5,
  autoDismiss = true,
  autoDismissDelay = 5000,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const handleAcknowledge = (id: string) => {
    onAcknowledge?.(id);
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id)).slice(0, maxAlerts);

  React.useEffect(() => {
    if (!autoDismiss) return;

    const timers = visibleAlerts.map(alert => {
      return setTimeout(() => {
        handleDismiss(alert.id);
      }, autoDismissDelay);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleAlerts, autoDismiss, autoDismissDelay]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-96">
      <AnimatePresence>
        {visibleAlerts.map(alert => (
          <PerformanceAlert
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(PerformanceAlertContainer);
