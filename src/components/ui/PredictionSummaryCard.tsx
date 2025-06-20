import React, { useState, useCallback } from 'react';
import GlassCard from './GlassCard';

// Simple Info icon component
const InfoIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="inline-block"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// Simple tooltip component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded-md shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Props for the PredictionSummaryCard component
 */
export interface PredictionSummaryProps {
  /** Model's prediction accuracy (0-100) */
  accuracy: number;
  /** Expected payout multiplier */
  payout: number;
  /** Kelly Criterion value (0-1) */
  kelly: number;
  /** Market edge percentage (can be negative) */
  marketEdge: number;
  /** Data quality score (0-100) */
  dataQuality: number;
  /** Name of the prediction model */
  modelName?: string;
  /** Confidence level (0-100) */
  confidence?: number;
  /** Additional CSS classes */
  className?: string;
  /** Last updated timestamp */
  lastUpdated?: Date;
  /** Risk level indicator */
  riskLevel?: 'low' | 'medium' | 'high';
  /** Callback when details button is clicked */
  onDetailsClick?: () => void;
  /** Callback when add to betslip is clicked */
  onAddToBetslip?: () => void;
  /** Whether the card is interactive */
  interactive?: boolean;
}

const getRiskLevelColor = (level?: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low':
      return 'bg-green-500/20 text-green-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'high':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export const PredictionSummaryCard: React.FC<PredictionSummaryProps> = (props) => {
  // Destructure props with defaults first
  const {
    accuracy,
    payout,
    kelly,
    marketEdge,
    dataQuality,
    modelName,
    confidence,
    className = '',
    lastUpdated = new Date(),
    riskLevel = 'medium',
    onDetailsClick,
    onAddToBetslip,
    interactive = true
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  
  // Format the date after destructuring
  const formattedDate = lastUpdated.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDetailsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDetailsClick?.();
  }, [onDetailsClick]);

  const handleAddToBetslip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToBetslip?.();
  }, [onAddToBetslip]);

  // Determine if the card is clickable
  const isClickable = Boolean(onDetailsClick || onAddToBetslip);
  
  // Handle click on card
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDetailsClick) {
      onDetailsClick();
    } else if (onAddToBetslip) {
      onAddToBetslip();
    }
  }, [onDetailsClick, onAddToBetslip]);

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onDetailsClick) {
        onDetailsClick();
      } else if (onAddToBetslip) {
        onAddToBetslip();
      }
    }
  };

  return (
    <div 
      className={`w-full max-w-xl mx-auto transition-all duration-300 ${
        isClickable ? 'cursor-pointer hover:shadow-lg' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? handleCardClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      aria-label={`Prediction details for ${modelName || 'unknown model'}. ${riskLevel} risk level.`}
      aria-expanded={isHovered}
      data-testid="prediction-summary-card"
    >
      <GlassCard className="relative overflow-hidden">
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent transition-opacity duration-300" />
        )}
        
        <div 
          className="relative z-10 p-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-between mb-4">
            {modelName && (
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-primary-600 tracking-wide">
                  {modelName}
                </h3>
                <Tooltip content="Model performance metrics">
                  <InfoIcon />
                </Tooltip>
              </div>
            )}
            <div 
              className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(riskLevel)}`}
              aria-label={`Risk level: ${riskLevel}`}
            >
              <span aria-hidden="true">{riskLevel.toUpperCase()} RISK</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                <span className="sr-only">Accuracy:</span>
                <span aria-hidden="true">Accuracy</span>
                <Tooltip content="Model's prediction accuracy based on historical data">
                  <InfoIcon />
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-primary-500 mt-1">
                {accuracy.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                <span className="sr-only">Payout:</span>
                <span aria-hidden="true">Payout</span>
                <Tooltip content="Expected payout multiplier">
                  <InfoIcon />
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-green-500 mt-1">
                {payout.toFixed(2)}x
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                <span className="sr-only">Kelly Criterion:</span>
                <span aria-hidden="true">Kelly</span>
                <Tooltip content="Kelly Criterion - Recommended bet size">
                  <InfoIcon />
                </Tooltip>
              </div>
              <div className={`text-2xl font-bold ${kelly >= 0.5 ? 'text-green-500' : 'text-yellow-400'}`}>
                {kelly.toFixed(2)}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                <span className="sr-only">Market Edge:</span>
                <span aria-hidden="true">Market Edge</span>
                <Tooltip content="Estimated advantage over the market">
                  <InfoIcon />
                </Tooltip>
              </div>
              <div className={`text-2xl font-bold ${marketEdge > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketEdge > 0 ? '+' : ''}{marketEdge.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Data Quality</span>
                <span className="font-semibold text-purple-400">
                  {dataQuality.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${dataQuality}%` }}
                />
              </div>
            </div>

            {confidence !== undefined && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Confidence</span>
                  <span className="font-semibold text-pink-400">
                    {confidence.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-pink-500 h-1.5 rounded-full"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div 
            className="mt-6 pt-4 border-t border-white/10"
            aria-live="polite"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                Updated: {formattedDate}
              </span>
              <div 
                className="flex space-x-2"
                role="group"
                aria-label="Card actions"
              >
                {onAddToBetslip && interactive && (
                  <button
                    onClick={handleAddToBetslip}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Add to betslip"
                  >
                    <span>Add to Betslip</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
                {onDetailsClick && interactive && (
                  <button
                    onClick={handleDetailsClick}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="View details"
                  >
                    <span>View Details</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {isHovered && interactive && onDetailsClick && (
              <div className="text-xs text-gray-500 text-right animate-fade-in">
                Click anywhere to view full prediction details
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PredictionSummaryCard;
