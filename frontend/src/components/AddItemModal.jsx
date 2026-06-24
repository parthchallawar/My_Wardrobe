import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Plus, Upload, Loader2, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { itemsAPI, aiAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { extractDominantColor } from '../utils/colorExtractor';

const AddItemModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  // Wizard state
  const [step, setStep] = useState(1); // 1 = Upload/Analyze, 2 = Form Details
  
  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiPrefilled, setIsAiPrefilled] = useState(false);
  const [fullAiResponse, setFullAiResponse] = useState(null);
  
  // Form state
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
  });

  const addMutation = useMutation(
    ({ data, files }) => files.length > 0 ? itemsAPI.createWithImage(data, files[0]) : itemsAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Item added to wardrobe successfully!');
        queryClient.invalidateQueries('wardrobe-items');
        handleClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add item');
      },
    }
  );

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File is too large. Maximum 10MB allowed.`);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsAiPrefilled(false);
      setFullAiResponse(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    
    try {
      const data = new FormData();
      data.append('image', selectedFile);

      const response = await aiAPI.analyzeImage(data);
      const fullData = response.data.data;
      setFullAiResponse(fullData);
      
      const type = fullData.identity?.type || fullData.type || '';
      const style = fullData.styling?.style || fullData.style || 'casual';
      const pattern = typeof fullData.pattern === 'object' ? (fullData.pattern?.type || '') : (fullData.pattern || 'solid');
      const season = Array.isArray(fullData.styling?.season) ? (fullData.styling.season[0] || '') : (fullData.styling?.season || fullData.season || 'all-season');

      let categoryMap = 'tops';
      const typeLower = type.toLowerCase();
      if (['t-shirt', 'shirt', 'sweater', 'vest', 'graphic tee', 'top', 'blouse'].includes(typeLower)) categoryMap = 'tops';
      else if (['jacket', 'coat', 'bomber', 'denim jacket', 'hoodie', 'blazer', 'cardigan'].includes(typeLower)) categoryMap = 'outerwear';
      else if (['pants', 'shorts', 'skirt', 'joggers', 'cargo pants', 'jeans', 'bottoms'].includes(typeLower)) categoryMap = 'bottoms';
      else if (['dress', 'jumpsuit', 'romper'].includes(typeLower)) categoryMap = 'dresses';
      else if (['shoes', 'sneakers', 'slides', 'boots', 'heels', 'sandals'].includes(typeLower)) categoryMap = 'shoes';
      else if (['bag', 'hat', 'scarf', 'belt', 'accessory', 'jewelry', 'sunglasses'].includes(typeLower)) categoryMap = 'accessories';

      const finalName = type ? `My ${type}`.replace(/\b\w/g, l => l.toUpperCase()) : 'New Outfit Item';

      const img = new Image();
      img.onload = async () => {
        const colorResult = await extractDominantColor(img);
        setFormData({
          name: finalName,
          category: categoryMap,
          style: style,
          pattern: pattern,
          season: season === 'spring autumn transitional clothing' ? 'all-season' : season,
          color: colorResult.hex,
          colorName: colorResult.name,
          brand: fullData.brand || '',
          tags: fullData.styling?.occasion ? fullData.styling.occasion.join(', ') : '',
        });
        setIsAiPrefilled(true);
        setIsAnalyzing(false);
        setStep(2);
      };
      img.onerror = () => {
        setFormData({
          name: finalName,
          category: categoryMap,
          style: style,
          pattern: pattern,
          season: season === 'spring autumn transitional clothing' ? 'all-season' : season,
          color: '#000000',
          colorName: 'Unknown',
          brand: fullData.brand || '',
          tags: fullData.styling?.occasion ? fullData.styling.occasion.join(', ') : '',
        });
        setIsAiPrefilled(true);
        setIsAnalyzing(false);
        setStep(2);
      };
      img.src = URL.createObjectURL(selectedFile);

    } catch (error) {
      console.error(error);
      toast.error('AI Analysis failed. Please proceed manually.');
      setIsAnalyzing(false);
    }
  };

  const handleSkipAi = () => {
    setIsAiPrefilled(false);
    setFullAiResponse(null);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      name: formData.name,
      category: formData.category,
      style: formData.style,
      color: formData.color,
      colorName: formData.colorName || undefined,
      colorHex: formData.color,
      pattern: formData.pattern,
      brand: formData.brand || undefined,
      season: formData.season || undefined,
      tags: formData.tags || undefined,
      aiAnalyzed: isAiPrefilled,
    };

    if (fullAiResponse) {
      itemData.aiData = fullAiResponse;
    }

    if (selectedFile) {
      addMutation.mutate({ data: itemData, files: [selectedFile] });
    } else {
      const finalData = {
        ...itemData,
        colors: [{ hex: itemData.color, rgb: { r: 0, g: 0, b: 0 } }],
        season: itemData.season ? [itemData.season] : undefined,
        tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : [],
      };
      addMutation.mutate({ data: finalData, files: [] });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '', category: '', style: '', color: '#000000', colorName: '', pattern: 'solid', brand: '', season: '', tags: '',
    });
    setPreviewUrl(null);
    setSelectedFile(null);
    setStep(1);
    setIsAiPrefilled(false);
    setFullAiResponse(null);
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="card w-full max-w-lg max-h-[90vh] overflow-y-auto glass border border-gray-700/50 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-green/10 border border-neon-green/20">
                <Shirt className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide">
                  {step === 1 ? 'Add New Item' : 'Review Details'}
                </h2>
                <div className="flex gap-2 text-xs font-medium mt-1">
                  <span className={`${step >= 1 ? 'text-neon-green' : 'text-gray-500'}`}>1. Upload</span>
                  <span className="text-gray-600">→</span>
                  <span className={`${step >= 2 ? 'text-neon-green' : 'text-gray-500'}`}>2. Details</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-2.5 rounded-xl bg-black-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* STEP 1: Upload & Analyze */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-neon-green bg-neon-green/10 shadow-[0_0_30px_rgba(57,255,20,0.15)] scale-105' 
                    : previewUrl 
                      ? 'border-neon-green/30 bg-black-800/50 hover:border-neon-green/60'
                      : 'border-gray-700 bg-black-800/30 hover:border-gray-500 hover:bg-black-800/80'
                }`}
              >
                <input {...getInputProps()} />
                
                {previewUrl ? (
                  <div className="w-full relative flex justify-center group">
                    <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-2xl shadow-2xl" />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl border border-neon-green/30">
                      <p className="text-white text-sm font-semibold tracking-wide">Click or drag to replace image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-center py-12">
                    <div className="p-4 bg-black-900 rounded-full border border-gray-700/50 shadow-inner">
                      <Upload className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg tracking-wide mb-1">Upload Clothing Image</p>
                      <p className="text-gray-500 text-sm">Drag & drop or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="space-y-3">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-4 px-6 bg-neon-green text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] hover:bg-[#32e612] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Extracting DNA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Diagnose with AI</span>
                      </>
                    )}
                  </motion.button>
                  <button 
                    onClick={handleSkipAi}
                    className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors font-medium flex justify-center items-center gap-1"
                  >
                    Skip AI & Enter Manually <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Review & Submit */}
          {step === 2 && (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              {isAiPrefilled && (
                <div className="flex items-center gap-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl mb-4">
                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                  <span className="text-sm text-neon-green font-medium">AI successfully diagnosed item parameters. Review below.</span>
                </div>
              )}

              {previewUrl && (
                <div className="flex items-center gap-4 mb-4 p-3 bg-black-800/50 rounded-2xl border border-gray-700/50">
                  <img src={previewUrl} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover shadow-inner" />
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Change Image
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="dresses">Dresses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Style *</label>
                  <select
                    required
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all appearance-none"
                  >
                    <option value="">Select...</option>
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

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-[50px] rounded-xl cursor-pointer bg-black-600 border border-gray-700"
                    />
                    <input
                      type="text"
                      value={formData.colorName}
                      onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                      placeholder="Color Name"
                      className="flex-1 min-w-0 bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                    <option value="all-season">All Seasons</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pattern</label>
                  <input
                    type="text"
                    value={formData.pattern}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., casual, comfortable"
                    className="w-full bg-black-600 border border-gray-700 text-white rounded-xl p-3 focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800/50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-xl bg-black-800 text-gray-300 font-medium hover:text-white transition-colors border border-gray-700 hover:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isLoading}
                  className="flex-[2] py-3.5 rounded-xl bg-neon-green text-black font-bold flex items-center justify-center gap-2 hover:bg-[#32e612] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                >
                  {addMutation.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Sync to Wardrobe</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddItemModal;
