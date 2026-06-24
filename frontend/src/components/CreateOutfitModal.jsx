import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Plus, Check } from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { itemsAPI, outfitsAPI, getImageUrl } from '@/services/api';
import toast from 'react-hot-toast';

const CATEGORY_TO_TYPE = {
  tops: 'top', bottoms: 'bottom', shoes: 'shoes',
  accessories: 'accessory', outerwear: 'layer', dresses: 'dress',
  traditional: 'top', kurta: 'top', sarees: 'dress', lehenga: 'dress',
};

const CreateOutfitModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [season, setSeason] = useState('all-season');
  const [occasion, setOccasion] = useState('everyday');
  const [style, setStyle] = useState('casual');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data } = useQuery('wardrobe-items', () => itemsAPI.getAll(), {
    enabled: isOpen,
  });
  const items = data?.data?.items || [];

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((s) => s.item === item._id);
      if (exists) return prev.filter((s) => s.item !== item._id);
      return [...prev, { item: item._id, type: CATEGORY_TO_TYPE[item.category] || 'top' }];
    });
  };

  const isSelected = (itemId) => selectedItems.some((s) => s.item === itemId);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Please enter an outfit name'); return; }
    if (selectedItems.length < 1) { toast.error('Select at least one item'); return; }
    setIsSaving(true);
    try {
      await outfitsAPI.create({ name: name.trim(), items: selectedItems, season, occasion, style });
      toast.success('Outfit created!');
      queryClient.invalidateQueries('outfits');
      handleClose();
    } catch {
      toast.error('Failed to create outfit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSeason('all-season');
    setOccasion('everyday');
    setStyle('casual');
    setSelectedItems([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-black-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Create Outfit</h2>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-black-700 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Outfit Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Casual Look"
                  className="input-primary w-full"
                />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
                  <select value={season} onChange={(e) => setSeason(e.target.value)} className="input-primary w-full">
                    {['all-season', 'spring', 'summer', 'fall', 'winter'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Occasion</label>
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input-primary w-full">
                    {['everyday', 'work', 'party', 'formal', 'casual', 'sport', 'date', 'travel'].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="input-primary w-full">
                    {['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Item Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Items <span className="text-gray-500">({selectedItems.length} selected)</span>
                </label>
                {items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items in wardrobe yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const selected = isSelected(item._id);
                      return (
                        <motion.button
                          key={item._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleItem(item)}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-neon-green bg-neon-green/10'
                              : 'border-gray-700 bg-black-700 hover:border-gray-500'
                          }`}
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden bg-black-800">
                            {item.images?.[0]?.url ? (
                              <img src={getImageUrl(item.images[0].url)} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Shirt className="w-8 h-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-white font-medium line-clamp-1 w-full text-center">{item.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase">{item.category}</span>
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-neon-green flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-3">
              <button onClick={handleClose} className="btn-secondary">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isSaving ? 'Creating...' : 'Create Outfit'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateOutfitModal;
