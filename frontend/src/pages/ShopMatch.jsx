import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  ShoppingCart,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Info,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '@/services/api';

const colorOptions = [
  'black', 'white', 'gray', 'navy', 'beige', 'brown',
  'red', 'blue', 'green', 'yellow', 'pink', 'purple',
  'orange', 'burgundy', 'emerald', 'teal', 'khaki', 'olive'
];

const categoryOptions = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dresses', label: 'Dresses' }
];

const styleOptions = [
  'casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam'
];

const seasonOptions = [
  'spring', 'summer', 'fall', 'winter', 'all-season'
];

const ShopMatch = () => {
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'tops',
    colors: [{ primary: 'black', secondary: null, tertiary: null }],
    style: 'casual',
    season: ['all-season'],
  });

  const [showResults, setShowResults] = useState(false);

  const { data: matchData, isLoading, refetch } = useQuery(
    ['shop-match', newItem],
    () => aiAPI.shopMatch({ newItem }),
    { enabled: false }
  );

  const handleColorSelect = (color, index = 0) => {
    setNewItem(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? { ...c, primary: color } : c)
    }));
  };

  const handleSeasonToggle = (season) => {
    setNewItem(prev => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter(s => s !== season)
        : [...prev.season, season]
    }));
  };

  const handleFindMatches = () => {
    setShowResults(true);
    refetch();
  };

  const combinations = matchData?.data?.combinations || [];
  const groupedCombinations = matchData?.data?.groupedCombinations || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-black-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-neon-green" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Shop Match
            </h1>
            <p className="text-gray-400">Find perfect matches before you buy</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/5">
              <ShoppingCart className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">New Item Details</h2>
              <p className="text-sm text-gray-400">Tell us about the item you're considering</p>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Blue Navy Blazer"
              className="input-primary w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewItem(prev => ({ ...prev, category: cat.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newItem.category === cat.value
                      ? 'border-neon-green bg-neon-green/10 text-neon-green'
                      : 'border-gray-700 bg-black-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Style</label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewItem(prev => ({ ...prev, style }))}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    newItem.style === style
                      ? 'bg-neon-green text-black-800 font-medium'
                      : 'bg-black-600 text-gray-300 hover:bg-black-500'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Primary Color</label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleColorSelect(color)}
                  className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                    newItem.colors[0]?.primary === color
                      ? 'border-neon-green shadow-neon-sm'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {newItem.colors[0]?.primary === color && (
                    <CheckCircle className="absolute inset-0 m-auto w-4 h-4 text-white mix-blend-difference" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Season</label>
            <div className="flex flex-wrap gap-2">
              {seasonOptions.map((season) => (
                <motion.button
                  key={season}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSeasonToggle(season)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    newItem.season.includes(season)
                      ? 'bg-neon-green/20 border-2 border-neon-green text-neon-green'
                      : 'bg-black-600 border-2 border-transparent text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {season}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Find Matches Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFindMatches}
            disabled={!newItem.name || !newItem.category}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              !newItem.name || !newItem.category
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-green to-neon-greenLight text-black-800 hover:shadow-neon hover:tracking-wider'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {isLoading ? 'Analyzing...' : 'Find Perfect Matches'}
              <Sparkles className="w-5 h-5" />
            </div>
          </motion.button>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center mb-6 animate-float">
                  <ShoppingCart className="w-12 h-12 text-neon-green" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Find Matches</h3>
                <p className="text-gray-400 max-w-md">
                  Fill in the details about the item you're considering buying,
                  and our AI will show you exactly how it matches with your existing wardrobe.
                </p>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin mb-6" />
                <p className="text-gray-300">Finding perfect matches...</p>
              </motion.div>
            ) : combinations.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <Info className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Matches Found</h3>
                <p className="text-gray-400">
                  Add more items to your wardrobe to find matches for this item.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neon-green/20">
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Matches Found</p>
                    <p className="text-2xl font-bold text-neon-green">{combinations.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-neon-green ml-auto" />
                </div>

                {/* Match Categories */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {Object.entries(groupedCombinations).map(([category, matches]) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.random() * 0.2 }}
                    >
                      <h3 className="text-lg font-semibold text-white capitalize mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neon-green" />
                        {category}
                      </h3>

                      <div className="space-y-3">
                        {matches.slice(0, 3).map((match, index) => (
                          <motion.div
                            key={match.primaryMatch?._id || index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border-2 relative overflow-hidden group ${
                              match.score >= 80
                                ? 'border-neon-green bg-neon-green/5'
                                : match.score >= 60
                                ? 'border-yellow-500/50 bg-yellow-500/5'
                                : 'border-gray-700 bg-black-600'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Match Score Circle */}
                              <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center ${
                                match.score >= 80
                                  ? 'bg-neon-green text-black-800'
                                  : match.score >= 60
                                  ? 'bg-yellow-500 text-black-800'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                <span className="text-lg font-bold">{match.score}</span>
                                <span className="text-xs">%</span>
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1">
                                  {match.primaryMatch?.name || 'Unnamed Item'}
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex gap-1">
                                    {match.primaryMatch?.colors?.slice(0, 3).map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-4 h-4 rounded-full border border-gray-600"
                                        style={{ backgroundColor: color.primary }}
                                      />
                                    ))}
                                  </div>
                                  {match.colorBonus > 0 && (
                                    <span className="text-xs text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
                                      +{match.colorBonus} color bonus
                                    </span>
                                  )}
                                </div>

                                {match.whyItWorks?.length > 0 && (
                                  <div className="mt-2 p-3 rounded-lg bg-black-700/50">
                                    <p className="text-sm text-gray-300">
                                      <Info className="w-3 h-3 inline mr-1 text-neon-green" />
                                      {match.whyItWorks[0]}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <Heart className="w-5 h-5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer" />
                            </div>

                            {/* Score Breakdown */}
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="grid grid-cols-4 gap-2">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Colors</p>
                                  <p className="text-sm font-semibold text-neon-green">
                                    {match.breakdown?.colorHarmony || 0}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Style</p>
                                  <p className="text-sm font-semibold text-neon-green">
                                    {match.breakdown?.styleConsistency || 0}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Season</p>
                                  <p className="text-sm font-semibold text-neon-green">
                                    {match.breakdown?.seasonality || 0}%
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Versatile</p>
                                  <p className="text-sm font-semibold text-neon-green">
                                    {match.breakdown?.versatility || 0}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Suggestions */}
      {matchData?.data?.suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 border-l-4 border-l-neon-green"
        >
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-green" />
            AI Suggestions
          </h3>
          <p className="text-gray-300">{matchData.data.suggestions.recommendations}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ShopMatch;
