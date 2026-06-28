import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/wardrobe': 'My Wardrobe',
  '/outfits': 'Outfits',
  '/shop-match': 'Shop Match',
  '/calendar': 'Wear Calendar',
  '/insights': 'Insights',
  '/settings': 'Settings',
};

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useStore();
  const pageTitle = PAGE_TITLES[location.pathname] || 'StyleAI';

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass sticky top-0 z-40 border-b border-gray-700/50 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-black-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </motion.button>

          <div className="h-5 w-px bg-gray-700/50" />

          <h2 className="text-base font-semibold text-gray-200">{pageTitle}</h2>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black-700/50 border border-gray-700/50 hover:border-neon-green/30 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black-800" />
            </div>
            <span className="text-sm font-display font-bold text-neon-green">StyleAI</span>
          </motion.button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black-700/50 border border-gray-700/50">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-black-800" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-300">{user?.username}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-500 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
