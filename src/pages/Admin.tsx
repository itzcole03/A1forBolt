import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import errorHandler from '../utils/errorHandler';
import { ErrorSeverity, ErrorCategory } from '../unified/UnifiedError';
import { ModelSettings } from '../components/admin/ModelSettings';
import { ErrorLogs } from '../components/admin/ErrorLogs';

const Admin: React.FC = () => {
  const [errorReport, setErrorReport] = useState<any>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'ALL'>('ALL');
  const [threshold, setThreshold] = useState<number>(50);
  const [selectedModel, setSelectedModel] = useState<string>('default');
  const [autoClearCache, setAutoClearCache] = useState<boolean>(false);
  const [cacheStatus, setCacheStatus] = useState<{ size: number; lastCleared: string | null }>({
    size: 0,
    lastCleared: null,
  });

  useEffect(() => {
    // Load initial error report
    const report = errorHandler.generateReport();
    setErrorReport(report);
    updateCacheStatus();
  }, []);

  const updateCacheStatus = () => {
    // Simulate cache size calculation
    const size = Math.floor(Math.random() * 1000);
    const lastCleared = localStorage.getItem('cache_last_cleared');
    setCacheStatus({ size, lastCleared });
  };

  const handleDownloadReport = () => {
    errorHandler.downloadReport();
  };

  const handleClearLogs = () => {
    errorHandler.clearLogs();
    const report = errorHandler.generateReport();
    setErrorReport(report);
  };

  const handleClearCache = () => {
    // Simulate cache clearing
    localStorage.setItem('cache_last_cleared', new Date().toISOString());
    updateCacheStatus();
  };

  const handleThresholdChange = (_event: Event, newValue: number | number[]) => {
    setThreshold(newValue as number);
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
  };

  const handleAutoClearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoClearCache(event.target.checked);
  };

  const handleSettingsChange = (settings: {
    modelType: string;
    confidenceThreshold: number;
    kellyThreshold: number;
  }) => {
    // TODO: Implement settings update logic
    console.log('Settings updated:', settings);
  };

  const filteredErrors =
    errorReport?.errors?.filter((error: any) => {
      const severityMatch =
        selectedSeverity === 'ALL' || error.details?.severity === selectedSeverity;
      const categoryMatch =
        selectedCategory === 'ALL' || error.details?.category === selectedCategory;
      return severityMatch && categoryMatch;
    }) || [];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <GlassCard className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-2">Model Settings</h2>
            <ModelSettings onSettingsChange={handleSettingsChange} />
          </GlassCard>
          <GlassCard>
            <h2 className="text-xl font-semibold mb-2">Error Logs</h2>
            <ErrorLogs />
          </GlassCard>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <GlowButton onClick={handleDownloadReport}>Download Error Report</GlowButton>
          <GlowButton onClick={handleClearLogs}>Clear Logs</GlowButton>
          <GlowButton onClick={handleClearCache}>Clear Cache</GlowButton>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <GlassCard className="flex-1">
            <h3 className="font-semibold mb-2">Cache Status</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300">Size: {cacheStatus.size} MB</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Last Cleared: {cacheStatus.lastCleared || 'Never'}</div>
            <div className="mt-2">
              <label className="font-medium mr-2">Auto Clear Cache</label>
              <input type="checkbox" checked={autoClearCache} onChange={handleAutoClearChange} />
            </div>
          </GlassCard>
          <GlassCard className="flex-1">
            <h3 className="font-semibold mb-2">Error Filter</h3>
            <div className="flex gap-2 mb-2">
              <select value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value as ErrorSeverity | 'ALL')} className="modern-input">
                <option value="ALL">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as ErrorCategory | 'ALL')} className="modern-input">
                <option value="ALL">All Categories</option>
                <option value="SYSTEM">System</option>
                <option value="MODEL">Model</option>
                <option value="USER">User</option>
              </select>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredErrors.length === 0 ? (
                <div className="text-gray-500">No errors found.</div>
              ) : (
                filteredErrors.map((err: any, idx: number) => (
                  <div key={idx} className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-red-600 dark:text-red-400">{err.details?.message}</div>
                    <div className="text-xs text-gray-500">{err.details?.category} | {err.details?.severity}</div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
};

export default Admin;
