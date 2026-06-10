import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Plus, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { itemsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import ImageUploadAnalyzer from './ImageUploadAnalyzer';

const AddItemModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    style: '',
    color: '#000000',
    colorName: '',
    pattern: 'solid',
    brand: '',
    season: '',
    tags: '',
    imageBase64: '',
  });
  const [isAiPrefilled, setIsAiPrefilled] = useState(false);
  const [showAiBanner, setShowAiBanner] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const addMutation = useMutation(({ data, files }) =>
    files.length > 1 ? itemsAPI.createWithImages(data, files) : itemsAPI.createWithImage(data, files[0]), {
    onSuccess: () => {
      toast.success('Item added to wardrobe successfully!');
      queryClient.invalidateQueries('wardrobe-items');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add item');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      name: formData.name,
      category: formData.category, // Map type to category or keep as category
      style: formData.style,
      color: formData.color,
      colorName: formData.colorName || undefined,
      colorHex: formData.color,
      pattern: formData.pattern,
      brand: formData.brand || undefined,
      season: formData.season || undefined,
      tags: formData.tags || undefined,
      imageBase64: formData.imageBase64 || undefined,
      aiAnalyzed: isAiPrefilled,
    };

    if (selectedFiles.length > 0) {
      // Use image upload endpoint
      setIsUploading(true);
      setPreviewUrls([]);
      addMutation.mutate(
        { data: itemData, files: selectedFiles },
        {
          onSuccess: () => {
            setIsUploading(false);
          },
          onError: (error) => {
            setIsUploading(false);
            toast.error(error.response?.data?.error || 'Failed to add item');
          },
        }
      );
    } else {
      // Use regular endpoint
      const finalData = {
        ...itemData,
        colors: [{ hex: itemData.color, rgb: { r: 0, g: 0, b: 0 } }], // simplified adapter for backend compat
        season: itemData.season ? [itemData.season] : undefined,
        tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : [],
      };
      addMutation.mutate({ data: finalData, files: [] });
    }
  };

  const handleAnalysisComplete = (data) => {
    // Basic category mapping from AI type
    const aiType = data.type || '';
    let categoryMap = '';
    if (['t-shirt', 'shirt', 'sweater', 'vest'].includes(aiType)) categoryMap = 'tops';
    else if (['jacket', 'coat'].includes(aiType)) categoryMap = 'outerwear';
    else if (['pants', 'shorts', 'skirt'].includes(aiType)) categoryMap = 'bottoms';
    else if (['dress', 'jumpsuit'].includes(aiType)) categoryMap = 'dresses';
    else if (['shoes'].includes(aiType)) categoryMap = 'shoes';
    else if (['bag', 'hat', 'scarf', 'belt'].includes(aiType)) categoryMap = 'accessories';

    setFormData(prev => ({
      ...prev,
      category: categoryMap || prev.category,
      name: prev.name || (data.type ? `My ${data.colorName || ''} ${data.type}`.trim() : ''),
      style: data.style || prev.style,
      color: data.colorHex || prev.color,
      colorName: data.colorName || prev.colorName,
      pattern: data.pattern !== 'solid color' ? data.pattern : 'solid',
      season: data.season === 'spring autumn transitional clothing' ? 'all-season' : (data.season || prev.season),
      imageBase64: data.imageBase64 || prev.imageBase64,
    }));
    setIsAiPrefilled(true);
    setShowAiBanner(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum 10MB allowed.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      setPreviewUrls([...previewUrls, ...newPreviews]);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    // Revoke the URL for the removed image
    const removedPreview = previewUrls[index];
    if (removedPreview) {
      URL.revokeObjectURL(removedPreview);
    }
    setPreviewUrls(newPreviews);
  };

  const setPrimaryImage = (index) => {
    const newFiles = [selectedFiles[index], ...selectedFiles.filter((_, i) => i !== index)];
    const newPreviews = [previewUrls[index], ...previewUrls.filter((_, i) => i !== index)];
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
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
    });
    setPreviewUrls([]);
    setSelectedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

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
                <h2 className="text-xl font-display font-bold text-white">Add New Item</h2>
                <p className="text-sm text-gray-400">Add a new item to your wardrobe</p>
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
            {showAiBanner && (
              <div className="flex items-center justify-between bg-black-800 border-l-4 border-neon-green p-3 mb-4 rounded">
                <span className="text-sm text-gray-300">
                  Fields auto-filled by AI — please review before saving
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiBanner(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            )}
            <ImageUploadAnalyzer onAnalysisComplete={handleAnalysisComplete} />
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

            {/* Image Upload - Multiple */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Images (Optional - Max 5)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg transition-colors ${
                  previewUrls.length > 0
                    ? 'border-neon-green/50 bg-neon-green/5'
                    : 'border-gray-700 hover:border-neon-green/50'
                }`}
              >
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {previewUrls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 p-4">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden ${
                          index === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className={`p-2 rounded-full text-xs ${
                              index === 0
                                ? 'bg-neon-green text-black-800 font-semibold'
                                : 'bg-black-700/80 text-white'
                            }`}
                            title={index === 0 ? 'Primary image' : 'Set as primary'}
                          >
                            {index === 0 ? '★' : '☆'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-2 rounded-full bg-red-500/80 hover:bg-red-600 text-white text-xs"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-neon-green text-black-800 text-xs font-semibold rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                    {previewUrls.length < 5 && (
                      <label
                        htmlFor="image-upload"
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-neon-green cursor-pointer flex items-center justify-center"
                      >
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Add More</p>
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center p-8 cursor-pointer"
                  >
                    <div className="p-3 rounded-full bg-black-600 mb-3">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">Click to upload images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB • Max 5 images</p>
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
                disabled={addMutation.isLoading || isUploading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {(addMutation.isLoading || isUploading) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isUploading ? 'Uploading...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Item</span>
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

export default AddItemModal;
