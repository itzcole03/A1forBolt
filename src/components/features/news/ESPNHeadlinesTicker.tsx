import React, { useEffect } from 'react';
import { Newspaper, Loader, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';


const ESPNHeadlinesTicker: React.FC = () => {
  const {
    headlines,
    isLoadingHeadlines,
    error,
    fetchHeadlines,
  } = useAppStore((state) => ({
    headlines: state.headlines,
    isLoadingHeadlines: state.isLoadingHeadlines,
    error: state.error, // Assuming a general error field for headline fetching
    fetchHeadlines: state.fetchHeadlines,
  }));

  const [currentHeadlineIndex, setCurrentHeadlineIndex] = React.useState(0);

  useEffect(() => {
    fetchHeadlines();
  }, [fetchHeadlines]);

  useEffect(() => {
    if (!Array.isArray(headlines) || headlines.length === 0) return;

    const timer = setInterval(() => {
      setCurrentHeadlineIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 7000); // Change headline every 7 seconds
    return () => clearInterval(timer);
  }, [headlines]);

  return (
    <div className="p-6 glass rounded-2xl shadow-xl bg-gradient-to-r from-blue-900/70 to-blue-700/60 overflow-hidden h-full flex flex-col animate-fade-in">
      <h3 className="text-xl font-bold text-blue-100 mb-3 flex items-center drop-shadow-lg">
        <Newspaper className="w-7 h-7 mr-2 text-yellow-400 animate-pulse-soft" />
        Live ESPN Headlines
      </h3>
      {isLoadingHeadlines && (
        <div className="flex-grow flex flex-col justify-center items-center">
          <Loader className="w-8 h-8 animate-spin text-yellow-400 mb-2" />
          <p className="text-blue-200">Loading Headlines...</p>
        </div>
      )}
      {!isLoadingHeadlines && error && (
        <div className="flex-grow flex flex-col justify-center items-center text-red-400 bg-red-500/10 p-3 rounded-lg">
          <AlertTriangle className="w-8 h-8 mb-2" />
          Error: {error}
        </div>
      )}
      {!isLoadingHeadlines && !error && (!Array.isArray(headlines) || headlines.length === 0) && (
        <div className="flex-grow flex flex-col justify-center items-center text-blue-200">
          No headlines available at the moment.
        </div>
      )}
      {!isLoadingHeadlines && !error && Array.isArray(headlines) && headlines.length > 0 && (
        <div className="flex-grow flex items-center justify-center text-center overflow-x-hidden">
          <AnimatePresence mode='wait'>
            <motion.a
              key={headlines[currentHeadlineIndex]?.id}
              href={headlines[currentHeadlineIndex]?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-yellow-200 hover:text-yellow-400 transition-colors duration-300 block py-2 whitespace-nowrap animate-marquee"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {headlines[currentHeadlineIndex]?.title}
            </motion.a>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ESPNHeadlinesTicker; 