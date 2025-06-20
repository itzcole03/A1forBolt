import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <GlassCard className="max-w-lg w-full text-center p-10">
          <h1 className="text-6xl font-extrabold text-blue-700 dark:text-blue-200 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <GlowButton onClick={() => navigate('/')}>Go to Home</GlowButton>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default NotFound;
