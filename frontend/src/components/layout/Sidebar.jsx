import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Shirt,
  Sparkles,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { path: '/outfits', label: 'Outfits', icon: Sparkles },
  { path: '/shop-match', label: 'Shop Match', icon: ShoppingCart },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const sidebarVariants = {
  open: { width: 256 },
  closed: { width: 80 },
};

const itemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full glass border-r border-gray-700/50 z-50 overflow-hidden"
    >
      {/* Logo section */}
      <motion.div
        className="h-20 flex items-center px-6 border-b border-gray-700/50"
        animate={isOpen ? 'open' : 'closed'}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-6 h-6 text-black-800" />
        </motion.div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="ml-3"
            >
              <h1 className="text-lg font-display font-bold text-neon-green">StyleAI</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>


      {/* Navigation items */}
      <nav className="p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-neon-green/20 to-transparent border-l-2 border-neon-green'
                  : 'hover:bg-black-700/50 border-l-2 border-transparent hover:border-gray-600'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-neon-green' : 'text-gray-400'
                }`}
              />

              <AnimatePresence>
                {isOpen && (
                  <>
                    <motion.span
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className={`ml-3 font-medium ${
                        isActive ? 'text-neon-green' : 'text-gray-300'
                      }`}
                    >
                      {item.label}
                    </motion.span>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-neon-green shadow-neon"
                      />
                    )}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="absolute bottom-6 right-4 w-8 h-8 rounded-lg bg-black-700 border border-gray-600 hover:border-neon-green flex items-center justify-center transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="left"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-4 h-4 text-neon-green" />
            </motion.div>
          ) : (
            <motion.div
              key="right"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-neon-green" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Neon line decoration */}
      <motion.div
        animate={isOpen ? { width: '100%' } : { width: '0%' }}
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neon-green to-neon-greenLight"
      />
    </motion.aside>
  );
};

export default Sidebar;
