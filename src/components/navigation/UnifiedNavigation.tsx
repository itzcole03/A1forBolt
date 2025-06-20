import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedSettingsService } from '../../services/unified/UnifiedSettingsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { Button, Badge, Modal, Toast } from '../ui/UnifiedUI';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    path: '/predictions',
    label: 'Predictions',
    icon: '🎯',
  },
  {
    path: '/betting',
    label: 'Betting',
    icon: '💰',
    requiresAuth: true,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: '📈',
    requiresAuth: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: '👑',
    adminOnly: true,
  },
];

export const UnifiedNavigation: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const settingsService = serviceRegistry.getService<UnifiedSettingsService>('settings');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [notifications, setNotifications] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  // Load user data and notifications
  useEffect(() => {
    loadUserData();
    setupNotificationListener();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await stateService.getState('user');
      setUser(currentUser);
    } catch (error) {
      handleError('Failed to load user data', error);
    }
  };

  const setupNotificationListener = () => {
    notificationService.subscribe(notification => {
      setNotifications(prev => prev + 1);
    });
  };

  const handleError = (message: string, error: any) => {
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'NAVIGATION_ERROR',
      source: 'UnifiedNavigation',
      details: { message },
    });
  };

  const handleLogout = async () => {
    try {
      await stateService.clearState();
      window.location.href = '/login';
    } catch (error) {
      handleError('Failed to logout', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const canAccess = (item: NavigationItem) => {
    if (item.adminOnly && (!user || !user.isAdmin)) {
      return false;
    }
    if (item.requiresAuth && !user) {
      return false;
    }
    return true;
  };

  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Betting App</h1>
            )}
            <Button className="p-2" variant="ghost" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? '→' : '←'}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {NAVIGATION_ITEMS.map(
            item =>
              canAccess(item) && (
                <Link
                  key={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isActive(item.path) ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                  to={item.path}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <Badge variant="primary">{item.badge}</Badge>}
                    </>
                  )}
                </Link>
              )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          {!isCollapsed && user && (
            <div className="mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {user.avatar || user.name?.[0] || '👤'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <Button
            className="w-full justify-start"
            variant="ghost"
            onClick={() => setShowLogoutModal(true)}
          >
            <span className="text-xl mr-3">🚪</span>
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        onClose={() => setShowLogoutModal(false)}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Are you sure you want to logout? Any unsaved changes will be lost.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </nav>
  );
};
