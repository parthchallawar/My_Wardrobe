import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Shirt,
  Search,
  Filter,
  Plus,
  Heart,
  Edit,
  Trash2,
  Grid3X3,
  List,
  TrendingUp,
} from 'lucide-react';
import { itemsAPI, getImageUrl } from '@/services/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';

const Wardrobe = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { data, isLoading } = useQuery(
    'wardrobe-items',
    () => itemsAPI.getAll(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const items = data?.data?.items || [];
  const getColorValue = (color) => color?.hex || color?.primary || color?.value || '#000000';

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Shirt className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Wardrobe</h1>
            <p className="text-gray-400">{items.length} items in your collection</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your wardrobe..."
            className="input-primary w-full pl-12"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => toast.info('Filters coming soon!')}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-black-700 border border-gray-700 hover:border-neon-green/50 transition-all"
        >
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="hidden sm:inline text-gray-300">Filters</span>
        </motion.button>

        <div className="flex items-center gap-2 border border-gray-700 rounded-lg overflow-hidden">
          <motion.button
            whileHover={{ background: '#1a1a1a' }}
            onClick={() => setViewMode('grid')}
            className={`p-3 ${viewMode === 'grid' ? 'text-neon-green' : 'text-gray-400'}`}
          >
            <Grid3X3 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ background: '#1a1a1a' }}
            onClick={() => setViewMode('list')}
            className={`p-3 ${viewMode === 'list' ? 'text-neon-green' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Empty State */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center mx-auto mb-6">
            <Shirt className="w-12 h-12 text-neon-green" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Your Wardrobe is Empty</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your digital wardrobe by adding items you own.
            Our AI will help you create amazing outfit combinations!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Your First Item
          </motion.button>
        </motion.div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
          <p className="text-gray-400">Try a different search term</p>
        </motion.div>
      ) : (
        /* Items Grid/List */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
              : 'space-y-4'
          }
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => navigate(`/wardrobe/${item._id}`)}
              className={`relative cursor-pointer group glass border border-gray-700 hover:border-neon-green/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all duration-300 overflow-hidden ${
                viewMode === 'list' ? 'flex items-center gap-4 p-4 rounded-xl' : 'rounded-2xl flex flex-col'
              }`}
            >
              {/* Image Container */}
              <div className={`relative overflow-hidden ${
                viewMode === 'grid' ? 'w-full aspect-[4/5] bg-black-800' : 'w-24 h-24 rounded-lg bg-black-800 shrink-0'
              }`}>
                {item.images?.[0]?.url ? (
                  <img
                    src={getImageUrl(item.images[0].url)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black-700 to-black-800">
                    <Shirt className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-8 h-8'} text-gray-600 group-hover:text-neon-green/50 transition-colors duration-500`} />
                  </div>
                )}
                
                {/* AI Badge */}
                {item.aiAnalyzed && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-neon-green/30 flex items-center gap-1 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider">AI Synced</span>
                  </div>
                )}

                {/* Floating Actions on Image Hover */}
                <div className={`absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 ${viewMode === 'list' ? 'hidden' : ''}`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      itemsAPI.toggleFavorite(item._id).then(() => {
                        toast.success('Favorite updated!');
                        queryClient.invalidateQueries('wardrobe-items');
                      });
                    }}
                    className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-colors ${
                      item.isFavorite ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-black/60 border-gray-600/50 text-gray-300 hover:text-white hover:border-gray-400'
                    } border`}
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditItem(item);
                    }}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-gray-600/50 text-gray-300 hover:text-white hover:border-gray-400 shadow-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this item?')) {
                        itemsAPI.delete(item._id).then(() => {
                          toast.success('Deleted!');
                          queryClient.invalidateQueries('wardrobe-items');
                        });
                      }
                    }}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-gray-600/50 text-gray-300 hover:text-red-500 hover:border-red-500/50 shadow-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {/* Bottom Gradient Overlay for Grid View */}
                {viewMode === 'grid' && (
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black-900 via-black-900/40 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Item Info Card Body */}
              <div className={`${viewMode === 'grid' ? 'p-5 relative z-10 flex flex-col flex-1 bg-black-800/90' : 'flex-1'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-white group-hover:text-neon-green transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  {viewMode === 'list' && item.isFavorite && (
                    <Heart className="w-4 h-4 text-red-500 fill-current shrink-0 ml-2" />
                  )}
                </div>
                
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">
                  {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}
                </p>

                {/* Color swatches */}
                <div className="flex items-center gap-1.5 mb-3">
                  {item.colors?.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-gray-600/50 shadow-inner"
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color?.name || 'Color'}
                    />
                  ))}
                  {item.colors?.length > 4 && (
                    <span className="text-[10px] text-gray-500 font-medium bg-black-700 px-1.5 py-0.5 rounded-full">
                      +{item.colors.length - 4}
                    </span>
                  )}
                  {item.colors?.length === 0 && item.color?.primary?.hex && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-600/50 shadow-inner"
                      style={{ backgroundColor: item.color.primary.hex }}
                      title={item.color.primary.name}
                    />
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-700/50 flex items-center justify-between">
                  {item.wearCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black-700/50 px-2 py-1 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
                      <span>{item.wearCount} Wears</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Unworn</span>
                  )}
                  
                  {item.season?.length > 0 && (
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide bg-black-700/50 px-2 py-1 rounded-md">
                      {item.season[0]}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditItemModal
        isOpen={!!editItem}
        onClose={() => {
          setEditItem(null);
          queryClient.invalidateQueries('wardrobe-items');
        }}
        item={editItem}
      />
    </div>
  );
};

export default Wardrobe;
