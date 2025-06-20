import { StateCreator } from 'zustand';
import { ToastNotification } from '../../../../shared/formatters';
import { AppStore } from '../../stores/useAppStore'; // Corrected path

export interface NotificationSlice {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => string; // Returns the ID of the added toast
  removeToast: (id: string) => void;
}

export const initialNotificationState: Pick<NotificationSlice, 'toasts'> = {
  toasts: [],
};

export const createNotificationSlice: StateCreator<AppStore, [], [], NotificationSlice> = set => ({
  ...initialNotificationState,
  addToast: toast => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },
  removeToast: id => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
});
