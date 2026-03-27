import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
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
import { itemsAPI } from '@/services/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import AddItemModal from '@/components/AddItemModal';

const Wardrobe = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data, isLoading } = useQuery(
    'wardrobe-items',
    () => itemsAPI.getAll(),
    { enabled: !!localStorage.getItem('wardrobe-ai-storage') }
  );

  const items = data?.data?.items || [];

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
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-4'
          }
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/wardrobe/${item._id}`)}
              className={`card cursor-pointer group ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''}`}
            >
              {/* Item Image Placeholder */}
              <div className={`relative ${
                viewMode === 'grid'
                  ? 'aspect-square rounded-lg bg-black-600'
                  : 'w-20 h-20 rounded-lg bg-black-600'
              } overflow-hidden`}>
                {item.images?.[0]?.url ? (
                  <>
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="w-full h-full object-cover blur-sm group-hover:blur-none transition-all duration-300"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black-600 to-black-700">
                    <Shirt className={`${
                      viewMode === 'grid' ? 'w-12 h-12' : 'w-8 h-8'
                    } text-gray-600 group-hover:text-neon-green transition-colors`} />
                  </div>
                )}

                {/* Favorite Badge */}
                {item.isFavorite && (
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity ${
                  viewMode === 'grid' ? 'flex items-center justify-center' : 'hidden'
                }`}>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Edit coming soon!');
                      }}
                      className="p-2 rounded-lg bg-black-700 hover:bg-neon-green hover:text-black-800 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Delete coming soon!');
                      }}
                      className="p-2 rounded-lg bg-black-700 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Item Info */}
              <div className={viewMode === 'grid' ? 'mt-3' : 'flex-1'}>
                <h3 className="font-semibold text-white truncate group-hover:text-neon-green transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-400 capitalize">{item.category}</p>

                {/* Color swatches */}
                <div className="flex gap-1 mt-2">
                  {item.colors?.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-gray-600"
                      style={{ backgroundColor: color.primary }}
                    />
                  ))}
                  {item.colors?.length > 3 && (
                    <span className="text-xs text-gray-500">+{item.colors.length - 3}</span>
                  )}
                </div>

                {/* Wear count */}
                {item.wearCount > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3 text-neon-green" />
                    <span>Worn {item.wearCount}x</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default Wardrobe;
