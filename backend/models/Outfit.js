const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    type: {
      type: String,
      enum: ['top', 'bottom', 'shoes', 'accessory', 'layer', 'dress']
    }
  }],
  season: {
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all-season'],
    default: 'all-season'
  },
  occasion: {
    type: String,
    enum: ['everyday', 'work', 'party', 'formal', 'casual', 'sport', 'date', 'travel'],
    default: 'everyday'
  },
  style: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam'],
    default: 'casual'
  },
  colorScheme: {
    primary: { type: String, default: null },
    secondary: { type: String, default: null },
    accent: { type: String, default: null }
  },
  aiScore: {
    overallMatch: { type: Number, default: 80 },
    colorHarmony: { type: Number, default: 80 },
    styleConsistency: { type: Number, default: 80 },
    seasonality: { type: Number, default: 100 },
    versatility: { type: Number, default: 75 }
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'user', 'hybrid'],
    default: 'ai'
  },
  timeOfDay: { type: String, enum: ['day', 'night', 'both'], default: 'both' },
  isFavorite: { type: Boolean, default: false },
  wornCount: { type: Number, default: 0 },
  lastWorn: { type: Date, default: null },
  notes: { type: String, default: null }
}, {
  timestamps: true
});

// Index for faster queries
outfitSchema.index({ user: 1, season: 1 });
outfitSchema.index({ user: 1, occasion: 1 });
outfitSchema.index({ user: 1, 'aiScore.overallMatch': -1 });

module.exports = mongoose.model('Outfit', outfitSchema);
