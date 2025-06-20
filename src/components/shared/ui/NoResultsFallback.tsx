import React from 'react';
import { FaFilter, FaSearch } from 'react-icons/fa';

export const NoResultsFallback: React.FC = () => {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <FaFilter className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Try adjusting your filters to see more predictions
      </p>
      <div className="flex justify-center space-x-4">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => window.location.reload()}
        >
          <FaSearch className="w-4 h-4 mr-2" />
          Refresh Predictions
        </button>
      </div>
    </div>
  );
};
