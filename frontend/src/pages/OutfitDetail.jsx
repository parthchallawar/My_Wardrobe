import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Trash2,
  CheckCircle,
  Flame,
  Star,
  Sparkles,
  Shirt,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { outfitsAPI, getThumbUrl } from '@/services/api';
import toast from 'react-hot-toast';

const conditionVisual = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return { Icon: Zap, tint: 'text-yellow-300' };
  if (c.includes('snow')) return { Icon: CloudSnow, tint: 'text-blue-200' };
  if (c.includes('rain') || c.includes('drizzle')) return { Icon: CloudRain, tint: 'text-blue-300' };
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return { Icon: CloudFog, tint: 'text-gray-300' };
  if (c.includes('cloud')) return { Icon: Cloud, tint: 'text-gray-300' };
  return { Icon: Sun, tint: 'text-yellow-400' };
};

const ScoreBar = ({ label, value, accent = 'bg-neon-green' }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-gray-200">{value || 0}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-black-600 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value || 0}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full ${accent}`}
      />
    </div>
  </div>
);

const OutfitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['outfit', id], () => outfitsAPI.getById(id), {
    enabled: !!id,
  });

  const outfit = data?.data?.outfit;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Outfit not found</h2>
        <button onClick={() => navigate('/outfits')} className="btn-secondary mt-4">Back to Outfits</button>
      </div>
    );
  }

  const score = outfit.aiScore || {};
  const items = outfit.items || [];
  const w = outfit.weather;
  const hasWeather = w && (w.tempC != null || w.condition);
  const wv = conditionVisual(w?.condition);

  const toggleFavorite = () => {
    outfitsAPI.toggleFavorite(outfit._id).then(() => {
      queryClient.invalidateQueries(['outfit', id]);
      queryClient.invalidateQueries('outfits');
    });
  };

  const markWorn = () => {
    outfitsAPI.recordWear(outfit._id).then(() => {
      toast.success('Logged as worn today');
      queryClient.invalidateQueries(['outfit', id]);
    });
  };

  const remove = () => {
    if (!window.confirm('Delete this outfit?')) return;
    outfitsAPI.delete(outfit._id).then(() => {
      toast.success('Outfit deleted');
      queryClient.invalidateQueries('outfits');
      navigate('/outfits');
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + actions */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/outfits')}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Outfits
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-lg border transition-colors ${
              outfit.isFavorite
                ? 'bg-red-500/15 border-red-500/40 text-red-500'
                : 'bg-black-700 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${outfit.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={markWorn} className="btn-secondary flex items-center gap-2 py-2.5">
            <CheckCircle className="w-4 h-4" /> Mark Worn
          </button>
          <button
            onClick={remove}
            className="p-2.5 rounded-lg bg-black-700 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {score.trendScore >= 70 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500 text-black-900 text-[10px] font-extrabold uppercase tracking-wider">
              <Flame className="w-3 h-3" /> Trending
            </span>
          )}
          {score.bestScore >= 70 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400 text-black-900 text-[10px] font-extrabold uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" /> Top Pick
            </span>
          )}
        </div>
        <h1 className="text-4xl font-display font-bold text-white leading-none">{outfit.name}</h1>
        <p className="text-gray-500 mt-2 capitalize">
          {outfit.style} · {outfit.season} · {outfit.occasion} · {items.length} pieces
        </p>
      </motion.div>

      {/* Match + weather + scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Match score */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a1a" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none" stroke="#39FF14" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - (score.overallMatch || 0) / 100) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="block text-2xl font-bold text-neon-green">{score.overallMatch || 0}</span>
              <span className="block text-[9px] text-gray-500 uppercase tracking-wider">match</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">Overall compatibility</p>
        </motion.div>

        {/* Weather / conditions */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="card p-6 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Conditions</p>
          {hasWeather ? (
            <div className="flex items-center gap-3">
              <wv.Icon className={`w-10 h-10 ${wv.tint}`} />
              <div>
                {w.tempC != null && <p className="text-2xl font-bold text-white leading-none">{w.tempC}°C</p>}
                <p className="text-sm text-gray-400 capitalize">{w.condition || outfit.season}</p>
                {w.city && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {w.city}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Sun className="w-10 h-10 text-yellow-400/70" />
              <div>
                <p className="text-lg font-semibold text-white capitalize">{outfit.season}</p>
                <p className="text-sm text-gray-400 capitalize flex items-center gap-1">
                  {outfit.timeOfDay === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {outfit.timeOfDay} wear
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Score breakdown */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card p-6 space-y-2.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Why it works</p>
          <ScoreBar label="Color harmony" value={score.colorHarmony} />
          <ScoreBar label="Style consistency" value={score.styleConsistency} />
          <ScoreBar label="Seasonality" value={score.seasonality} />
          <ScoreBar label="Trend" value={score.trendScore} accent="bg-orange-400" />
        </motion.div>
      </div>

      {/* Trend reasons */}
      {outfit.trendReasons?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Style notes</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {outfit.trendReasons.map((r, i) => (
              <span key={i} className="text-xs text-orange-200/90 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
                {r}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pieces */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white mb-4">The pieces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((entry, i) => {
            const item = entry.item;
            if (!item) return null;
            return (
              <motion.div
                key={item._id || i}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/wardrobe/${item._id}`)}
                className="group relative rounded-xl overflow-hidden glass border border-gray-700 hover:border-neon-green/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-black-800 overflow-hidden">
                  {getThumbUrl(item) ? (
                    <img src={getThumbUrl(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Shirt className="w-10 h-10 text-gray-600" /></div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black-900 to-transparent pointer-events-none" />
                  {entry.type && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-bold text-neon-green bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-neon-green/30">
                      {entry.type}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-neon-green transition-colors">{item.name}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-neon-green group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">{item.category}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default OutfitDetail;
