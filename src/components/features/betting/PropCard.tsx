import React from 'react';
import { PrizePicksProps, SocialSentimentData } from '../../types';
import { TrendingUp, TrendingDown, AlertCircle, ExternalLink, Info, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';


interface PropCardProps {
  prop: PrizePicksProps;
  // Sentiment might be passed in or fetched based on prop.player_name or prop.id
  sentiment?: SocialSentimentData;
  onViewDetails: (propId: string) => void;
  className?: string;
  team: string;
  position: string;
  statType: string;
  line: number;
  pickType?: 'demon' | 'goblin' | 'normal';
  trendValue?: number;
  gameInfo?: { opponent: string; day: string; time: string };
  playerImageUrl?: string;
}

const PropCard: React.FC<PropCardProps> = ({ prop, sentiment, onViewDetails, className, team, position, statType, line, pickType = 'normal', trendValue, gameInfo, playerImageUrl }) => {
  const { addToast, legs, addLeg } = useAppStore();

  const isSelected = legs.some(l => l.propId === prop.id);

  const handleViewDetailsClick = () => {
    onViewDetails(prop.id);
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent card click if link is clicked
    window.open(url, '_blank');
    addToast({ message: `Opening news link: ${url.substring(0,30)}...`, type: 'info'});
  };

  const getSentimentIcon = () => {
    if (!sentiment || sentiment.sentimentScore === undefined) return <AlertCircle className="w-4 h-4 text-gray-500" />;
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
    addToast({ message: `${prop.player_name} ${pick.toUpperCase()} ${prop.line_score} added to slip!`, type: 'success' });
  };

  return (
    <div 
      className={`glass rounded-xl shadow-lg p-4 flex flex-col justify-between space-y-3 hover:shadow-primary/30 transition-shadow cursor-pointer transform hover:-translate-y-1 relative ${className || ''}`}
      onClick={() => onViewDetails(prop.id)}
      aria-label={`View details for ${prop.player_name}`}
      tabIndex={0}
      role="button"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {playerImageUrl && (
            <img src={playerImageUrl} alt={prop.player_name} className="w-10 h-10 rounded-lg object-cover border border-gray-300" />
          )}
          <div className="text-xs text-gray-400">{team} - {position}</div>
        </div>
        {trendValue !== undefined && (
          <span className="text-xs text-white bg-gradient-to-r from-green-500 to-blue-500 px-2 py-1 rounded-full font-bold shadow">{trendValue}K</span>
        )}
        {(pickType === 'demon' || pickType === 'goblin') && (
          <img
            src={pickType === 'demon' ? 'https://app.prizepicks.com/7534b2e82fa0ac08ec43.png' : 'https://app.prizepicks.com/e00b98475351cdfd1c38.png'}
            alt={pickType}
            className="w-7 h-7 ml-2"
          />
        )}
      </div>
      <div className="text-center">
        <div className="font-bold text-lg text-primary-600">{prop.player_name}</div>
        {gameInfo && (
          <div className="text-xs text-gray-400">vs {gameInfo.opponent} {gameInfo.day} {gameInfo.time}</div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-xl font-bold text-white">{line}</span>
        <span className="text-gray-400 text-sm">{statType}</span>
      </div>

      <div className="space-y-2 text-xs">
        {sentiment && (
          <div className="flex items-center space-x-1 text-text-muted">
            {getSentimentIcon()}
            <span>Social Sentiment: {sentiment.sentimentScore.toFixed(2)}</span> 
            <span title={`Pos: ${sentiment.positiveMentions}, Neg: ${sentiment.negativeMentions}, Neu: ${sentiment.neutralMentions}`}>
              <Info size={12} className="cursor-help" />
            </span>
          </div>
        )}
        {/* Placeholder for links to ESPN/News - this would need actual data or a search link */}
        <button 
            onClick={(e) => handleExternalLink(e, `https://www.espn.com/search/results?q=${encodeURIComponent(prop.player_name)}`)}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 hover:underline"
        >
            <ExternalLink size={12} />
            <span>ESPN/News</span>
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={e => { e.stopPropagation(); handleAddLeg('over'); }}
          className="flex-1 px-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-semibold"
          disabled={isSelected}
          aria-label={`Add OVER for ${prop.player_name}`}
        >
          Add OVER
        </button>
        <button
          onClick={e => { e.stopPropagation(); handleAddLeg('under'); }}
          className="flex-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs font-semibold"
          disabled={isSelected}
          aria-label={`Add UNDER for ${prop.player_name}`}
        >
          Add UNDER
        </button>
      </div>
      <button 
        onClick={handleViewDetailsClick}
        className="w-full mt-2 px-3 py-2 text-sm bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors font-medium"
      >
        View Details & Place Bet
      </button>
    </div>
  );
};

export default PropCard;