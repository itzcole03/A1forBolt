import { Calendar, Clock, MapPin } from 'lucide-react';
// You may need to update the import path for ProcessedGame if it differs in your frontend
import { format } from 'date-fns';
import { ProcessedGame } from '../../services/dataProcessor';

interface LiveGamesDisplayProps {
    games: ProcessedGame[];
}

export function LiveGamesDisplay({ games }: LiveGamesDisplayProps) {
    const getSportIcon = (sport: string) => {
        const icons: { [key: string]: string } = {
            'NBA': '🏀',
            'NFL': '🏈',
            'MLB': '⚾',
            'NHL': '🏒',
            'Soccer': '⚽'
        };
        return icons[sport] || '🏆';
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'live':
            case 'in progress':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'scheduled':
            case 'pre-game':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'final':
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
    };

    if (games.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Live Games</h3>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No games available from real data sources</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white">Live Games</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {games.length} games from real sources
                </div>
            </div>

            <div className="space-y-4">
                {games.slice(0, 10).map((game) => (
                    <div
                        key={game.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getSportIcon(game.sport)}</span>
                                <div>
                                    <div className="font-semibold text-lg dark:text-white">
                                        {game.awayTeam} @ {game.homeTeam}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {game.sport} • {game.source}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                                {game.status}
                            </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{format(new Date(game.gameTime), 'MMM d, h:mm a')}</span>
                            </div>
                            {game.venue && (
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{game.venue}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
