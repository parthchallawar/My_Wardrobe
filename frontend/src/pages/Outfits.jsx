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
} from 'lucide-react';
import { outfitsAPI, getThumbUrl } from '@/services/api';
import toast from 'react-hot-toast';
import CreateOutfitModal from '@/components/CreateOutfitModal';

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
      await outfitsAPI.generate({ limit: 5, timeOfDay: timeOfDay === 'both' ? undefined : timeOfDay });
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {outfits.map((outfit, index) => (
            <motion.div
              key={outfit._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="card cursor-pointer group"
            >
              {/* Outfit Preview */}
              <div className="relative aspect-[4/3] rounded-lg bg-black-600 overflow-hidden mb-4">
                {outfit.items?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-2 h-full">
                    {outfit.items.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="relative rounded-lg bg-black-700 overflow-hidden"
                      >
                        {getThumbUrl(item.item) ? (
                          <img
                            src={getThumbUrl(item.item)}
                            alt={item.item?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">👔</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-600" />
                  </div>
                )}

                {/* Favorite Badge */}
                {outfit.isFavorite && (
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/80">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

                {/* AI Score Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neon-green/90 text-black-800 text-xs font-bold">
                  {outfit.aiScore?.overallMatch || 0}% Match
                </div>

                {/* Day/Night Badge */}
                {outfit.timeOfDay && outfit.timeOfDay !== 'both' && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-gray-600/50">
                    {outfit.timeOfDay === 'day'
                      ? <Sun className="w-3 h-3 text-yellow-400" />
                      : <Moon className="w-3 h-3 text-indigo-400" />
                    }
                    <span className="text-[10px] text-gray-300 capitalize">{outfit.timeOfDay}</span>
                  </div>
                )}
              </div>

              {/* Outfit Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-neon-green transition-colors">
                      {outfit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 capitalize">{outfit.style}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-400 capitalize">{outfit.season}</span>
                    </div>
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Colors:</span>
                  {outfit.colorScheme?.primary && (
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-600"
                        style={{ backgroundColor: outfit.colorScheme.primary }}
                      />
                      {outfit.colorScheme.secondary && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: outfit.colorScheme.secondary }}
                        />
                      )}
                      {outfit.colorScheme.accent && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: outfit.colorScheme.accent }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {outfit.wornCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {outfit.wornCount} worn
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="text-neon-green">★</span>
                      {outfit.items?.length || 0} items
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        outfitsAPI.toggleFavorite(outfit._id).then(() => {
                          queryClient.invalidateQueries('outfits');
                        });
                      }}
                      className={`p-1.5 rounded hover:bg-black-700 transition-colors ${outfit.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
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
                      className="p-1.5 rounded hover:bg-black-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
