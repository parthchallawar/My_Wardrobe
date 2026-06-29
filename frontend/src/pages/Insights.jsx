import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  BarChart3,
  TrendingUp,
  Shirt,
  Palette,
  Heart,
  Repeat,
  Award,
  Layers,
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
  Cell,
} from 'recharts';
import { aiAPI, itemsAPI, wearLogAPI, getThumbUrl } from '@/services/api';

// Map colour names (incl. multi-word like "khaki brown") to a representative hex swatch
const COLOR_HEX = {
  black: '#1a1a1a', white: '#f5f5f5', 'off-white': '#F0EDE8', gray: '#9ca3af', grey: '#9ca3af',
  charcoal: '#36454F', slate: '#64748b', silver: '#c0c0c0', stone: '#a8a29e',
  navy: '#1e293b', blue: '#3b82f6', denim: '#3b5b7a', teal: '#14b8a6', turquoise: '#40e0d0',
  red: '#ef4444', maroon: '#7f1d1d', burgundy: '#800020', rust: '#8B3A10',
  green: '#22c55e', forest: '#1B5E40', olive: '#808000', emerald: '#10b981',
  yellow: '#eab308', gold: '#d4af37', mustard: '#d4a017', orange: '#f97316',
  brown: '#92400e', khaki: '#8B7355', beige: '#e8dcc4', cream: '#F5EDD5', tan: '#d2b48c',
  pink: '#ec4899', purple: '#a855f7', violet: '#8b5cf6', lavender: '#c4b5fd',
  multicolor: '#888', multi: '#888',
};
const colorToHex = (name) => {
  if (!name) return '#666';
  const n = String(name).toLowerCase().trim();
  if (COLOR_HEX[n]) return COLOR_HEX[n];
  const words = n.split(/\s+/);
  for (const w of [...words].reverse()) if (COLOR_HEX[w]) return COLOR_HEX[w];
  return '#666';
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

// Compact stat tile
const Kpi = ({ icon: Icon, label, value, sub, accent = 'neon', delay = 0 }) => {
  const tints = {
    neon: 'from-neon-green/20 to-neon-green/5 text-neon-green',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    red: 'from-red-500/20 to-red-500/5 text-red-400',
  };
  return (
    <motion.div {...fade(delay)} className="card p-5 relative overflow-hidden">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tints[accent]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
    </motion.div>
  );
};

const Insights = () => {
  const { data: insightsData, isLoading } = useQuery(
    'style-insights',
    () => aiAPI.getStyleInsights(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );
  const { data: statsData } = useQuery('wardrobe-stats', () => itemsAPI.getStatistics(), {
    enabled: !!localStorage.getItem('wardrobe-ai-storage'),
  });
  const { data: itemsData } = useQuery('wardrobe-items', () => itemsAPI.getAll(), {
    enabled: !!localStorage.getItem('wardrobe-ai-storage'),
  });
  const { data: rotationData } = useQuery('wearlog-rotation', () => wearLogAPI.getRotation({ limit: 8 }), {
    staleTime: 5 * 60 * 1000,
  });

  const insights = insightsData?.data?.insights;
  const stats = statsData?.data;
  const items = itemsData?.data?.items || [];
  const neglected = rotationData?.data?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  // ---- Derived insights ----
  const totalItems = insights?.wardrobe?.totalItems || items.length || 0;
  const unworn = items.filter((i) => (i.wearCount || 0) === 0).length;
  const inRotation = totalItems - unworn;
  const rotationPct = totalItems ? Math.round((inRotation / totalItems) * 100) : 0;
  const favorites = stats?.summary?.favorites ?? items.filter((i) => i.isFavorite).length;

  const categoryData = Object.entries(insights?.distribution?.byCategory || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const colorData = Object.entries(insights?.distribution?.byColor || {})
    .map(([name, value]) => ({ name, value, hex: colorToHex(name) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const colorMax = Math.max(1, ...colorData.map((c) => c.value));

  const styleData = Object.entries(insights?.distribution?.byStyle || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topStyle = styleData[0]?.name;
  const topColor = colorData[0]?.name;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div
        {...fade(0)}
        className="relative overflow-hidden rounded-2xl border border-neon-green/20 bg-gradient-to-br from-black-700 via-black-800 to-black-900 p-6 sm:p-8"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-neon-green/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-neon-green/15">
            <BarChart3 className="w-7 h-7 text-neon-green" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Style Insights</h1>
            <p className="text-gray-400 mt-1">
              {topStyle ? (
                <>Your wardrobe leans <span className="text-neon-green capitalize font-medium">{topStyle}</span>
                  {topColor && <> with a <span className="text-neon-green capitalize font-medium">{topColor}</span> palette</>}.</>
              ) : 'Add items to unlock personalized insights.'}
            </p>
          </div>
        </div>
      </motion.div>

      {!insights && items.length === 0 ? (
        <motion.div {...fade(0.1)} className="card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
          <p className="text-gray-400">Add items to your wardrobe to get personalized insights</p>
        </motion.div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi icon={Shirt} label="Total Items" value={totalItems} accent="neon" delay={0.05}
              sub={`${categoryData.length} categories`} />
            <Kpi icon={Repeat} label="Total Wears" value={insights?.wardrobe?.totalWears || 0} accent="blue" delay={0.1}
              sub={`avg ${insights?.wardrobe?.averageWears || 0} per item`} />
            <Kpi icon={TrendingUp} label="In Rotation" value={`${rotationPct}%`} accent="purple" delay={0.15}
              sub={`${unworn} never worn`} />
            <Kpi icon={Heart} label="Favorites" value={favorites} accent="red" delay={0.2}
              sub={totalItems ? `${Math.round((favorites / totalItems) * 100)}% of wardrobe` : null} />
          </div>

          {/* Rotation health bar */}
          <motion.div {...fade(0.25)} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-neon-green" /> Rotation Health
              </h2>
              <span className="text-sm text-gray-400">{inRotation} of {totalItems} worn</span>
            </div>
            <div className="h-3 rounded-full bg-black-600 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rotationPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-neon-green to-neon-greenLight"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rotationPct >= 70
                ? 'Great rotation — most of your wardrobe gets worn.'
                : `${unworn} pieces are sitting unworn. Check the rotation suggestions below.`}
            </p>
          </motion.div>

          {/* Composition + Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category composition */}
            <motion.div {...fade(0.3)} className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Layers className="w-5 h-5 text-neon-green" /> Wardrobe Composition
              </h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(57,255,20,0.06)' }}
                      contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '10px' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#39FF14' : '#2a6b1a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 text-center py-12">No category data yet</p>
              )}
            </motion.div>

            {/* Colour palette */}
            <motion.div {...fade(0.35)} className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Palette className="w-5 h-5 text-neon-green" /> Your Color Palette
              </h2>
              {colorData.length > 0 ? (
                <div className="space-y-3">
                  {colorData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-md border border-gray-700 flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-sm text-gray-300 capitalize w-24 truncate">{c.name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-black-600 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.value / colorMax) * 100}%` }}
                          transition={{ delay: i * 0.05, duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">{c.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-12">No color data yet</p>
              )}
            </motion.div>
          </div>

          {/* Style DNA */}
          {styleData.length > 0 && (
            <motion.div {...fade(0.4)} className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-neon-green" /> Style DNA
              </h2>
              <div className="space-y-4">
                {styleData.map((s, i) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize flex items-center gap-2">
                        {i === 0 && <span className="text-[10px] bg-neon-green/15 text-neon-green px-2 py-0.5 rounded-full uppercase tracking-wide">Top</span>}
                        {s.name}
                      </span>
                      <span className="text-neon-green font-semibold text-sm">{s.value} items</span>
                    </div>
                    <div className="h-2 rounded-full bg-black-600 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.value / (totalItems || 1)) * 100}%` }}
                        transition={{ delay: i * 0.08, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-neon-green to-neon-greenLight"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Most / Least worn */}
          {(insights?.usage?.mostWorn?.length > 0 || insights?.usage?.leastWorn?.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fade(0.45)} className="card p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" /> Most Worn
                </h2>
                <div className="space-y-3">
                  {insights.usage.mostWorn.slice(0, 5).map((item, i) => (
                    <div key={item._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-black-600/60 hover:bg-black-600 transition-colors">
                      <span className="text-sm font-bold text-neon-green/60 w-4">{i + 1}</span>
                      <div className="w-11 h-11 rounded-lg bg-black-700 overflow-hidden flex-shrink-0">
                        {getThumbUrl(item) ? (
                          <img src={getThumbUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center"><Shirt className="w-5 h-5 text-gray-600" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neon-green leading-none">{item.wearCount}</p>
                        <p className="text-[10px] text-gray-500">wears</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fade(0.5)} className="card p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 text-yellow-500" /> Underused
                </h2>
                <div className="space-y-3">
                  {insights.usage.leastWorn.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-black-600/60 hover:bg-black-600 transition-colors">
                      <div className="w-11 h-11 rounded-lg bg-black-700 overflow-hidden flex-shrink-0">
                        {getThumbUrl(item) ? (
                          <img src={getThumbUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center"><Shirt className="w-5 h-5 text-gray-600" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-500 leading-none">{item.wearCount}</p>
                        <p className="text-[10px] text-gray-500">wears</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* AI recommendations */}
          {insights?.suggestions?.length > 0 && (
            <motion.div {...fade(0.55)} className="card p-6 border-l-4 border-l-neon-green">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-neon-green/15 flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-neon-green" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-3">Recommendations</h2>
                  <ul className="space-y-2.5">
                    {insights.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="text-neon-green mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Neglected rotation */}
          {neglected.length > 0 && (
            <motion.div {...fade(0.6)} className="card p-6 border border-yellow-600/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-yellow-500/10">
                  <RefreshCcw className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Time to Rotate</h2>
                  <p className="text-sm text-gray-500">Pieces you haven't worn recently — give them some love</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {neglected.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-black-700/50 rounded-xl border border-gray-800 hover:border-yellow-600/40 transition-colors">
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-black-800">
                      {getThumbUrl(item) ? (
                        <img src={getThumbUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center"><Shirt className="w-5 h-5 text-gray-600" /></div>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <p className="text-xs text-yellow-500">
                        {item.daysSinceWorn != null ? `${item.daysSinceWorn}d ago` : 'Never worn'}
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
