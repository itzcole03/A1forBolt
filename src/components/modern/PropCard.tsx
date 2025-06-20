import React from 'react';
import { PrizePicksProps, SocialSentimentData } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ExternalLink,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface PropCardProps {
  prop: PrizePicksProps;
  // Sentiment might be passed in or fetched based on prop.player_name or prop.id
  sentiment?: SocialSentimentData;
  onViewDetails: (propId: string) => void;
  className?: string;
}

const PropCard: React.FC<PropCardProps> = ({ prop, sentiment, onViewDetails, className }) => {
  const { addToast, legs, addLeg } = useAppStore();

  const isSelected = legs.some(l => l.propId === prop.id);

  const handleViewDetailsClick = () => {
    onViewDetails(prop.id);
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent card click if link is clicked
    window.open(url, '_blank');
    addToast({ message: `Opening news link: ${url.substring(0, 30)}...`, type: 'info' });
  };

  const getSentimentIcon = () => {
    if (!sentiment || sentiment.sentimentScore === undefined)
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
    if (sentiment.sentimentScore > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (sentiment.sentimentScore < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const handleAddLeg = (pick: 'over' | 'under') => {
    const odds = pick === 'over' ? prop.overOdds : prop.underOdds;
    if (odds === undefined) {
      addToast({ message: `Odds for ${pick.toUpperCase()} not available.`, type: 'error' });
      return;
    }
    addLeg({
      propId: prop.id,
      pick,
      line: prop.line_score,
      statType: prop.stat_type,
      playerName: prop.player_name,
      odds,
    });
    addToast({
      message: `${prop.player_name} ${pick.toUpperCase()} ${prop.line_score} added to slip!`,
      type: 'success',
    });
  };

  return (
    <div
      aria-label={`View details for ${prop.player_name}`}
      className={`glass rounded-xl shadow-lg p-4 flex flex-col justify-between space-y-3 hover:shadow-primary/30 transition-shadow cursor-pointer transform hover:-translate-y-1 relative ${className || ''}`}
      role="button"
      tabIndex={0}
      onClick={handleViewDetailsClick}
      onKeyDown={e => {
        if (e.key === 'Enter') handleViewDetailsClick();
      }}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 text-green-400" title="Selected in bet slip">
          <CheckCircle size={22} />
        </div>
      )}
      <div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-text-muted uppercase tracking-wider">
            {prop.league} - {prop.stat_type}
          </p>
          {/* Placeholder for live win rate if available from an AI engine */}
          {/* <span className="text-xs font-semibold px-2 py-1 rounded-full bg-accent/20 text-accent">68% Win</span> */}
        </div>
        <h4 className="text-lg font-semibold text-text truncate" title={prop.player_name}>
          {prop.player_name}
        </h4>
        <p className="text-2xl font-bold text-primary">
          {prop.line_score}{' '}
          <span className="text-sm font-normal text-text-muted">
            {prop.description || prop.stat_type}
          </span>
        </p>
      </div>

      <div className="space-y-2 text-xs">
        {sentiment && (
          <div className="flex items-center space-x-1 text-text-muted">
            {getSentimentIcon()}
            <span>Social Sentiment: {sentiment.sentimentScore.toFixed(2)}</span>
            <span
              title={`Pos: ${sentiment.positiveMentions}, Neg: ${sentiment.negativeMentions}, Neu: ${sentiment.neutralMentions}`}
            >
              <Info className="cursor-help" size={12} />
            </span>
          </div>
        )}
        {/* Placeholder for links to ESPN/News - this would need actual data or a search link */}
        <button
          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 hover:underline"
          onClick={e =>
            handleExternalLink(
              e,
              `https://www.espn.com/search/results?q=${encodeURIComponent(prop.player_name)}`
            )
          }
        >
          <ExternalLink size={12} />
          <span>ESPN/News</span>
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          aria-label={`Add OVER for ${prop.player_name}`}
          className="flex-1 px-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-semibold"
          disabled={isSelected}
          onClick={e => {
            e.stopPropagation();
            handleAddLeg('over');
          }}
        >
          Add OVER
        </button>
        <button
          aria-label={`Add UNDER for ${prop.player_name}`}
          className="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-semibold"
          disabled={isSelected}
          onClick={e => {
            e.stopPropagation();
            handleAddLeg('under');
          }}
        >
          Add UNDER
        </button>
      </div>
      <button
        className="w-full mt-2 px-3 py-2 text-sm bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors font-medium"
        onClick={handleViewDetailsClick}
      >
        View Details & Place Bet
      </button>
    </div>
  );
};

export default React.memo(PropCard);
