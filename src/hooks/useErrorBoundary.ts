import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useErrorBoundary = () => {
  const showBoundary = useCallback((error: Error) => {
    console.error('Error caught by boundary:', error);
    toast.error(error.message || 'An error occurred');
  }, []);

  return { showBoundary };
};
