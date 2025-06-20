import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { predictionService, GeneralInsight } from '../../services/predictionService'; // If fetched directly, added GeneralInsight

// import { useAppStore } from '../../store/useAppStore'; // If insights come via general app state

// interface Insight { // Using GeneralInsight from service now
//     id: string;
//     text: string;
//     source: string;
//     // Add other relevant fields like type, confidence, relatedEntityId, etc.
// }

const MLInsights: React.FC = () => {
  const [insights, setInsights] = useState<GeneralInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await predictionService.fetchGeneralInsights(); 
        setInsights(data); 
      } catch (e: any) {
        console.error("Failed to fetch ML insights", e);
        setError(e.message || "An unknown error occurred while fetching insights.");
        setInsights([]); // Clear insights on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  // Placeholder content removed
  // const placeholderInsights = [
  //   { id: 'insight1', text: 'Based on recent trends, consider Player A for Over 25.5 Points.', source: 'Performance Analyzer' },
  //   { id: 'insight2', text: 'Social sentiment for Team B is highly positive for their upcoming match.', source: 'Sentiment Engine' },
  //   { id: 'insight3', text: 'Arbitrage opportunity detected: Prop X (Over) vs Prop Y (Under).', source: 'Arbitrage Scanner' },
  // ];

  if (isLoading) return (
    <div className="flex items-center justify-center p-6 glass rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" /> 
        <p className="text-text-muted">Loading AI insights...</p>
    </div>
  );

  if (error) return (
    <div className="p-6 glass rounded-xl bg-red-500/10 text-red-400 flex items-center animate-fade-in">
        <AlertTriangle size={20} className="mr-2"/> Error: {error}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-2xl">🤖</span>
        <h4 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Machine Learning Insights</h4>
      </div>
      {Array.isArray(insights) && insights.length > 0 ? (
        (insights || []).map(insight => (
          <div key={insight.id} className="p-4 glass rounded-xl shadow-md bg-gradient-to-r from-purple-400/10 to-blue-400/10 animate-fade-in">
            <p className="text-base text-text font-semibold mb-1">{insight.text}</p>
            <p className="text-xs text-text-muted mt-1">
                Source: {insight.source} 
                {insight.confidence && ` | Confidence: ${(insight.confidence * 100).toFixed(0)}%`}
                {insight.type && ` | Type: ${insight.type}`}
            </p>
          </div>
        ))
      ) : (
        <p className="text-text-muted text-center p-4">No AI insights available at the moment.</p>
      )}
    </div>
  );
};

export default MLInsights; 