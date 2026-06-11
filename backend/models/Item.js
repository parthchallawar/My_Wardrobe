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
    required: true,
    enum: ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'dresses']
  },
  subCategory: {
    type: String,
    enum: [
      // Tops
      't-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'jacket', 'polo', 'tank-top',
      // Bottoms
      'jeans', 'trousers', 'shorts', 'skirt', 'leggings', 'chinos',
      // Shoes
      'sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers',
      // Accessories
      'belt', 'hat', 'scarf', 'jewelry', 'bag', 'watch', 'sunglasses', 'tie',
      // Outerwear
      'coat', 'blazer', 'denim-jacket', 'cardigan',
      // Dresses
      'casual', 'formal', 'cocktail', 'summer', 'winter', 'maxi', 'midi', 'mini'
    ],
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
    enum: ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam']
  },
  patterns: [{
    type: String,
    enum: ['solid', 'striped', 'plaid', 'floral', 'geometric', 'animal-print', 'polka-dot', 'checkered', 'none']
  }],
  fabric: {
    type: String,
    enum: ['cotton', 'polyester', 'denim', 'wool', 'silk', 'linen', 'leather', 'synthetic', 'blend']
  },
  
  // --- Comprehensive AI Extraction Fields ---
  imageUrl: { type: String },
  imageBase64: { type: String },
  aiAnalyzed: { type: Boolean, default: false },
  
  identity: {
    type: { type: String },
    category: { type: String },
    subCategory: { type: String },
    gender_lean: { type: String }
  },
  
  colorAnalysis: {
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
  
  patternAnalysis: {
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
  }
  // ------------------------------------------
}, {
  timestamps: true
});

// Index for faster queries
itemSchema.index({ user: 1, category: 1 });
itemSchema.index({ user: 1, colors: 1 });
itemSchema.index({ user: 1, style: 1 });
itemSchema.index({ user: 1, 'aiFeatures.compatibilityScore': -1 });
itemSchema.index({ 'images.publicId': 1 });

module.exports = mongoose.model('Item', itemSchema);
