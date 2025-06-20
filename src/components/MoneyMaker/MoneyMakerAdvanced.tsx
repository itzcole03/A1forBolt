
import React, { useEffect, useState, useCallback } from 'react';
import { AdvancedMLDashboard } from './AdvancedMLDashboard';
import { UltimateMoneyMaker } from './UltimateMoneyMaker';
import { GlobalErrorBoundary as ErrorBoundary } from '../common/ErrorBoundary.js';
import { LoadingSkeleton } from '../common/LoadingSkeleton.js';
import { ToastProvider } from '../common/ToastProvider.js';
import axios from 'axios';

interface ModelStatus {
  id: string;
  name: string;
  status: 'active' | 'training' | 'error';
  confidence: number;
  lastUpdate: string;
}

interface BettingOpportunity {
  id: string;
  description: string;
  odds: number;
  confidence: number;
  expectedValue: number;
  kellySize: number;
  models: string[];
}

const MoneyMakerAdvanced: React.FC = () => {
  const [models, setModels] = useState<ModelStatus[]>([]);
  const [opportunities, setOpportunities] = useState<BettingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [modelsRes, oppsRes] = await Promise.all([
          axios.get<ModelStatus[]>('/api/ml-models'),
          axios.get<BettingOpportunity[]>('/api/betting-opportunities'),
        ]);
        setModels(modelsRes.data);
        setOpportunities(oppsRes.data);
      } catch (_err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePlaceBet = useCallback(async (opportunity: BettingOpportunity) => {
    try {
      await axios.post('/api/place-bet', { opportunityId: opportunity.id });
      // Optionally refresh opportunities or show toast
    } catch (err) {
      // Optionally show error toast
      console.error('Error placing bet:', err);
    }
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }
  if (error) {
    return <div className="text-red-600 text-center p-8">{error}</div>;
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-yellow-900/80 to-yellow-700/80 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors">
          <React.Suspense fallback={<LoadingSkeleton />}>
            <main aria-label="Advanced Money Maker ML Dashboard" className="glass-card rounded-2xl shadow-xl p-6 mb-8 animate-fade-in animate-scale-in">
              <AdvancedMLDashboard models={models} />
              <UltimateMoneyMaker opportunities={opportunities} onPlaceBet={handlePlaceBet} />
            </main>
          </React.Suspense>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
};

export default MoneyMakerAdvanced;
