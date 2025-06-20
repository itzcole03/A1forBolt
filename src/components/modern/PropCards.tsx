import React, { useState } from 'react';
import { ProcessedPrizePicksProp } from '../../types/prizePicks';

interface PropCardsProps {
  props: ProcessedPrizePicksProp[];
}

const getEmoji = (type: 'goblin' | 'demon' | 'normal') => {
  if (type === 'goblin') return '💰';
  if (type === 'demon') return '👹';
  return '⇄';
};

const getSentimentBadge = (sentiment?: {
  score: number;
  direction: 'up' | 'down' | 'neutral';
  tooltip?: string;
}) => {
  if (!sentiment) return null;
  const color =
    sentiment.direction === 'up'
      ? 'bg-green-100 text-green-700'
      : sentiment.direction === 'down'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-200 text-gray-700';
  const icon = sentiment.direction === 'up' ? '▲' : sentiment.direction === 'down' ? '▼' : '−';
  return (
    <span
      className={`ml-2 px-2 py-1 rounded-full text-xs ${color} cursor-help`}
      title={sentiment.tooltip || ''}
    >
      {icon} {sentiment.score}
    </span>
  );
};

const PropCards: React.FC<PropCardsProps> = ({ props }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (!props.length) {
    return (
      <main className="section space-y-6 lg:space-y-8 animate-fade-in">
        <div className="modern-card p-6 lg:p-8 text-center text-gray-500">
          No props available. Please check back later.
        </div>
      </main>
    );
  }

  return (
    <main className="section space-y-6 lg:space-y-8 animate-fade-in">
      <div className="modern-card p-6 lg:p-8">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">🎯 Player Props</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {props.map(prop => (
            <div
              key={prop.player_name + prop.stat_type + prop.game_time}
              className="prop-card glass text-gray-900 dark:text-white relative transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => setSelected(prop.player_name + prop.stat_type + prop.game_time)}
            >
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg lg:text-xl font-bold flex items-center gap-2">
                    {prop.player_name}
                    {getSentimentBadge((prop as any)?.sentiment)}
                  </h3>
                  <span className="text-xs font-bold text-gray-500">{prop.team_abbreviation}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  {prop.stat_type} {prop.line_value}
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl lg:text-3xl font-bold">
                    {getEmoji(prop.winningProp.type)}
                  </span>
                  <span className="text-sm font-bold">
                    {(prop.winningProp.percentage * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-orange-500 ml-2">🔥{prop.pick_count}</span>
                </div>
                {(prop as any)?.espnNews && (
                  <a
                    className="text-xs text-blue-600 hover:underline"
                    href={
                      typeof (prop as any).espnNews === 'string'
                        ? undefined
                        : (prop as any).espnNews?.link
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    📰{' '}
                    {typeof (prop as any).espnNews === 'string'
                      ? (prop as any).espnNews
                      : (prop as any).espnNews?.title}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Detail Modal (stub) */}
        {selected && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="modern-card max-w-2xl w-full p-8 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Prop Details</h3>
              <pre className="text-xs whitespace-pre-wrap break-all">
                {JSON.stringify(
                  props.find(p => p.player_name + p.stat_type + p.game_time === selected),
                  null,
                  2
                )}
              </pre>
              <button className="modern-button mt-6" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default React.memo(PropCards);
