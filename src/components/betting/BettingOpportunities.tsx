import React from 'react';
import GlassCard from '../ui/GlassCard';
import EnhancedPropCard from '../ui/EnhancedPropCard';
import GlowButton from '../ui/GlowButton';
import Tooltip from '../ui/Tooltip';
import { BetRecommendation, BettingAlert, BettingOpportunity } from '../../types/betting';
import { formatCurrency, formatPercentage, formatOdds } from '../../utils/formatters';

interface BettingOpportunitiesProps {
  opportunities: (BetRecommendation | BettingOpportunity)[];
  onBetPlacement: (opportunity: BetRecommendation | BettingOpportunity) => void;
  alerts: BettingAlert[];
  isLoading: boolean;
}

export const BettingOpportunities: React.FC<BettingOpportunitiesProps> = ({
  opportunities,
  onBetPlacement,
  alerts,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <GlassCard className="mb-3">
        <div className="text-blue-600 font-semibold">
          No betting opportunities available at the moment.
        </div>
      </GlassCard>
    );
  }

  const isBetRecommendation = (
    opp: BetRecommendation | BettingOpportunity
  ): opp is BetRecommendation => {
    return 'confidence_score' in opp && 'expected_roi' in opp && 'recommended_stake' in opp;
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <GlassCard key={index} className="mb-2">
          <div className="text-yellow-600 font-semibold">{alert.message}</div>
        </GlassCard>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opportunity, idx) => (
          <GlassCard key={isBetRecommendation(opportunity) ? opportunity.event_id : opportunity.id}>
            <EnhancedPropCard
              playerName={opportunity.playerName || opportunity.prediction?.playerName || ''}
              team={opportunity.team || ''}
              position={opportunity.position || ''}
              statType={opportunity.statType || ''}
              line={opportunity.line || 0}
              overOdds={opportunity.overOdds || opportunity.odds || 0}
              underOdds={opportunity.underOdds || opportunity.odds || 0}
              aiBoost={opportunity.aiBoost}
              patternStrength={opportunity.patternStrength}
              bonusPercent={opportunity.bonusPercent}
              enhancementPercent={opportunity.enhancementPercent}
              pickType={opportunity.pickType}
              trendValue={opportunity.trendValue}
              gameInfo={opportunity.gameInfo}
              playerImageUrl={opportunity.playerImageUrl}
              onSelect={() => onBetPlacement(opportunity)}
              onViewDetails={() => {}}
            />
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Tooltip content="Confidence score for this bet.">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      isBetRecommendation(opportunity)
                        ? opportunity.confidence_score > 0.7
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        : opportunity.confidence > 0.7
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {formatPercentage(
                      isBetRecommendation(opportunity) ? opportunity.confidence_score : opportunity.confidence
                    )}{' '}
                    Confidence
                  </span>
                </Tooltip>
                <Tooltip content="Expected ROI for this bet.">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {formatPercentage(
                      isBetRecommendation(opportunity) ? opportunity.expected_roi : opportunity.marketEdge
                    )}{' '}
                    ROI
                  </span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content="Recommended stake for this bet.">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {formatCurrency(isBetRecommendation(opportunity) ? opportunity.recommended_stake : 0)} Stake
                  </span>
                </Tooltip>
                <Tooltip content="Odds for this bet.">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                    {formatOdds(opportunity.odds)}
                  </span>
                </Tooltip>
                <Tooltip content="Win probability for this bet.">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                    {formatPercentage(
                      isBetRecommendation(opportunity) ? opportunity.prediction?.home_win_probability : opportunity.prediction
                    )}{' '}
                    Win Prob
                  </span>
                </Tooltip>
              </div>
              <GlowButton onClick={() => onBetPlacement(opportunity)} className="w-full mt-2">
                Place Bet
              </GlowButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
