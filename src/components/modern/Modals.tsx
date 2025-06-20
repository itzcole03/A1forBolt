import React from 'react';

export const PerformanceModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="modern-card max-w-6xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-bold">📊 Performance Analytics</h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>Performance content goes here</div>
      </div>
    </div>
  ) : null;

export const LineupComparisonModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="modern-card max-w-7xl w-full p-8 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-bold">📊 Lineup Comparison</h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>Lineup comparison content goes here</div>
      </div>
    </div>
  ) : null;

export const EntryProgressModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="modern-card max-w-4xl w-full p-8 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-bold">📊 Entry Progress</h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>Entry progress content goes here</div>
      </div>
    </div>
  ) : null;

export const PropDetailModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="modern-card max-w-2xl w-full p-8 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-light"
            onClick={onClose}
          >
            ←
          </button>
        </div>
        <div>Prop detail content goes here</div>
      </div>
    </div>
  ) : null;

export const InfoModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) =>
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="modern-card max-w-md w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold">Information</h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>Info content goes here</div>
      </div>
    </div>
  ) : null;
