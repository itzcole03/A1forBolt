
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RiskProfile {
  id: string;
  name: string;
  maxStake: number;
  maxExposure: number;
  stopLoss: number;
  takeProfit: number;
  kellyFraction: number;
  isActive: boolean;
}

interface ActiveBet {
  id: string;
  event: string;
  stake: number;
  odds: number;
  potentialWin: number;
  risk: 'low' | 'medium' | 'high';
  expiresAt: string;
}


const RiskManagerPage: React.FC = () => {

  // State for risk profiles and active bets
  const [profiles, setProfiles] = useState<RiskProfile[]>([]);
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for creating new profile
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch risk profiles and active bets on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profilesRes, betsRes] = await Promise.all([
          axios.get<RiskProfile[]>('/api/risk-profiles'),
          axios.get<ActiveBet[]>('/api/active-bets'),
        ]);
        setProfiles(profilesRes.data);
        setActiveBets(betsRes.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to load data');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeProfile = profiles.find(p => p.isActive);
  const totalExposure = activeBets.reduce((sum, bet) => sum + bet.stake, 0);
  const maxPotentialLoss = totalExposure;
  const maxPotentialWin = activeBets.reduce((sum, bet) => sum + bet.potentialWin, 0);

  const getRiskColor = (risk: ActiveBet['risk']) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };


  return (
    <>
      <main className="section space-y-6 lg:space-y-8 animate-fade-in">
        <div className="modern-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold">⚖️ Risk Manager</h1>
            <button className="modern-button" onClick={() => setIsModalOpen(true)}>
              Create New Profile
            </button>
          </div>
          {/* Loading/Error State */}
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
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
                    {profiles.map(profile => (
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
                        {activeBets.map(bet => (
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
        </div>
        {/* Modal for creating new profile */}
        {isModalOpen && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2 className="text-lg font-bold mb-4">Create New Profile</h2>
              <CreateProfileForm
                onSuccess={(profile) => {
                  setProfiles((prev) => [...prev, profile]);
                  setIsModalOpen(false);
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/**
 * Props for CreateProfileForm modal component.
 */
type CreateProfileFormProps = {
  onSuccess: (profile: RiskProfile) => void;
  onCancel: () => void;
};

/**
 * Modal form for creating a new risk profile.
 * Integrates with /api/risk-profiles endpoint.
 */
const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [form, setForm] = React.useState<Omit<RiskProfile, 'id' | 'isActive'>>({
    name: '',
    maxStake: 0,
    maxExposure: 0,
    stopLoss: 0,
    takeProfit: 0,
    kellyFraction: 1,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post<RiskProfile>('/api/risk-profiles', form);
      onSuccess(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError && axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Failed to create profile');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="modern-input w-full" required placeholder="Profile Name" title="Profile Name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Max Stake</label>
          <input name="maxStake" type="number" value={form.maxStake} onChange={handleChange} className="modern-input w-full" min={0} required placeholder="Max Stake" title="Max Stake" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Exposure</label>
          <input name="maxExposure" type="number" value={form.maxExposure} onChange={handleChange} className="modern-input w-full" min={0} required placeholder="Max Exposure" title="Max Exposure" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stop Loss</label>
          <input name="stopLoss" type="number" value={form.stopLoss} onChange={handleChange} className="modern-input w-full" min={0} required placeholder="Stop Loss" title="Stop Loss" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Take Profit</label>
          <input name="takeProfit" type="number" value={form.takeProfit} onChange={handleChange} className="modern-input w-full" min={0} required placeholder="Take Profit" title="Take Profit" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kelly Fraction</label>
          <input name="kellyFraction" type="number" value={form.kellyFraction} onChange={handleChange} className="modern-input w-full" min={0.01} step={0.01} required placeholder="Kelly Fraction" title="Kelly Fraction" />
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-4">
        <button type="submit" className="modern-button" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create'}
        </button>
        <button type="button" className="modern-button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
};


export default RiskManagerPage;
