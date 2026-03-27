import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, ShoppingCart, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/services/api';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, token, logout } = useStore();

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
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-black-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-neon-green" />
          </motion.button>

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black-800" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-green via-neon-greenLight to-neon-green">
                StyleAI
              </h1>
              <p className="text-xs text-gray-400">Wardrobe Assistant</p>
            </div>
          </motion.div>
        </div>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { path: '/wardrobe', label: 'Wardrobe', icon: null },
            { path: '/outfits', label: 'Outfits', icon: null },
            { path: '/shop-match', label: 'Shop Match', icon: ShoppingCart },
            { path: '/insights', label: 'Insights', icon: null },
          ].map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-neon-green hover:bg-black-700/50 transition-all"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </motion.button>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-black-700/50 border border-gray-700 hover:border-neon-green/50 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center">
              <User className="w-5 h-5 text-black-800" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-200">{user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.subscription?.plan || 'Free'}</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-black-700 transition-colors text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
