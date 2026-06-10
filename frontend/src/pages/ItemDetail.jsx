import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { itemsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import EditItemModal from '@/components/EditItemModal';
import {
  ArrowLeft,
  Shirt,
  Edit,
  Trash2,
  Heart,
  TrendingUp,
  Clock,
  Tag,
  Palette,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to get full image URL (Cloudinary URLs are already full URLs)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    // Fallback for relative URLs
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_BASE_URL}${imageUrl}`;
  };

  const getColorValue = (color) => color?.hex || color?.primary || color?.value || '#000000';

  const { data, isLoading, error } = useQuery(
    ['item', id],
    () => itemsAPI.getById(id),
    {
      enabled: !!id,
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to load item');
      },
    }
  );

  const item = data?.data?.item;

  const favoriteMutation = useMutation(
    () => itemsAPI.toggleFavorite(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['item', id]);
        queryClient.invalidateQueries('wardrobe-items');
        toast.success('Favorite status updated!');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to update favorite');
      },
    }
  );

  const deleteMutation = useMutation(
    () => itemsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('wardrobe-items');
        toast.success('Item deleted successfully!');
        navigate('/wardrobe');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to delete item');
      },
    }
  );

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate();
    }
  };

  const nextImage = () => {
    if (item?.images && item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const previousImage = () => {
    if (item?.images && item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?._id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-12 text-center"
      >
        <h3 className="text-xl font-semibold text-white mb-2">Item not found</h3>
        <p className="text-gray-400 mb-6">The item you're looking for doesn't exist or has been deleted.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/wardrobe')}
          className="btn-primary"
        >
          Back to Wardrobe
        </motion.button>
      </motion.div>
    );
  }

  const currentImage = item.images?.[currentImageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/wardrobe')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black-700 text-gray-300 hover:text-white hover:bg-black-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Wardrobe</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 rounded-lg bg-black-700 text-gray-300 hover:text-neon-green hover:bg-black-600 transition-all"
          >
            <Edit className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            className="p-2 rounded-lg bg-black-700 text-gray-300 hover:text-red-500 hover:bg-black-600 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isLoading}
            className={`p-2 rounded-lg transition-all ${
              item.isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-black-700 text-gray-300 hover:text-white hover:bg-black-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-white' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden bg-black-600">
            {currentImage?.url && !imageError ? (
              <>
                <img
                  src={getImageUrl(currentImage.url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                {/* Image Navigation */}
                {item.images && item.images.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black-700/80 hover:bg-black-700 text-white transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black-700/80 hover:bg-black-700 text-white transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black-700/80 text-white text-xs rounded-full">
                      {currentImageIndex + 1} / {item.images.length}
                    </div>
                    {currentImage.isPrimary && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-neon-green text-black-800 text-xs font-semibold rounded">
                        Primary
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black-600 to-black-700">
                <Shirt className="w-24 h-24 text-gray-600" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {item.images.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-neon-green'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${item.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-neon-green rounded-full" />
                  )}
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 bg-neon-green/20" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card space-y-6"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              {item.name}
            </h1>
            <p className="text-lg text-gray-400 capitalize">{item.category}</p>
          </div>

          {/* Style & Brand */}
          <div className="flex flex-wrap gap-3">
            {item.style && (
              <span className="px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-sm capitalize">
                {item.style}
              </span>
            )}
            {item.brand && (
              <span className="px-3 py-1 rounded-full bg-black-700 text-gray-300 text-sm">
                {item.brand}
              </span>
            )}
          </div>

          {/* Colors */}
          {item.colors && item.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </h3>
              <div className="flex gap-2 flex-wrap">
                {item.colors.map((color, i) => (
                  <div
                    key={i}
                    className="group relative"
                  >
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-600"
                      style={{ backgroundColor: getColorValue(color) }}
                    />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {getColorValue(color)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season & Tags */}
          <div className="space-y-4">
            {item.season && item.season.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Season
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.season.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-black-700 text-gray-300 text-sm capitalize"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-black-700 text-gray-300 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-gray-700 space-y-3">
            {item.wearCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-green/10">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Wear Count</p>
                  <p className="text-lg font-semibold text-white">{item.wearCount} times</p>
                </div>
              </div>
            )}

            {item.lastWorn && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Worn</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(item.lastWorn).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Notes
              </h3>
              <p className="text-gray-400 bg-black-700 rounded-lg p-4">{item.notes}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={item}
      />
    </motion.div>
  );
};

export default ItemDetail;
