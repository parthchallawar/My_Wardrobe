import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Heart,
  Trash2,
  Wand2,
  Calendar,
  Sun,
  Moon,
  Flame,
  Star,
} from 'lucide-react';
import { outfitsAPI, getThumbUrl } from '@/services/api';
import toast from 'react-hot-toast';
import CreateOutfitModal from '@/components/CreateOutfitModal';

/**
 * Outfit preview — places each piece in an equal-width column side by side (top | bottom |
 * shoes), so the pairing reads at a glance and stays consistent regardless of item count.
 */
const OutfitStack = ({ imgs }) => {
  if (imgs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black-700 to-black-800">
        <Sparkles className="w-10 h-10 text-gray-700" />
      </div>
    );
  }
  const shown = imgs.slice(0, 3);
  return (
    <div className="flex h-full w-full gap-px bg-black-900">
      {shown.map((src, i) => (
        <div key={i} className="relative flex-1 min-w-0 overflow-hidden">
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {i === 2 && imgs.length > 3 && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
              +{imgs.length - 3}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Outfits = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('both');
  const { data, isLoading, refetch } = useQuery(
    'outfits',
    () => outfitsAPI.getAll(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const outfits = data?.data?.outfits || [];

  const handleGenerateOutfit = async () => {
    setIsGenerating(true);
    try {
      await outfitsAPI.generate({ limit: 12, timeOfDay: timeOfDay === 'both' ? undefined : timeOfDay });
      toast.success('New outfits generated!');
      refetch();
    } catch (error) {
      toast.error('Failed to generate outfits');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/5">
            <Sparkles className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Outfits</h1>
            <p className="text-gray-400">{outfits.length} saved outfits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Night toggle */}
          <div className="flex items-center rounded-lg border border-gray-700 overflow-hidden">
            {[
              { value: 'day', icon: Sun, label: 'Day' },
              { value: 'both', icon: null, label: 'All' },
              { value: 'night', icon: Moon, label: 'Night' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTimeOfDay(value)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                  timeOfDay === value
                    ? 'bg-neon-green/20 text-neon-green'
                    : 'text-gray-400 hover:text-white hover:bg-black-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateOutfit}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:border-neon-green hover:from-neon-green/20 hover:to-neon-green/5 transition-all"
          >
            <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Outfit
          </motion.button>
        </div>
      </motion.div>

      {/* Empty State */}
      {outfits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-neon-green" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Outfits Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Let our AI create perfect outfit combinations for you,
            or create your own by mixing and matching items from your wardrobe.
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateOutfit}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-green to-neon-greenLight text-black-800 font-semibold"
            >
              <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate with AI
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/wardrobe')}
              className="btn-secondary"
            >
              Browse Wardrobe
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Outfits Grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {outfits.map((outfit, index) => {
            const items = outfit.items || [];
            const imgs = items.map((it) => getThumbUrl(it.item)).filter(Boolean);
            const match = outfit.aiScore?.overallMatch || 0;
            const swatches = [outfit.colorScheme?.primary, outfit.colorScheme?.secondary, outfit.colorScheme?.accent].filter(Boolean);

            return (
              <motion.div
                key={outfit._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate(`/outfits/${outfit._id}`)}
                className="relative cursor-pointer group glass border border-gray-700 hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all duration-300 overflow-hidden rounded-2xl flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] bg-black-800 overflow-hidden">
                  <OutfitStack imgs={imgs} />

                  {/* Match % + trend/top stickers — all in one corner */}
                  <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                    <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-neon-green/30 shadow-lg">
                      <span className="text-[11px] font-bold text-neon-green">{match}% Match</span>
                    </div>
                    {outfit.aiScore?.trendScore >= 70 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500 text-black-900 text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                        <Flame className="w-3 h-3" /> Trending
                      </div>
                    )}
                    {outfit.aiScore?.bestScore >= 70 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400 text-black-900 text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                        <Star className="w-3 h-3 fill-current" /> Top Pick
                      </div>
                    )}
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        outfitsAPI.toggleFavorite(outfit._id).then(() => {
                          queryClient.invalidateQueries('outfits');
                        });
                      }}
                      className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-colors border ${
                        outfit.isFavorite
                          ? 'bg-red-500/20 border-red-500/50 text-red-500'
                          : 'bg-black/60 border-gray-600/50 text-gray-300 hover:text-white hover:border-gray-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${outfit.isFavorite ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this outfit?')) {
                          outfitsAPI.delete(outfit._id).then(() => {
                            toast.success('Outfit deleted');
                            queryClient.invalidateQueries('outfits');
                          });
                        }
                      }}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-gray-600/50 text-gray-300 hover:text-red-500 hover:border-red-500/50 shadow-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black-900 via-black-900/40 to-transparent pointer-events-none" />
                </div>

                {/* Info block */}
                <div className="p-5 relative z-10 flex flex-col flex-1 bg-black-800/90">
                  <h3 className="font-bold text-lg text-white group-hover:text-neon-green transition-colors line-clamp-1">
                    {outfit.name}
                  </h3>

                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 mb-3 font-semibold">
                    {outfit.style} {outfit.season ? `• ${outfit.season}` : ''}
                  </p>

                  {/* Color swatches */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {swatches.map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-gray-600/50 shadow-inner"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black-700/50 px-2 py-1 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                      <span>{items.length} Pieces</span>
                    </div>
                    {outfit.wornCount > 0 ? (
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide bg-black-700/50 px-2 py-1 rounded-md">
                        {outfit.wornCount}× Worn
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 italic">New</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      <CreateOutfitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Outfits;
