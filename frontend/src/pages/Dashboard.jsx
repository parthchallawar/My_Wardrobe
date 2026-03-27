import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  Shirt,
  Sparkles,
  TrendingUp,
  Heart,
  ArrowRight,
  Plus,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { itemsAPI, outfitsAPI, aiAPI } from '@/services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className={`card-glow p-6 rounded-xl relative overflow-hidden group ${
      color === 'neon' ? 'border-l-4 border-l-neon-green' : ''
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${
      color === 'neon' ? 'from-neon-green/10 to-transparent' : 'from-black-600 to-transparent'
    } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          color === 'neon'
            ? 'bg-neon-green/20'
            : 'bg-black-600'
        }`}>
          <Icon className={`w-6 h-6 ${
            color === 'neon' ? 'text-neon-green' : 'text-gray-400'
          }`} />
        </div>
        {trend && (
          <span className="flex items-center text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${
        color === 'neon' ? 'text-neon-green' : 'text-white'
      }`}>
        {value}
      </p>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.05, rotateZ: [0, -2, 2, 0] }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="card p-6 text-left group"
  >
    <div className={`p-3 rounded-lg mb-4 ${color} group-hover:shadow-neon-sm transition-all`}>
      <Icon className="w-6 h-6 text-neon-green" />
    </div>
    <h3 className="font-semibold text-gray-200 mb-1 group-hover:text-neon-green transition-colors">
      {label}
    </h3>
    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-neon-green group-hover:translate-x-2 transition-all" />
  </motion.button>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery(
    'wardrobe-stats',
    () => itemsAPI.getStatistics(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const { data: insights, isLoading: insightsLoading } = useQuery(
    'style-insights',
    () => aiAPI.getStyleInsights(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const wardrobeStats = stats?.data?.summary || { totalItems: 0, totalWears: 0, favorites: 0 };
  const styleInsights = insights?.data?.insights;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-400">Your AI-powered wardrobe assistant</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/shop-match')}
          className="btn-primary flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Shop Match
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={wardrobeStats.totalItems}
          icon={Shirt}
          color="neon"
          trend="+3 this week"
        />
        <StatCard
          title="Outfits Created"
          value={wardrobeStats.totalWears}
          icon={Sparkles}
          color="gray"
        />
        <StatCard
          title="Favorites"
          value={wardrobeStats.favorites}
          icon={Heart}
          color="gray"
        />
        <StatCard
          title="Match Rate"
          value="87%"
          icon={TrendingUp}
          color="gray"
          trend="+5%"
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={Plus}
            label="Add New Item"
            onClick={() => navigate('/wardrobe')}
            color="bg-neon-green/20"
          />
          <QuickAction
            icon={Sparkles}
            label="Generate Outfit"
            onClick={() => navigate('/outfits')}
            color="bg-purple-500/20"
          />
          <QuickAction
            icon={RefreshCw}
            label="Refresh Insights"
            onClick={() => navigate('/insights')}
            color="bg-blue-500/20"
          />
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Today's Outfit Suggestion</h2>

        {wardrobeStats.totalItems === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No items yet</h3>
            <p className="text-gray-500 mb-6">Start by adding items to your wardrobe</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wardrobe')}
              className="btn-primary"
            >
              Add Your First Item
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black-600 border border-neon-green/30">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-neon-green animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">AI Generated Outfit</h3>
              <p className="text-sm text-gray-400">Based on your style preferences</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/outfits')}
              className="btn-secondary"
            >
              View
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Style Insights Preview */}
      {styleInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Style Insights</h2>
            <button
              onClick={() => navigate('/insights')}
              className="text-neon-green hover:text-neon-greenLight transition-colors text-sm"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black-600">
              <p className="text-sm text-gray-400 mb-2">Dominant Style</p>
              <p className="text-lg font-semibold text-neon-green capitalize">
                {Object.entries(styleInsights.distribution.byStyle)[0]?.[0] || 'Casual'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black-600">
              <p className="text-sm text-gray-400 mb-2">Most Worn Color</p>
              <p className="text-lg font-semibold text-neon-green capitalize">
                {Object.entries(styleInsights.distribution.byColor)[0]?.[0] || 'Black'}
              </p>
            </div>
          </div>

          {styleInsights.suggestions?.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
              <p className="text-sm text-gray-300">
                💡 {styleInsights.suggestions[0]}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
