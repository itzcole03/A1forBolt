import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import Tooltip from '../components/ui/Tooltip';
import { PatternStrengthMetrics } from '../components/analytics/PatternStrengthMetrics';

import ShapExplanation from '../components/analytics/ShapExplanation.tsx';
import PredictionConfidenceGraph from '../components/analytics/PredictionConfidenceGraph.tsx';
import RiskAssessmentMatrix from '../components/analytics/RiskAssessmentMatrix.tsx';
import ModelComparisonChart from '../components/analytics/ModelComparisonChart.tsx';
import TrendAnalysisChart from '../components/analytics/TrendAnalysisChart.tsx';
import { GlobalErrorBoundary } from '../components/common/ErrorBoundary.tsx';
import { LoadingSpinner } from '../components/shared/ui/LoadingSpinner.tsx';
import ToastContainer from '../components/shared/feedback/Toast.tsx';
// Alpha1 Advanced Widgets
import ConfidenceBands from '../components/ui/ConfidenceBands.tsx';
import RiskHeatMap from '../components/ui/RiskHeatMap.tsx';
import SourceHealthBar from '../components/ui/SourceHealthBar.tsx';
import WhatIfSimulator from '../components/advanced/WhatIfSimulator.tsx';
// Personalization overlay
import { userPersonalizationService } from '../services/analytics/userPersonalizationService.ts';
// TODO: Add tests for new widgets

const AnalyticsPage: React.FC = () => {
  return (
    <ToastContainer>
      <GlobalErrorBoundary>
        <div className="p-6 space-y-8 bg-gradient-to-br from-blue-900/80 to-blue-700/80 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-6">Analytics Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Prediction Confidence</h2>
              <PredictionConfidenceGraph />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
              <RiskAssessmentMatrix />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Model Comparison</h2>
              <ModelComparisonChart />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Trend Analysis</h2>
              <TrendAnalysisChart />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">SHAP Explanation</h2>
              <ShapExplanation eventId={''} />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Pattern Recognition Strength</h2>
              <PatternStrengthMetrics />
            </GlassCard>
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4">Advanced Widgets</h2>
              <div className="space-y-4">
                <div>
                  <ConfidenceBands lower={42} upper={68} mean={55} />
                  <Tooltip content="Model confidence interval (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
                </div>
                <div>
                  <RiskHeatMap riskScores={[0.2, 0.6, 0.7]} />
                  <Tooltip content="Risk heat map (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
                </div>
                <div>
                  <SourceHealthBar sources={[
                    { name: 'Sportradar', healthy: true },
                    { name: 'Weather', healthy: true },
                    { name: 'Injury', healthy: false },
                  ]} />
                  <Tooltip content="Source health status (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
                </div>
                <div>
                  <WhatIfSimulator />
                  <Tooltip content="What-if scenario simulator (hover for details)"><span className="text-xs text-gray-400 ml-2">?</span></Tooltip>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlobalErrorBoundary>
    </ToastContainer>
  );
};

export default AnalyticsPage;
