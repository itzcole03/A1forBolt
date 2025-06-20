import { StateCreator } from 'zustand';
import { Toast } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export interface ToastSlice {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const createToastSlice: StateCreator<ToastSlice> = set => ({
  toasts: [],
  addToast: (type, message) => {
    const id = uuidv4();
    set(state => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
  },
  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },
});
