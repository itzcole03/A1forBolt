import React from 'react';
import Dashboard from '../components/modern/Dashboard.tsx';
import { UnifiedPredictionInterface } from '../components/prediction/UnifiedPredictionInterface.tsx';
import PredictionConfidenceGraph from '../components/analytics/PredictionConfidenceGraph.tsx';
import RiskAssessmentMatrix from '../components/analytics/RiskAssessmentMatrix.tsx';
import ModelComparisonChart from '../components/analytics/ModelComparisonChart.tsx';
import TrendAnalysisChart from '../components/analytics/TrendAnalysisChart.tsx';
import ShapExplanation from '../components/analytics/ShapExplanation.tsx';
import UserStats from '../components/analytics/UserStats.tsx';
import MLInsights from '../components/insights/MLInsights.tsx';
import { GlobalErrorBoundary } from '../components/common/ErrorBoundary.tsx';
import { LoadingSpinner } from '../components/shared/ui/LoadingSpinner.tsx';
import ToastContainer from '../components/shared/feedback/Toast.tsx';
// Alpha1 Advanced Widgets
import ConfidenceBands from '../components/ui/ConfidenceBands.tsx';
import RiskHeatMap from '../components/ui/RiskHeatMap.tsx';
import SourceHealthBar from '../components/ui/SourceHealthBar.tsx';
import WhatIfSimulator from '../components/advanced/WhatIfSimulator.tsx';
// Personalization overlay
// import { userPersonalizationService } from '../services/analytics/userPersonalizationService.ts';
import { Accordion } from '../components/Accordion.tsx';
import { Alert } from '../components/Alert.tsx';
import Analytics from '../components/Analytics.tsx';
import ApiHealthIndicator from '../components/ApiHealthIndicator.jsx';
// TODO: Add tests for new widgets

const DashboardPage: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <GlobalErrorBoundary>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-primary-900/80 to-primary-700/80 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors">
          {/* Global Alert Example: can be made dynamic via state or context */}
          <div className="mb-4">
            <Alert
              type="info"
              title="Welcome to the AI Sports Analytics Platform!"
              message="Stay tuned for real-time updates, new features, and important announcements."
              closable={false}
            />
          </div>
          <React.Suspense fallback={<LoadingSpinner />}>
            <div className="flex justify-end mb-2">
              <ApiHealthIndicator />
            </div>
            <Dashboard />
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-6">
                <UnifiedPredictionInterface />
                <PredictionConfidenceGraph />
                <RiskAssessmentMatrix />
                <ModelComparisonChart />
                <TrendAnalysisChart />
                <ShapExplanation eventId={''} />
                {/* Analytics Section: User performance, Kelly calculator, arbitrage */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Your Analytics</h2>
                  <Analytics />
                </div>
                {/* Alpha1 Advanced Widgets */}
                <React.Suspense fallback={<LoadingSpinner />}>
                  <div className="mt-4">
                    <ConfidenceBands lower={45} upper={65} mean={55} />
                    <span className="tooltip">Model confidence interval (hover for details)</span>
                  </div>
                  <div className="mt-4">
                    <RiskHeatMap riskScores={[0.1, 0.5, 0.8]} />
                    <span className="tooltip">Risk heat map (hover for details)</span>
                  </div>
                  <div className="mt-4">
                    <SourceHealthBar sources={[
                      { name: 'Sportradar', healthy: true },
                      { name: 'Weather', healthy: false },
                      { name: 'Injury', healthy: true },
                    ]} />
                    <span className="tooltip">Source health status (hover for details)</span>
                  </div>
                  <div className="mt-4">
                    <WhatIfSimulator />
                    <span className="tooltip">What-if scenario simulator (hover for details)</span>
                  </div>
                  {/* FAQ / Help Section using Accordion */}
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                    <Accordion
                      items={[
                        {
                          title: 'How do I use the AI Sports Analytics Platform?',
                          content: (
                            <span>
                              Navigate through the dashboard to view predictions, analytics, and insights. Use the widgets to explore advanced features.
                            </span>
                          ),
                        },
                        {
                          title: 'What do the confidence bands mean?',
                          content: (
                            <span>
                              The confidence bands show the range in which the model expects the true value to fall, based on historical data.
                            </span>
                          ),
                        },
                        {
                          title: 'How can I simulate what-if scenarios?',
                          content: (
                            <span>
                              Use the What-If Simulator widget to adjust parameters and see how predictions change in real time.
                            </span>
                          ),
                        },
                        {
                          title: 'Who can I contact for support?',
                          content: (
                            <span>
                              Please use the in-app chat or email support@ultimatesportsbetting.com for assistance.
                            </span>
                          ),
                        },
                      ]}
                      variant="bordered"
                      allowMultiple={true}
                    />
                  </div>
                </React.Suspense>
              </div>
              <div className="space-y-6">
                <UserStats />
                <MLInsights />
                {/* Personalization overlay example */}
                <div className="mt-4">
                  {/* TODO: Personalization overlays from userPersonalizationService */}
                  {/* {userPersonalizationService.getOverlay()} */}
                </div>
              </div>
            </section>
          </React.Suspense>
        </div>
      </GlobalErrorBoundary>
    </>
  );
};

export default DashboardPage;