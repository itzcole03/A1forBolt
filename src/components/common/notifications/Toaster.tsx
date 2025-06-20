import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastNotification } from '../../types';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { useAppStore, AppStore } from '../../store/useAppStore';


// Define the keys for toast types to ensure type safety for icons and borders
type ToastType = ToastNotification['type'];

interface ToastProps extends ToastNotification {
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const icons: Record<ToastType, JSX.Element> = {
    success: <CheckCircle className="w-6 h-6 text-green-400" />,
    error: <AlertTriangle className="w-6 h-6 text-red-400" />,
    info: <Info className="w-6 h-6 text-blue-400" />,
    warning: <AlertCircleIcon className="w-6 h-6 text-yellow-400" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-blue-500',
    warning: 'border-yellow-500',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: '100%', scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={`px-6 py-4 rounded-2xl shadow-2xl flex items-start space-x-3 glass modern-card bg-gradient-to-br from-primary-700/90 to-primary-500/80 border-l-4 ${borderColors[type]} min-w-[320px] max-w-md animate-fade-in`}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-grow">
        <p className="text-base font-semibold text-white drop-shadow-lg">{message}</p>
      </div>
      <button 
        onClick={() => onDismiss(id)} 
        className="ml-auto -mr-1 -mt-1 p-2 rounded-full hover:bg-primary/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={20} className="text-white" />
      </button>
    </motion.div>
  );
};

const Toaster: React.FC = () => {
  const toasts = useAppStore((state: AppStore) => state.toasts);
  const removeToast = useAppStore((state: AppStore) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;

// Example of how to trigger a toast (would be done via a store action)
// export const showToast = (message: string, type: ToastProps['type']) => {
//   const id = Math.random().toString(36).substr(2, 9);
//   toasts.push({ id, message, type });
//   // Here you would typically update the store to re-render the Toaster
// }; 