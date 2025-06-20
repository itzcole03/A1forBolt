import React, { ReactNode } from 'react';

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => <>{children}</>;


export { ToastProvider };
