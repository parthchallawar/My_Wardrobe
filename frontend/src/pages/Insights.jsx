import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  BarChart3,
  TrendingUp,
  Shirt,
  Palette,
  Heart,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { aiAPI, itemsAPI, wearLogAPI, getThumbUrl } from '@/services/api';

const COLORS = ['#39FF14', '#5CFF3D', '#2EE012', '#00FF66', '#1a1a1a'];

const Insights = () => {
  const { data: insightsData, isLoading: insightsLoading } = useQuery(
    'style-insights',
    () => aiAPI.getStyleInsights(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const { data: statsData } = useQuery(
    'wardrobe-stats',
    () => itemsAPI.getStatistics(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const { data: rotationData } = useQuery(
    'wearlog-rotation',
    () => wearLogAPI.getRotation({ limit: 8 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const insights = insightsData?.data?.insights;
  const stats = statsData?.data;
  const neglected = rotationData?.data?.items || [];

  if (insightsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(insights?.distribution?.byCategory || {}).map(
    ([name, value]) => ({ name, value })
  );

  const colorData = Object.entries(insights?.distribution?.byColor || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/5">
          <BarChart3 className="w-6 h-6 text-neon-green" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Style Insights</h1>
          <p className="text-gray-400">Learn about your wardrobe patterns</p>
        </div>
      </motion.div>

      {!insights ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
          <p className="text-gray-400">Add items to your wardrobe to get personalized insights</p>
        </motion.div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                  <Shirt className="w-6 h-6 text-neon-green" />
                </div>
                <TrendingUp className="w-5 h-5 text-neon-green" />
              </div>
              <h3 className="text-3xl font-bold text-white">{insights.wardrobe?.totalItems || 0}</h3>
              <p className="text-sm text-gray-400">Total Items</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <ArrowUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">{insights.wardrobe?.totalWears || 0}</h3>
              <p className="text-sm text-gray-400">Total Wears</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">
                {insights.wardrobe?.averageWears || 0}
              </h3>
              <p className="text-sm text-gray-400">Avg Wears/Item</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{stats?.summary?.favorites || 0}</h3>
              <p className="text-sm text-gray-400">Favorites</p>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Wardrobe by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ca3af' }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#374151' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#39FF14" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Color Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Color Palette</h2>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={colorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {colorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#1a1a1a"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Style Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Style Preferences</h2>
            <div className="space-y-4">
              {Object.entries(insights.distribution?.byStyle || {}).map(([style, count], index) => (
                <div key={style} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{style}</span>
                    <span className="text-neon-green font-semibold">{count} items</span>
                  </div>
                  <div className="h-2 rounded-full bg-black-600 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / insights.wardrobe.totalItems) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-neon-green to-neon-greenLight"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Suggestions */}
          {insights.suggestions?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 border-l-4 border-l-neon-green"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-green/20 flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">AI Recommendations</h2>
                  <ul className="space-y-3">
                    {insights.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-neon-green mt-1">💡</span>
                        <p className="text-gray-300">{suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Usage Analysis */}
          {(insights.usage?.mostWorn?.length > 0 || insights.usage?.leastWorn?.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  Most Worn Items
                </h2>
                <div className="space-y-3">
                  {insights.usage.mostWorn.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-black-600"
                    >
                      <div className="w-12 h-12 rounded-lg bg-black-700 overflow-hidden">
                        {getThumbUrl(item) ? (
                          <img
                            src={getThumbUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neon-green">{item.wearCount}</p>
                        <p className="text-xs text-gray-400">wears</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 text-yellow-500" />
                  Least Worn Items
                </h2>
                <div className="space-y-3">
                  {insights.usage.leastWorn.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-black-600"
                    >
                      <div className="w-12 h-12 rounded-lg bg-black-700 overflow-hidden">
                        {getThumbUrl(item) ? (
                          <img
                            src={getThumbUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-500">{item.wearCount}</p>
                        <p className="text-xs text-gray-400">wears</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Neglected / Rotation Section */}
          {neglected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 border border-yellow-600/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-yellow-500/10">
                  <RefreshCcw className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Time to Rotate</h2>
                  <p className="text-sm text-gray-500">Items you haven't worn recently — give them some love</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {neglected.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 bg-black-700/50 rounded-xl border border-gray-700 hover:border-yellow-600/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black-800">
                      {getThumbUrl(item) ? (
                        <img
                          src={getThumbUrl(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <p className="text-xs text-yellow-500">
                        {item.daysSinceWorn !== null ? `${item.daysSinceWorn}d ago` : 'Never worn'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;
