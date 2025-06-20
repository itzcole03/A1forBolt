import PropCard from '../components/modern/PropCard';
import React, { useEffect, useState, useMemo } from 'react';
import { Modal } from '../components/modern/Modals';
import { PrizePicksProps, SocialSentimentData, ParlayLeg } from '../types';
import { Search, Filter, AlertTriangle, Info, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useAppStore, AppStore } from '../store/useAppStore';


const PrizePicksPage: React.FC = () => {
  const {
    props, isLoadingProps, error: propsError,
    currentPrizePicksPlayer, isLoadingPlayer, 
    currentPrizePicksLines, isLoadingLines,
    sentiments,
    fetchProps,
    fetchPrizePicksPlayer,
    fetchPrizePicksLines,
    fetchSentiments,
    addLeg, addToast,
  } = useAppStore((state: AppStore) => ({
    props: state.props,
    isLoadingProps: state.isLoadingProps,
    error: state.error,
    currentPrizePicksPlayer: state.currentPrizePicksPlayer,
    isLoadingPlayer: state.isLoadingPlayer,
    currentPrizePicksLines: state.currentPrizePicksLines,
    isLoadingLines: state.isLoadingLines,
    sentiments: state.sentiments,
    fetchProps: state.fetchProps,
    fetchPrizePicksPlayer: state.fetchPrizePicksPlayer,
    fetchPrizePicksLines: state.fetchPrizePicksLines,
    fetchSentiments: state.fetchSentiments,
    addLeg: state.addLeg,
    addToast: state.addToast,
  }));

  const [selectedProp, setSelectedProp] = useState<PrizePicksProps | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [statTypeFilter, setStatTypeFilter] = useState('all');

  useEffect(() => {
    fetchProps(leagueFilter === 'all' ? undefined : leagueFilter, 
               statTypeFilter === 'all' ? undefined : statTypeFilter);
  }, [fetchProps, leagueFilter, statTypeFilter]);

  const handleViewDetails = async (prop: PrizePicksProps) => {
    setSelectedProp(prop);
    setIsDetailModalOpen(true);
    fetchPrizePicksPlayer(prop.player_name);
    fetchPrizePicksLines(prop.id);
    fetchSentiments(prop.player_name);
  };

  const getSentimentForProp = (propPlayerName: string): SocialSentimentData | undefined => {
    return sentiments[propPlayerName.toLowerCase()];
  };
  
  const allLeagues: string[] = useMemo(() => Array.from(new Set((Array.isArray(props) ? props : []).map((p: PrizePicksProps) => p.league))), [props]);
  const allStatTypes: string[] = useMemo(() => Array.from(new Set((Array.isArray(props) ? props : []).map((p: PrizePicksProps) => p.stat_type))), [props]);

  const filteredProps = (Array.isArray(props) ? props : []).filter((p: PrizePicksProps) => 
    (leagueFilter === 'all' || p.league?.toLowerCase() === leagueFilter.toLowerCase()) &&
    (statTypeFilter === 'all' || p.stat_type?.toLowerCase() === statTypeFilter.toLowerCase()) &&
    (p.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.stat_type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddLeg = (pickType: 'over' | 'under') => {
    if (!selectedProp) return;

    const lines = currentPrizePicksLines; // From useAppStore selector
    let pickOdds: number | undefined;

    if (pickType === 'over') {
      pickOdds = lines?.over_odds ?? selectedProp.overOdds;
    } else {
      pickOdds = lines?.under_odds ?? selectedProp.underOdds;
    }

    if (pickOdds === undefined) {
        addToast({message: `Odds for ${selectedProp.player_name} ${pickType.toUpperCase()} not available. Cannot add to slip.`, type: 'error'});
        return;
    }

    const leg: ParlayLeg = {
      propId: selectedProp.id,
      pick: pickType,
      line: selectedProp.line_score,
      statType: selectedProp.stat_type,
      playerName: selectedProp.player_name,
      odds: pickOdds, // Added odds
    };
    addLeg(leg);
    addToast({message: `${selectedProp.player_name} ${pickType.toUpperCase()} ${selectedProp.line_score} added to slip!`, type: 'success'});
    setIsDetailModalOpen(false);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-semibold text-text">PrizePicks Player Props</h1>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 glass rounded-xl shadow-lg">
        <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"/>
          <input 
            type="text" placeholder="Search props, players..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-surface/50 border border-gray-600 rounded-lg text-text focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="leagueFilter" className="block text-xs font-medium text-text-muted mb-1">League</label>
          <select id="leagueFilter" value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)}
            className="w-full p-2 bg-surface/50 border border-gray-600 rounded-lg text-text focus:ring-primary focus:border-primary"
          >
            <option value="all">All Leagues</option>
            {allLeagues.map((league) => <option key={league} value={league}>{league}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="statTypeFilter" className="block text-xs font-medium text-text-muted mb-1">Stat Type</label>
          <select id="statTypeFilter" value={statTypeFilter} onChange={(e) => setStatTypeFilter(e.target.value)}
            className="w-full p-2 bg-surface/50 border border-gray-600 rounded-lg text-text focus:ring-primary focus:border-primary"
          >
            <option value="all">All Stat Types</option>
            {allStatTypes.map((stat) => <option key={stat} value={stat}>{stat}</option>)}
          </select>
        </div>
        <button onClick={() => fetchProps(leagueFilter === 'all' ? undefined : leagueFilter, statTypeFilter === 'all' ? undefined : statTypeFilter)} 
          className="col-span-1 sm:col-span-2 md:col-span-4 flex items-center justify-center p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          disabled={isLoadingProps}
        >
          {isLoadingProps ? <Loader2 className="w-5 h-5 animate-spin"/> : <Filter className="w-5 h-5 mr-2" />} Apply Filters
        </button>
      </div>

      {/* Props Display */}
      {isLoadingProps && (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-3" />
          <p className="text-text-muted">Loading PrizePicks Props...</p>
        </div>
      )}
      {!isLoadingProps && propsError && (
        <div className="text-center p-6 bg-red-500/10 text-red-400 rounded-xl">
          <AlertTriangle className="w-8 h-8 inline mr-2" /> Error fetching props: {propsError}
        </div>
      )}
      {!isLoadingProps && !propsError && (filteredProps?.length ?? 0) === 0 && (
        <div className="text-center p-6 text-text-muted rounded-xl glass">
          No props found matching your criteria. Try adjusting filters or search.
        </div>
      )}
      {!isLoadingProps && !propsError && (filteredProps?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(filteredProps || []).map((prop: PrizePicksProps) => (
            <PropCard key={prop.id} prop={prop} sentiment={getSentimentForProp(prop.player_name)} onViewDetails={() => handleViewDetails(prop)} />
          ))}
        </div>
      )}

      {/* Prop Detail Modal */}
      {selectedProp && (
        <Modal 
          isOpen={isDetailModalOpen} 
          onClose={() => setIsDetailModalOpen(false)} 
          title={`${selectedProp.player_name} - ${selectedProp.stat_type} ${selectedProp.line_score}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2">Prop Details</h4>
                {isLoadingPlayer && <div className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2 text-primary" /><span className="text-text-muted">Loading player...</span></div>}
                {!isLoadingPlayer && propsError && !currentPrizePicksPlayer && <p className="text-sm text-red-400">Error loading player details.</p>}
                {!isLoadingPlayer && currentPrizePicksPlayer && (
                  <>
                    <p><strong className="text-text-muted">League:</strong> {selectedProp.league}</p>
                    <p><strong className="text-text-muted">Team:</strong> {currentPrizePicksPlayer.team || 'N/A'}</p>
                    <p><strong className="text-text-muted">Position:</strong> {currentPrizePicksPlayer.position || 'N/A'}</p>
                  </>
                )}
                 {/* Display general prop info even if player details are loading/failed */}
                <p><strong className="text-text-muted">Description:</strong> {selectedProp.description}</p>
                {selectedProp.start_time && <p><strong className="text-text-muted">Start Time:</strong> {new Date(selectedProp.start_time).toLocaleString()}</p>}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2">Market Lines</h4>
                {isLoadingLines && <div className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2 text-primary" /><span className="text-text-muted">Loading lines...</span></div>}
                {!isLoadingLines && propsError && !currentPrizePicksLines && <p className="text-sm text-red-400">Error loading market lines.</p>}
                {!isLoadingLines && currentPrizePicksLines && (
                  <>
                    <p><strong className="text-text-muted">Over Odds:</strong> {currentPrizePicksLines.over_odds ?? selectedProp.overOdds ?? 'N/A'}</p>
                    <p><strong className="text-text-muted">Under Odds:</strong> {currentPrizePicksLines.under_odds ?? selectedProp.underOdds ?? 'N/A'}</p>
                  </>
                )}
                {!isLoadingLines && !currentPrizePicksLines && !propsError && <p className="text-text-muted">No specific line data available.</p>}
              </div>
            </div>
            
            {currentPrizePicksPlayer?.image_url && (
                <img src={currentPrizePicksPlayer.image_url} alt={currentPrizePicksPlayer.name} className="w-24 h-24 rounded-full mx-auto my-3 shadow-md"/>
            )}

            <div className="my-3">
                <h4 className="text-md font-semibold text-primary mb-1">Social Sentiment</h4>
                 {sentiments[selectedProp.player_name.toLowerCase()] ? (
                    <div className="flex items-center space-x-2 text-sm text-text-muted">
                       {sentiments[selectedProp.player_name.toLowerCase()].sentimentScore > 0.2 ? <TrendingUp className="text-green-500"/> : 
                        sentiments[selectedProp.player_name.toLowerCase()].sentimentScore < -0.2 ? <TrendingDown className="text-red-500"/> : 
                        <Info className="text-yellow-500"/>} 
                       <span>Score: {sentiments[selectedProp.player_name.toLowerCase()].sentimentScore.toFixed(2)}</span>
                       <span>(Pos: {sentiments[selectedProp.player_name.toLowerCase()].positiveMentions}, Neg: {sentiments[selectedProp.player_name.toLowerCase()].negativeMentions})</span>
                    </div>
                 ) : <p className="text-sm text-text-muted">Sentiment not available or still loading.</p>}
            </div>
            
            <p className="text-sm text-text-muted">Advanced stats, historical performance, and AI predictions for this prop will be shown here.</p>
            
            <div className="mt-6 flex gap-3">
                <button onClick={() => handleAddLeg('over')} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
                    Add OVER {selectedProp.line_score} to Slip
                </button>
                 <button onClick={() => handleAddLeg('under')} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                    Add UNDER {selectedProp.line_score} to Slip
                </button>
            </div>
            <button onClick={() => setIsDetailModalOpen(false)} className="w-full mt-3 px-4 py-2 bg-surface/80 hover:bg-surface text-text rounded-lg transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrizePicksPage; 