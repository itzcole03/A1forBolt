import { create } from 'zustand';
import { ToastSlice, createToastSlice } from './slices/toastSlice';

interface StoreState extends ToastSlice {
  // Add other slices here as needed
}

export const useStore = create<StoreState>()((...args) => ({
  ...createToastSlice(...args),
  // Add other slices here as needed
}));
