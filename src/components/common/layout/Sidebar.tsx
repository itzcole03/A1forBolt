import React, { useState } from 'react';
import { Home, Settings, DollarSign, Menu, Moon, Sun, BarChart2, PieChart, TrendingUp, Zap, Layers, History, LineChart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../providers/ThemeProvider'; // Assuming ThemeProvider is in src/providers


const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Player Props', path: '/player-props', icon: PieChart },
  { name: 'AI Predictions', path: '/ai-predictions', icon: BarChart2 },
  { name: 'Win Probabilities', path: '/win-probabilities', icon: TrendingUp },
  { name: 'Arbitrage', path: '/arbitrage', icon: Zap },
  { name: 'Smart Lineups', path: '/smart-lineups', icon: Layers },
  { name: 'Betting History', path: '/betting-history', icon: History },
  { name: 'ML Analytics', path: '/ml-analytics', icon: LineChart },
  { name: 'Bankroll', path: '/bankroll', icon: DollarSign },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4 space-y-6 glass bg-gradient-to-br from-[#23235b]/80 to-[#1a1a2e]/90 text-text shadow-2xl border-r border-white/10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">AI</div>
        <div>
          <div className="text-xl font-extrabold text-white tracking-tight">Sports Analytics</div>
          <div className="text-xs text-primary-200 font-medium opacity-80">AI-Powered Platform</div>
        </div>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-base hover:bg-primary-600/20 hover:text-primary-400 modern-card shadow-sm ${isActive ? 'bg-primary-600/30 text-primary-200' : 'text-white/90'}`
                }
              >
                <item.icon className="w-5 h-5 opacity-80" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto space-y-4">
        <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 font-semibold text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>Live Connected</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-primary-700/20 hover:bg-primary-700/40 transition-colors space-x-2 text-primary-200 font-semibold shadow-md"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
        <div className="flex items-center justify-center text-xs text-primary-300/80 mt-2">ML Analytics</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Burger Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleMobileMenu} className="p-2 rounded-md bg-surface/80 text-text glass">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed inset-0 z-40 flex"
          >
            <div className="w-64 h-full">
              <SidebarContent />
            </div>
            <div onClick={closeMobileMenu} className="flex-1 bg-black/50 backdrop-blur-sm"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 