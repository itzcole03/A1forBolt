import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../components/ToastContext';
import { motion } from 'framer-motion';
import { predictionsApi } from '../api/predictions';
import ConfidenceIndicator from './ConfidenceIndicator';
import ApiHealthIndicator from './ApiHealthIndicator';

const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

const LineupBuilder = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterSport, setFilterSport] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalPlayer, setModalPlayer] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    position: 'All',
    minStat: '',
    maxStat: '',
    player: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const [predictions, setPredictions] = useState([]);
  const [selectedPredictions, setSelectedPredictions] = useState([]);
  const [optimizedLineup, setOptimizedLineup] = useState(null);
  const [sport, setSport] = useState('NBA');
  const [legs, setLegs] = useState(2);

  // Fetch lineup data (with optional refresh)
  const fetchLineup = async (refresh = false) => {
    setLoading(true);
    setError('');
    let url = '/api/lineup';
    const params = [];
    if (filterDate) params.push(`date=${filterDate}`);
    if (filterStatus !== 'All') params.push(`status=${filterStatus}`);
    if (filterTeam !== 'All') params.push(`team=${filterTeam}`);
    if (filterSport !== 'All') params.push(`sport=${filterSport}`);
    if (refresh) params.push('refresh=true');
    if (params.length) url += '?' + params.join('&');
    try {
      const res = await axios.get(url);
      const data = res.data.lineup || (Array.isArray(res.data) ? res.data : []);
      setPlayers(Array.isArray(data) ? data : []);
      if (res.data.teams) setTeams(res.data.teams);
      if (res.data.sports) setSports(res.data.sports);
      if (refresh) toast('Lineup and stats refreshed!', 'success');
    } catch (err) {
      setError('Lineup fetch error');
      toast('Lineup fetch error', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch predictions for selected sport
  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await predictionsApi.getPredictions(sport, new Date().toISOString());
      setPredictions(data);
    } catch (error) {
      toast('Error fetching predictions', 'error');
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  }, [sport, toast]);

  // Optimize lineup
  const optimizeLineup = useCallback(async () => {
    if (selectedPredictions.length < legs) {
      toast(`Please select at least ${legs} predictions`, 'warning');
      return;
    }

    try {
      setLoading(true);
      const data = await predictionsApi.getOptimizedLineup(selectedPredictions, legs);
      setOptimizedLineup(data);
      toast('Lineup optimized successfully', 'success');
    } catch (error) {
      toast('Error optimizing lineup', 'error');
      console.error('Error optimizing lineup:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPredictions, legs, toast]);

  // Run at startup and on filter change
  useEffect(() => {
    fetchLineup();
    fetchPredictions();
    // eslint-disable-next-line
  }, [filterDate, filterStatus, filterTeam, filterSport, fetchPredictions]);

  const handleSelect = player => {
    setSelectedPlayers(prev =>
      prev.some(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : [...prev, player]
    );
  };

  // Save lineup POST
  const handleSave = async () => {
    try {
      await axios.post('/api/lineup/save', selectedPlayers);
      toast('Lineup saved!', 'success');
    } catch (err) {
      toast('Failed to save lineup', 'error');
    }
  };

  const handleExport = (type) => {
    let dataStr, fileName;
    if (type === 'csv') {
      const header = Object.keys(selectedPlayers[0] || {}).join(',');
      const rows = selectedPlayers.map(p => Object.values(p).join(','));
      dataStr = [header, ...rows].join('\n');
      fileName = 'lineup.csv';
    } else {
      dataStr = JSON.stringify(selectedPlayers, null, 2);
      fileName = 'lineup.json';
    }
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
    toast('Lineup exported!', 'success');
  };

  // Unique filter options
  const positions = Array.from(new Set(players.map(p => p.position))).filter(Boolean);

  // Advanced filtering logic
  const filteredPlayers = players.filter(player => {
    const teamMatch = filterTeam === 'All' || player.team === filterTeam;
    const sportMatch = filterSport === 'All' || player.sport === filterSport;
    const positionMatch = advancedFilters.position === 'All' || player.position === advancedFilters.position;
    const minStatMatch = !advancedFilters.minStat || (player.stats && player.stats.value >= parseFloat(advancedFilters.minStat));
    const maxStatMatch = !advancedFilters.maxStat || (player.stats && player.stats.value <= parseFloat(advancedFilters.maxStat));
    const playerMatch = !advancedFilters.player || (player.name && player.name.toLowerCase().includes(advancedFilters.player.toLowerCase()));
    return teamMatch && sportMatch && positionMatch && minStatMatch && maxStatMatch && playerMatch;
  });

  // Handle prediction selection
  const handlePredictionSelect = (prediction) => {
    if (selectedPredictions.find(p => p.id === prediction.id)) {
      setSelectedPredictions(prev => prev.filter(p => p.id !== prediction.id));
    } else {
      if (selectedPredictions.length >= 6) {
        toast('Maximum 6 predictions allowed', 'warning');
        return;
      }
      setSelectedPredictions(prev => [...prev, prediction]);
    }
  };

  // Handle legs change
  const handleLegsChange = (newLegs) => {
    if (newLegs < 2 || newLegs > 6) {
      toast('Number of legs must be between 2 and 6', 'warning');
      return;
    }
    setLegs(newLegs);
    if (selectedPredictions.length > newLegs) {
      setSelectedPredictions(prev => prev.slice(0, newLegs));
    }
  };

  // Handle sport change
  const handleSportChange = (newSport) => {
    setSport(newSport);
    setSelectedPredictions([]);
    setOptimizedLineup(null);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!Array.isArray(players) || players.length === 0) {
    return <div className="p-4 text-center text-gray-500">No players available for lineup. Please check your data source.</div>;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lineup Builder</h2>
        <ApiHealthIndicator />
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-end" role="region" aria-label="Lineup filters">
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterTeam">Team</label>
          {/* Team filter dropdown */}
          <select id="filterTeam" className="border px-2 py-1" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
            <option value="All">All</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterSport">Sport</label>
          {/* Sport filter dropdown */}
          <select id="filterSport" className="border px-2 py-1" value={filterSport} onChange={e => setFilterSport(e.target.value)}>
            <option value="All">All</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterPosition">Position</label>
          <select id="filterPosition" className="border px-2 py-1" value={advancedFilters.position} onChange={e => setAdvancedFilters(f => ({ ...f, position: e.target.value }))}>
            <option value="All">All</option>
            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterMinStat">Min Stat</label>
          <input id="filterMinStat" type="number" className="border px-2 py-1 w-20" value={advancedFilters.minStat} onChange={e => setAdvancedFilters(f => ({ ...f, minStat: e.target.value }))} placeholder="Min" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterMaxStat">Max Stat</label>
          <input id="filterMaxStat" type="number" className="border px-2 py-1 w-20" value={advancedFilters.maxStat} onChange={e => setAdvancedFilters(f => ({ ...f, maxStat: e.target.value }))} placeholder="Max" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterPlayer">Player</label>
          <input id="filterPlayer" type="text" className="border px-2 py-1" value={advancedFilters.player} onChange={e => setAdvancedFilters(f => ({ ...f, player: e.target.value }))} placeholder="Search..." />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterDate">Game Date</label>
          <input id="filterDate" type="date" className="border px-2 py-1" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="filterStatus">Game Status</label>
          <select id="filterStatus" className="border px-2 py-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="live">Live</option>
            <option value="future">Future</option>
          </select>
        </div>

        {/* Selected count and clear button */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-700">Selected: {selectedPlayers.length}</span>
          <button
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setSelectedPlayers([])}
            disabled={selectedPlayers.length === 0}
            title="Clear selection"
          >
            Clear
          </button>
        </div>

        {/* Export dropdown */}
        <div className="relative">
          <button
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setShowExport(prev => !prev)}
            disabled={selectedPlayers.length === 0}
            title="Export lineup"
          >
            ⬇️ Export
          </button>
          {showExport && selectedPlayers.length > 0 && (
            <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => handleExport('csv')}
              >
                Export as CSV
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => handleExport('json')}
              >
                Export as JSON
              </button>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          onClick={fetchLineup}
          disabled={refreshing || loading}
          title="Refresh lineup and stats"
        >
          {refreshing ? (
            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
          ) : (
            <span>🔄</span>
          )}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map(player => (
          <div
            key={player.id}
            className={`border p-3 rounded shadow cursor-pointer ${
              selectedPlayers.some(p => p.id === player.id)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white'
            }`}
            onClick={() => handleSelect(player)}
            title={`Click to ${
              selectedPlayers.some(p => p.id === player.id) ? 'remove' : 'add'
            } this player`}
          >
            <div className="font-bold flex items-center justify-between">
              {player.name}
              <button
                className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                onClick={e => { e.stopPropagation(); setModalPlayer(player); }}
                title="Show details"
              >
                Details
              </button>
            </div>
            <div className="text-sm text-gray-600">{player.team} - {player.sport}</div>
          </div>
        ))}
      </div>

      {/* Modal for player details */}
      {modalPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setModalPlayer(null)}
              title="Close"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2">{modalPlayer.name}</h2>
            <div className="mb-1">Team: <span className="font-semibold">{modalPlayer.team}</span></div>
            <div className="mb-1">Sport: <span className="font-semibold">{modalPlayer.sport}</span></div>
            <div className="mb-1">Position: <span className="font-semibold">{modalPlayer.position || 'N/A'}</span></div>
            <div className="mb-1">Stats: <span className="font-semibold">{modalPlayer.stats ? JSON.stringify(modalPlayer.stats) : 'N/A'}</span></div>
            {/* Add more player details as needed */}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={selectedPlayers.length === 0}
        aria-disabled={selectedPlayers.length === 0}
        aria-label="Save lineup"
      >
        💾 Save Lineup
      </button>

      {/* Sport Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Sport
        </label>
        <select
          value={sport}
          onChange={(e) => handleSportChange(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="NBA">NBA</option>
          <option value="WNBA">WNBA</option>
          <option value="MLB">MLB</option>
          <option value="NHL">NHL</option>
          <option value="Soccer">Soccer</option>
        </select>
      </div>

      {/* Legs Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Legs
        </label>
        <input
          type="number"
          min="2"
          max="6"
          value={legs}
          onChange={(e) => handleLegsChange(parseInt(e.target.value))}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Predictions List */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Available Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              onClick={() => handlePredictionSelect(prediction)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPredictions.find(p => p.id === prediction.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {prediction.player}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.stat}
                  </p>
                </div>
                <ConfidenceIndicator value={prediction.confidence} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Predictions */}
      {selectedPredictions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Selected Predictions ({selectedPredictions.length}/{legs})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {prediction.player}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {prediction.stat}
                    </p>
                  </div>
                  <ConfidenceIndicator value={prediction.confidence} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimize Button */}
      <button
        onClick={optimizeLineup}
        disabled={loading || selectedPredictions.length < legs}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading || selectedPredictions.length < legs
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Optimizing...' : 'Optimize Lineup'}
      </button>

      {/* Optimized Lineup Display */}
      {optimizedLineup && (
        <div className="mt-4 p-4 border border-green-500 rounded-lg bg-green-50 dark:bg-green-900">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Optimized Lineup
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {optimizedLineup.predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-4 border border-green-500 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {prediction.player}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {prediction.stat}
                    </p>
                  </div>
                  <ConfidenceIndicator value={prediction.confidence} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expected Payout: {optimizedLineup.expectedPayout}x
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confidence Score: {optimizedLineup.confidenceScore}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupBuilder;
