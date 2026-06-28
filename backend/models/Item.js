const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    default: null
  },
  colors: [{
    hex: {
      type: String,
      required: true,
      description: 'HEX color code (e.g., #FF5733)'
    },
    rgb: {
      r: { type: Number, required: true },
      g: { type: Number, required: true },
      b: { type: Number, required: true }
    },
    percentage: {
      type: Number,
      default: null,
      description: 'Dominance percentage of this color in the image'
    }
  }],
  style: {
    type: String,
    default: null
  },
  patterns: [{
    type: String
  }],
  fabric: {
    type: String,
    default: null
  },

  // --- Image & Status Fields ---
  images: [{
    url: { type: String },
    publicId: { type: String },
    thumbnailUrl: { type: String },
    isPrimary: { type: Boolean, default: false },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    bytes: { type: Number }
  }],
  imageUrl: { type: String },
  imageBase64: { type: String },
  aiAnalyzed: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false },
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date, default: null },
  timeOfDay: { type: String, enum: ['day', 'night', 'both'], default: 'both' },

  // --- User-facing metadata ---
  brand: { type: String, default: null },
  season: [{ type: String }],
  occasion: [{ type: String }],
  tags: [{ type: String }],
  notes: { type: String, default: null },

  // --- Comprehensive AI Extraction Fields ---
  identity: {
    type: { type: String },
    category: { type: String },
    subCategory: { type: String },
    gender_lean: { type: String }
  },

  color: {
    primary: {
      name: String,
      family: String,
      hex: String,
      undertone: String,
      finish: String,
      brightness: String
    },
    secondary: {
      name: String,
      family: String,
      hex: String,
      coverage_percent: Number
    },
    tertiary: { type: Object, default: null },
    isMulticolor: Boolean,
    colorTemperature: String,
    dominantFamily: String,
    neutralCompatible: Boolean
  },

  pattern: {
    type: { type: String },
    scale: String,
    direction: String,
    density: String,
    isPatternBusy: Boolean,
    patternContrast: String
  },

  fit: {
    silhouette: String,
    fit_type: String,
    waist_definition: String,
    taper: String,
    bodyHug: String
  },

  construction: {
    fabric: String,
    fabricWeight: String,
    stretch: String,
    transparency: String,
    texture: String,
    lining: Boolean,
    sheen: String
  },

  dimensions: {
    length: String,
    sleeve: String,
    neckline: String,
    hemType: String,
    cuffs: String
  },

  styling: {
    style: String,
    formalityScore: Number,
    aesthetic: [String],
    trend: [String],
    occasion: [String],
    season: [String],
    layerable: Boolean,
    layerPosition: String
  },

  matching: {
    matchTags: [String],
    pairsWellWith: {
      bottoms: [String],
      outerwear: [String],
      footwear: [String],
      avoid: [String]
    },
    colorHarmony: {
      complementary: [String],
      clashes: [String],
      neutral_safe: Boolean
    },
    versatilityScore: Number,
    outfitRole: String
  },

  condition: {
    estimatedWear: String,
    careSymbols: [String]
  },

  confidence: {
    overall: Number,
    color: Number,
    fabric: Number,
    fit: Number,
    pattern: Number,
    needsUserReview: [String]
  },

  // --- Legacy AI features (for rule-based engine) ---
  aiFeatures: {
    colorAnalysis: {
      warm: Number,
      cool: Number,
      neutral: Number
    },
    compatibilityScore: Number,
    trendingScore: Number,
    versatilityScore: Number
  }
}, {
  timestamps: true,
  strict: false // Allow AI fields that may not be pre-defined
});

// Index for faster queries
itemSchema.index({ user: 1, category: 1 });
itemSchema.index({ user: 1, style: 1 });
itemSchema.index({ user: 1, 'aiFeatures.compatibilityScore': -1 });

module.exports = mongoose.model('Item', itemSchema);