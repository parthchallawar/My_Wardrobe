const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    stylePreferences: [{
      type: String,
      enum: ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam']
    }],
    preferredColors: [{
      type: String
    }],
    avoidColors: [{
      type: String
    }],
    seasons: [{
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter']
    }]
  },
  wardrobeStats: {
    totalItems: { type: Number, default: 0 },
    categories: {
      tops: { type: Number, default: 0 },
      bottoms: { type: Number, default: 0 },
      shoes: { type: Number, default: 0 },
      accessories: { type: Number, default: 0 },
      outerwear: { type: Number, default: 0 },
      dresses: { type: Number, default: 0 }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    startDate: Date,
    validUntil: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
