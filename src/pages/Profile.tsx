import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';

const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 890',
  location: 'New York, USA',
  avatar: 'JD',
  joinDate: 'January 2024',
  stats: {
    totalPredictions: 1234,
    successRate: 78.5,
    winStreak: 5,
    totalWinnings: 5678.9,
  },
  favoriteSports: ['Football', 'Basketball', 'Tennis'],
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [editedData, setEditedData] = useState(mockUserData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
  };

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success',
    });
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <GlassCard className="flex flex-col items-center p-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-4xl font-bold text-white mb-4">
          {userData.avatar}
        </div>
        <div className="text-2xl font-bold mb-2">{userData.name}</div>
        <div className="text-gray-500 mb-2">{userData.email}</div>
        <div className="text-gray-400 mb-2">{userData.location}</div>
        <div className="text-xs text-gray-400 mb-4">Joined {userData.joinDate}</div>
        <div className="flex gap-4 mb-4">
          {userData.favoriteSports.map((sport, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{sport}</span>
          ))}
        </div>
        <div className="flex gap-4 mb-4">
          <GlowButton onClick={handleEdit} className="bg-primary-500">Edit Profile</GlowButton>
        </div>
      </GlassCard>
      <GlassCard className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Tooltip content="Total number of predictions you've made.">
              <div className="text-xs text-gray-400">Total Predictions</div>
            </Tooltip>
            <div className="text-2xl font-bold text-primary-600">{userData.stats.totalPredictions}</div>
          </div>
          <div>
            <Tooltip content="Your overall success rate.">
              <div className="text-xs text-gray-400">Success Rate</div>
            </Tooltip>
            <div className="text-2xl font-bold text-green-600">{userData.stats.successRate}%</div>
          </div>
          <div>
            <Tooltip content="Your current win streak.">
              <div className="text-xs text-gray-400">Win Streak</div>
            </Tooltip>
            <div className="text-2xl font-bold text-yellow-600">{userData.stats.winStreak}</div>
          </div>
          <div>
            <Tooltip content="Total winnings from all bets.">
              <div className="text-xs text-gray-400">Total Winnings</div>
            </Tooltip>
            <div className="text-2xl font-bold text-purple-600">${userData.stats.totalWinnings.toLocaleString()}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Profile;
