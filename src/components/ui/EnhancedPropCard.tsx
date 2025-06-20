import React from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

export interface EnhancedPropCardProps {
  playerName: string;
  team: string;
  position: string;
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  sentiment?: string;
  aiBoost?: number;
  patternStrength?: number;
  bonusPercent?: number;
  enhancementPercent?: number;
  pickType?: 'demon' | 'goblin' | 'normal';
  trendValue?: number;
  gameInfo?: { opponent: string; day: string; time: string };
  playerImageUrl?: string;
  onSelect?: (pick: 'over' | 'under') => void;
  onViewDetails?: () => void;
  selected?: boolean;
  className?: string;
}

const badge = (label: string, value: string | number, color: string) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color} bg-opacity-10`}>
    {label}: {value}
  </span>
);

export const EnhancedPropCard: React.FC<EnhancedPropCardProps> = ({
  playerName,
  team,
  position,
  statType,
  line,
  overOdds,
  underOdds,
  sentiment,
  aiBoost,
  patternStrength,
  bonusPercent,
  enhancementPercent,
  pickType = 'normal',
  trendValue,
  gameInfo,
  playerImageUrl,
  onSelect,
  onViewDetails,
  selected = false,
  className = '',
}) => (
  <GlassCard className={`relative p-6 flex flex-col space-y-3 transition-all ${selected ? 'ring-4 ring-primary-500' : ''} ${className}`}>
    {/* Top Row: Player Image, Trend, Special Icon */}
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {playerImageUrl && (
          <img src={playerImageUrl} alt={playerName} className="w-10 h-10 rounded-lg object-cover border border-gray-300" />
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
    {/* Player Name and Game Info */}
    <div className="text-center">
      <div className="font-bold text-lg text-primary-600">{playerName}</div>
      {gameInfo && (
        <div className="text-xs text-gray-400">vs {gameInfo.opponent} {gameInfo.day} {gameInfo.time}</div>
      )}
    </div>
    {/* Stat Line */}
    <div className="flex items-center justify-center gap-2 mt-2">
      <span className="text-xl font-bold text-white">{line}</span>
      <span className="text-gray-400 text-sm">{statType}</span>
    </div>
    {/* Over/Under Buttons */}
    <div className="flex items-center justify-between space-x-2 mt-2">
      <GlowButton onClick={() => onSelect?.('over')} className={`flex-1 ${pickType === 'demon' ? 'bg-red-900/30 hover:bg-red-800/40 text-red-100' : pickType === 'goblin' ? 'bg-green-900/30 hover:bg-green-800/40 text-green-100' : ''}`}>Over <span className="ml-1 text-green-400">{overOdds > 0 ? `+${overOdds}` : overOdds}</span>{pickType === 'demon' && <span className="text-xs opacity-75 ml-1">1.25x</span>}{pickType === 'goblin' && <span className="text-xs opacity-75 ml-1">0.85x</span>}</GlowButton>
      <GlowButton onClick={() => onSelect?.('under')} className="flex-1">Under <span className="ml-1 text-blue-400">{underOdds > 0 ? `+${underOdds}` : underOdds}</span></GlowButton>
    </div>
    {/* Badges */}
    <div className="flex flex-wrap gap-2 mt-2">
      {aiBoost !== undefined && badge('AI Boost', `${aiBoost}%`, 'text-yellow-400')}
      {patternStrength !== undefined && badge('Pattern', `${patternStrength}%`, 'text-purple-400')}
      {bonusPercent !== undefined && badge('Bonus', `${bonusPercent}%`, 'text-green-400')}
      {enhancementPercent !== undefined && badge('Enhance', `${enhancementPercent}%`, 'text-blue-400')}
      {sentiment && badge('Sentiment', sentiment, 'text-pink-400')}
    </div>
    {/* View Details Button */}
    <button
      onClick={onViewDetails}
      className="absolute top-2 right-2 text-xs text-gray-400 hover:text-primary-500 underline focus:outline-none"
      aria-label="Show prediction explanation"
    >
      Why this prediction?
    </button>
  </GlassCard>
);

export default EnhancedPropCard;
