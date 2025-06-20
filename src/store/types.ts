export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

export interface AppState {
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Other app state properties can be added here
  isLoading: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}
