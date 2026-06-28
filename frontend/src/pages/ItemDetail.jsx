import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Heart, Shirt, Tag,
  Ruler, Palette, Layers, Box, CheckCircle2, AlertTriangle, Activity, Calendar,
  Sun, Moon
} from 'lucide-react';
import { itemsAPI, getImageUrl, wearLogAPI } from '../services/api';
import toast from 'react-hot-toast';
import EditItemModal from '@/components/EditItemModal';

const safeRender = (val) => {
  if (val == null) return '';
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch (e) { return 'Object'; }
  }
  return String(val);
};

const DetailSection = ({ title, icon: Icon, children, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass p-6 rounded-2xl border border-gray-700/50 hover:border-neon-green/30 transition-colors ${className}`}
  >
    <div className="flex items-center gap-2 mb-4 text-neon-green">
      {Icon && <Icon className="w-5 h-5" />}
      <h3 className="font-semibold text-lg tracking-wide uppercase">{title}</h3>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </motion.div>
);

const DetailRow = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-medium capitalize text-right ml-4 max-w-[70%] truncate" title={safeRender(value)}>{safeRender(value)}</span>
    </div>
  );
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      setItem(response.data.item);
    } catch (error) {
      toast.error('Failed to load item details');
      navigate('/wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsAPI.delete(id);
        toast.success('Item deleted successfully');
        navigate('/wardrobe');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await itemsAPI.toggleFavorite(id);
      setItem(response.data.item);
      toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleWoreToday = async () => {
    try {
      await wearLogAPI.log({ item: id, date: new Date().toISOString(), timeOfDay: 'both' });
      // Refresh item to show updated wearCount
      const response = await itemsAPI.getById(id);
      setItem(response.data.item);
      toast.success('Wear logged!');
    } catch (error) {
      toast.error('Failed to log wear');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!item) return null;

  const hasAI = item.aiAnalyzed;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/wardrobe')}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Wardrobe</span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleFavorite}
            className={`p-2.5 rounded-xl border transition-all ${
              item.isFavorite 
                ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'glass border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleWoreToday}
            title="Log a wear for today"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border-gray-700 text-gray-400 hover:text-neon-green hover:border-neon-green/50 transition-all text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Wore today</span>
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="p-2.5 rounded-xl glass border-gray-700 text-gray-400 hover:text-neon-green hover:border-neon-green/50 transition-all">
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2.5 rounded-xl glass border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Image & Primary Info */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden glass border border-gray-700 group"
          >
            {item.images?.[0]?.url ? (
              <img
                src={getImageUrl(item.images[0].url)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black-800">
                <Shirt className="w-24 h-24 text-gray-600" />
                <span className="mt-4 text-gray-500 font-medium">No Image</span>
              </div>
            )}

            {/* AI Overlay Badge */}
            {hasAI && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg border border-neon-green/50 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                <Activity className="w-4 h-4 text-neon-green animate-pulse" />
                <span className="text-xs font-bold text-neon-green tracking-widest uppercase">AI Diagnosed</span>
              </div>
            )}
            
            {/* Wear Count Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg border border-gray-600/50">
                <span className="text-xs font-medium text-gray-300">Worn {item.wearCount || 0} times</span>
              </div>
              {item.confidence?.overall > 0 && (
                <div className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-neon-green flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <span className="text-sm font-bold text-neon-green">{(item.confidence.overall * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </motion.div>

          <div className="glass p-6 rounded-3xl border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">{safeRender(item.name)}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-full text-sm font-medium uppercase tracking-wider">
                {safeRender(item.category)}
              </span>
              {item.subCategory && (
                <span className="px-3 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-full text-sm font-medium uppercase tracking-wider">
                  {safeRender(item.subCategory)}
                </span>
              )}
              {item.timeOfDay && item.timeOfDay !== 'both' && (
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  item.timeOfDay === 'day'
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {item.timeOfDay === 'day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {item.timeOfDay.charAt(0).toUpperCase() + item.timeOfDay.slice(1)}
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <DetailRow label="Brand" value={item.brand} />
              <DetailRow label="Size" value={item.size} />
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-gray-400 text-sm">Seasons</span>
                <div className="flex gap-2">
                  {(Array.isArray(item.season) ? item.season : [item.season]).filter(Boolean).map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-black-700 rounded text-gray-300 uppercase">{safeRender(s)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Deep AI Diagnostics Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Color & Pattern */}
            <DetailSection title="Color & Pattern" icon={Palette}>
              {item.color?.primary && (
                <div className="flex items-center gap-3 py-2">
                  <div 
                    className="w-8 h-8 rounded-full shadow-inner border border-gray-600/50"
                    style={{ backgroundColor: item.color.primary.hex || item.colorHex || '#ccc' }}
                  />
                  <div>
                    <p className="text-white font-medium capitalize">{safeRender(item.color.primary.name || item.colorName)}</p>
                    <p className="text-xs text-gray-500">{safeRender(item.color.primary.hex || item.colorHex)}</p>
                  </div>
                </div>
              )}
              {item.pattern?.type && <DetailRow label="Pattern Type" value={item.pattern.type} />}
              {item.pattern?.scale && <DetailRow label="Pattern Scale" value={item.pattern.scale} />}
              {item.color?.colorTemperature && <DetailRow label="Temperature" value={item.color.colorTemperature} />}
            </DetailSection>

            {/* Fit & Silhouette */}
            <DetailSection title="Fit & Silhouette" icon={Box}>
              <DetailRow label="Fit Type" value={item.fit?.fit_type} />
              <DetailRow label="Silhouette" value={item.fit?.silhouette} />
              <DetailRow label="Length" value={item.dimensions?.length} />
              <DetailRow label="Neckline" value={item.dimensions?.neckline} />
            </DetailSection>

            {/* Construction & Fabric */}
            <DetailSection title="Construction" icon={Layers}>
              <DetailRow label="Fabric" value={item.construction?.fabric} />
              <DetailRow label="Texture" value={item.construction?.texture} />
              <DetailRow label="Sleeve Length" value={item.dimensions?.sleeve} />
              <DetailRow label="Stretch" value={item.construction?.stretch} />
            </DetailSection>

            {/* Styling & Condition */}
            <DetailSection title="Styling & Diagnostics" icon={Tag}>
              <DetailRow label="Style" value={item.styling?.style} />
              <DetailRow label="Formality Score" value={item.styling?.formalityScore ? `${item.styling.formalityScore}/10` : null} />
              <DetailRow label="Aesthetic" value={Array.isArray(item.styling?.aesthetic) ? item.styling.aesthetic.join(', ') : item.styling?.aesthetic} />
              {item.condition && (
                <div className="mt-4 p-3 bg-black-800/50 rounded-xl border border-gray-700/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Condition Report</p>
                    <p className="text-xs text-gray-400 capitalize">
                      Wear: {safeRender(item.condition.estimatedWear || 'Unknown')} | 
                      Care: {safeRender(Array.isArray(item.condition.careSymbols) ? item.condition.careSymbols.join(', ') : item.condition.careSymbols || 'None')}
                    </p>
                  </div>
                </div>
              )}
            </DetailSection>

          </div>

          {/* AI Matching Recommendations */}
          {(item.matching?.matchTags?.length > 0 || item.matching?.pairsWellWith || item.matching?.colorHarmony) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-3xl border border-neon-green/20 space-y-5"
            >
              <div className="flex items-center gap-2 text-neon-green">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-semibold text-lg tracking-wide uppercase">AI Pairing Intelligence</h3>
              </div>

              {item.matching?.matchTags?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Synergy Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {item.matching.matchTags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-black-800 text-gray-300 rounded-xl text-sm border border-gray-700 hover:border-neon-green/50 hover:text-neon-green transition-colors cursor-default">
                        {safeRender(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.matching?.colorHarmony?.complementary?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Complementary Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {item.matching.colorHarmony.complementary.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-neon-green/10 text-neon-green rounded-xl text-sm border border-neon-green/30 capitalize">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.matching?.colorHarmony?.clashes?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Color Clashes to Avoid</p>
                  <div className="flex flex-wrap gap-2">
                    {item.matching.colorHarmony.clashes.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-red-900/20 text-red-400 rounded-xl text-sm border border-red-700/30 capitalize">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.matching?.pairsWellWith && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pairs Well With</p>
                  <div className="flex flex-wrap gap-2">
                    {['bottoms', 'outerwear', 'footwear'].flatMap(cat =>
                      (item.matching.pairsWellWith[cat] || []).map((v, i) => (
                        <span key={`${cat}-${i}`} className="px-3 py-1.5 bg-black-800 text-gray-300 rounded-xl text-sm border border-gray-700 capitalize">
                          {v}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          fetchItem();
        }}
        item={item}
      />
    </div>
  );
}
