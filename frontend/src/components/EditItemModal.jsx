import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Save, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { itemsAPI } from '@/services/api';
import toast from 'react-hot-toast';

const EditItemModal = ({ isOpen, onClose, item }) => {
  const queryClient = useQueryClient();
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_BASE_URL}${imageUrl}`;
  };

  const getColorValue = (color) => color?.hex || color?.primary || color?.value || '#000000';
  const hexToRgb = (hex) => {
    const normalized = (hex || '#000000').replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map((char) => char + char).join('')
      : normalized.padEnd(6, '0').slice(0, 6);

    return {
      r: parseInt(value.slice(0, 2), 16) || 0,
      g: parseInt(value.slice(2, 4), 16) || 0,
      b: parseInt(value.slice(4, 6), 16) || 0,
    };
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    style: '',
    color: '#000000',
    brand: '',
    season: '',
    tags: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        style: item.style || '',
        color: getColorValue(item.colors?.[0]),
        brand: item.brand || '',
        season: item.season?.[0] || '',
        tags: item.tags?.join(', ') || '',
        notes: item.notes || '',
      });
      if (item.images?.[0]?.url) {
        setPreviewUrl(getImageUrl(item.images[0].url));
      }
    }
  }, [item]);

  const updateMutation = useMutation(
    ({ id, data }) => itemsAPI.update(id, data), {
    onSuccess: () => {
      toast.success('Item updated successfully!');
      queryClient.invalidateQueries('wardrobe-items');
      queryClient.invalidateQueries(['item', item?._id]);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update item');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      name: formData.name,
      category: formData.category,
      style: formData.style,
      color: formData.color,
      brand: formData.brand || undefined,
      season: formData.season || undefined,
      tags: formData.tags || undefined,
      notes: formData.notes || undefined,
    };

    if (selectedFile) {
      // Use image upload endpoint
      setIsUploading(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('wardrobe-ai-storage')
        ? JSON.parse(localStorage.getItem('wardrobe-ai-storage')).state?.token
        : null;

      const formData = new FormData();
      formData.append('name', itemData.name);
      formData.append('category', itemData.category);
      formData.append('style', itemData.style);
      formData.append('color', itemData.color);
      if (itemData.brand) formData.append('brand', itemData.brand);
      if (itemData.season) formData.append('season', itemData.season);
      if (itemData.tags) formData.append('tags', itemData.tags);
      if (itemData.notes) formData.append('notes', itemData.notes);
      formData.append('image', selectedFile);

      axios.put(
        `${API_BASE_URL}/api/items/${item._id}/with-image`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      )      
        .then((response) => {
          toast.success('Item updated successfully!');
          queryClient.invalidateQueries('wardrobe-items');
          queryClient.invalidateQueries(['item', item._id]);
          handleClose();
        })
        .catch((error) => {
          setIsUploading(false);
          toast.error(error.response?.data?.error || 'Failed to update item');
        });
    } else {
      // Use regular endpoint
      const finalData = {
        name: itemData.name,
        category: itemData.category,
        style: itemData.style,
        colors: [{ hex: itemData.color, rgb: hexToRgb(itemData.color), percentage: 100 }],
        brand: itemData.brand,
        season: itemData.season ? [itemData.season] : undefined,
        tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : [],
        notes: itemData.notes,
      };
      updateMutation.mutate({ id: item._id, data: finalData });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl && !selectedFile) {
      // Keep original image preview
      setPreviewUrl(null);
    } else {
      URL.revokeObjectURL(previewUrl);
      // Restore original image if exists
      if (item?.images?.[0]?.url) {
        setPreviewUrl(getImageUrl(item.images[0].url));
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      style: '',
      color: '#000000',
      brand: '',
      season: '',
      tags: '',
      notes: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-neon-green/20 to-neon-green/5">
                <Shirt className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">Edit Item</h2>
                <p className="text-sm text-gray-400">Update item details</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-black-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Blue Cotton T-Shirt"
                className="input-primary w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-primary w-full"
              >
                <option value="">Select category</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="outerwear">Outerwear</option>
                <option value="dresses">Dresses</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style *
              </label>
              <select
                required
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="input-primary w-full"
              >
                <option value="">Select style</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sporty">Sporty</option>
                <option value="bohemian">Bohemian</option>
                <option value="minimalist">Minimalist</option>
                <option value="vintage">Vintage</option>
                <option value="streetwear">Streetwear</option>
                <option value="glam">Glam</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Color *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer bg-black-700 border-2 border-gray-600"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input-primary flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Nike, Zara, H&M"
                className="input-primary w-full"
              />
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="input-primary w-full"
              >
                <option value="">Select season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="all-season">All Seasons</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., casual, comfortable, everyday"
                className="input-primary w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this item..."
                rows={3}
                className="input-primary w-full resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Image (Optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg transition-colors ${
                  previewUrl
                    ? 'border-neon-green/50 bg-neon-green/5'
                    : 'border-gray-700 hover:border-neon-green/50'
                }`}
              >
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center p-8 cursor-pointer"
                  >
                    <div className="p-3 rounded-full bg-black-600 mb-3">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">Click to upload an image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg bg-black-700 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={updateMutation.isLoading || isUploading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {(updateMutation.isLoading || isUploading) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isUploading ? 'Uploading...' : 'Updating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditItemModal;
