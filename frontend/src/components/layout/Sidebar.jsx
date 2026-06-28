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
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { path: '/outfits', label: 'Outfits', icon: Sparkles },
  { path: '/shop-match', label: 'Shop Match', icon: ShoppingCart },
  { path: '/calendar', label: 'Wear Calendar', icon: CalendarDays },
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
  const { user } = useStore();

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full glass border-r border-gray-700/50 z-50 overflow-hidden flex flex-col"
    >
      {/* Logo section */}
      <div className="h-20 flex items-center px-5 border-b border-gray-700/50 flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center flex-shrink-0 shadow-neon-sm"
        >
          <Sparkles className="w-5 h-5 text-black-800" />
        </motion.div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="ml-3"
            >
              <h1 className="text-base font-display font-bold text-neon-green leading-none">StyleAI</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] mt-0.5">Wardrobe</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation items */}
      <nav className="p-3 space-y-0.5 mt-2 flex-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-neon-green/12 border border-neon-green/25'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive ? 'bg-neon-green/20' : ''
              }`}>
                <Icon
                  style={{ width: 16, height: 16 }}
                  className={isActive ? 'text-neon-green' : 'text-gray-500'}
                />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <>
                    <motion.span
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className={`text-sm font-medium whitespace-nowrap ${
                        isActive ? 'text-neon-green' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </motion.span>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green"
                        style={{ boxShadow: '0 0 6px #39FF14' }}
                      />
                    )}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* User section + toggle */}
      <div className="p-3 border-t border-gray-800 flex-shrink-0 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center flex-shrink-0">
            <User style={{ width: 14, height: 14 }} className="text-black-800" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="min-w-0"
              >
                <p className="text-sm font-medium text-gray-200 truncate leading-none">{user?.username || 'User'}</p>
                <p className="text-[9px] text-neon-green/60 uppercase tracking-[0.12em] mt-0.5">{user?.subscription?.plan || 'Free'} Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggle}
          className="w-full h-7 rounded-lg bg-black-700/80 border border-gray-800 hover:border-gray-600 flex items-center justify-center transition-all"
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
                <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
              </motion.div>
            ) : (
              <motion.div
                key="right"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
