import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we set things up
        </p>
      </div>
    </div>
  );
}
