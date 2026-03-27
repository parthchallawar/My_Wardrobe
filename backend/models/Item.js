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
    primary: { type: String, required: true },
    secondary: { type: String, default: null },
    tertiary: { type: String, default: null }
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
  brand: { type: String, default: null },
  size: { type: String, default: null },
  season: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'all-season']
  }],
  occasion: [{
    type: String,
    enum: ['everyday', 'work', 'party', 'formal', 'casual', 'sport', 'date', 'travel']
  }],
  price: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  purchaseDate: { type: Date, default: null },
  // Cloudinary images - stores array of image objects
  images: [{
    url: {
      type: String,
      required: true,
      description: 'Cloudinary URL of the image'
    },
    publicId: {
      type: String,
      required: true,
      description: 'Cloudinary public ID for deletion'
    },
    isPrimary: {
      type: Boolean,
      default: false,
      description: 'Mark as primary image'
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
    },
    format: {
      type: String,
      default: null
    },
    bytes: {
      type: Number,
      default: null
    }
  }],
  tags: [String],
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date, default: null },
  isFavorite: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  notes: { type: String, default: null },
  aiFeatures: {
    colorAnalysis: {
      warm: { type: Number, default: 0 },
      cool: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 }
    },
    compatibilityScore: { type: Number, default: 80 },
    trendingScore: { type: Number, default: 70 },
    versatilityScore: { type: Number, default: 75 }
  }
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
