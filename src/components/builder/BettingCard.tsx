import React from 'react';
import { Builder } from '@builder.io/react';

// Custom Betting Card Component for Builder.io
interface BettingCardProps {
  title?: string;
  odds?: string;
  team1?: string;
  team2?: string;
  sport?: string;
  time?: string;
  onClick?: () => void;
}

const BettingCard: React.FC<BettingCardProps> = ({
  title = 'Match Title',
  odds = '2.5',
  team1 = 'Team A',
  team2 = 'Team B',
  sport = 'Football',
  time = 'Today 3:00 PM',
  onClick
}) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{sport}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{time}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm font-medium dark:text-white">{team1}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs</span>
          <span className="text-sm font-medium dark:text-white">{team2}</span>
        </div>
        <div className="bg-blue-500 text-white px-3 py-1 rounded font-bold">
          {odds}
        </div>
      </div>
    </div>
  );
};

// Register the component with Builder.io
Builder.registerComponent(BettingCard, {
  name: 'BettingCard',
  inputs: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Match Title',
      helperText: 'Title of the betting match'
    },
    {
      name: 'odds',
      type: 'string',
      defaultValue: '2.5',
      helperText: 'Betting odds'
    },
    {
      name: 'team1',
      type: 'string',
      defaultValue: 'Team A',
      helperText: 'First team name'
    },
    {
      name: 'team2',
      type: 'string',
      defaultValue: 'Team B',
      helperText: 'Second team name'
    },
    {
      name: 'sport',
      type: 'string',
      defaultValue: 'Football',
      helperText: 'Sport type'
    },
    {
      name: 'time',
      type: 'string',
      defaultValue: 'Today 3:00 PM',
      helperText: 'Match time'
    }
  ]
});

export default BettingCard;
