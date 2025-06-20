import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
  show?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...', subMessage, show = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in">
      <div className="glass-morphism rounded-3xl p-8 flex flex-col items-center space-y-4 animate-scale-in min-w-[300px]">
        <svg className="animate-spin h-10 w-10 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <div className="text-xl font-bold text-white text-center drop-shadow-lg">{message}</div>
        {subMessage && <div className="text-base text-gray-200 text-center">{subMessage}</div>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
