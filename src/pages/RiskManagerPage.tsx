

import React, { useState, useEffect } from 'react';
import { RiskProfile, BetRecord } from '../types/core';
import { RiskProfileService } from '../services/risk/RiskProfileService';
import { riskManagementService } from '../services/riskManagement';

const RiskManagerPage: React.FC = () => {
  const [profiles, setProfiles] = useState<RiskProfile[]>([]);
  const [activeBets, setActiveBets] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);


  // Fetch risk profiles and active bets on mount (using services)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const profileService = RiskProfileService.getInstance();
        const fetchedProfiles = profileService.getAllProfiles();
        setProfiles(fetchedProfiles);
        // For demo, use riskManagementService for bets
        const bets = riskManagementService.getBets();
        setActiveBets(bets);
      } catch (err) {
        setError('Failed to load risk profiles or active bets.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeProfile = profiles.find((p) => p.isActive);
  const totalExposure = activeBets.reduce((sum, bet) => sum + bet.stake, 0);
  const maxPotentialLoss = totalExposure;
  const maxPotentialWin = activeBets.reduce((sum, bet) => sum + bet.potentialWin, 0);

  // If you need to color-code risk, adapt this function to BetRecord or remove if not needed
  const getRiskColor = (_risk: string) => {
    // Placeholder: implement if BetRecord has a risk property
    return 'text-gray-600 dark:text-gray-400';
  };


  // Modal logic for creating a new profile (scaffold)
  // (Implementation will be added in a future step)

  return (
    <main className="section space-y-6 lg:space-y-8 animate-fade-in">
      <div className="modern-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">⚖️ Risk Manager</h1>
          <button className="modern-button" onClick={() => setShowModal(true)}>
            Create New Profile
          </button>
        </div>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Active Profile
                </h3>
                <p className="text-2xl font-bold">{activeProfile?.name || 'None'}</p>
              </div>
              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Total Exposure
                </h3>
                <p className="text-2xl font-bold">${totalExposure.toFixed(2)}</p>
              </div>
              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Max Potential Loss
                </h3>
                <p className="text-2xl font-bold text-red-600">-${maxPotentialLoss.toFixed(2)}</p>
              </div>
              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Max Potential Win
                </h3>
                <p className="text-2xl font-bold text-green-600">+${maxPotentialWin.toFixed(2)}</p>
              </div>
            </div>
            {/* Risk Profiles */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Risk Profiles</h2>
              {profiles.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  No risk profiles available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`modern-card p-6 ${profile.isActive ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold">{profile.name}</h3>
                        {profile.isActive && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Max Stake</span>
                          <span className="font-medium">${profile.maxStake}</span>
                        </div>
                        <div className="flex justify-between">

                          <span className="text-gray-500 dark:text-gray-400">Max Exposure</span>
                          <span className="font-medium">${profile.maxExposure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Stop Loss</span>
                          <span className="font-medium">-${profile.stopLoss}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Take Profit</span>
                          <span className="font-medium">+${profile.takeProfit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Kelly Fraction</span>
                          <span className="font-medium">{profile.kellyFraction}x</span>
                        </div>
                      </div>
                      {!profile.isActive && <button className="modern-button mt-4">Set Active</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Active Bets */}
            <div>
              <h2 className="text-lg font-bold mb-4">Active Bets</h2>
              {activeBets.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  No active bets.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="modern-table w-full">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Stake</th>
                        <th>Odds</th>
                        <th>Potential Win</th>
                        <th>Risk</th>
                        <th>Expires At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBets.map((bet) => (
                        <tr key={bet.id}>
                          <td>{bet.event}</td>
                          <td>${bet.stake}</td>
                          <td>{bet.odds}</td>
                          <td>${bet.potentialWin}</td>
                          <td className={getRiskColor(bet.risk)}>{bet.risk}</td>
                          <td>{new Date(bet.expiresAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {/* Modal for creating a new profile (scaffold) */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Profile</h2>
              {/* TODO: Implement form fields and validation */}
              <button className="modern-button mt-4" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default RiskManagerPage;
