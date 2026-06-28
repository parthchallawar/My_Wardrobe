const mongoose = require('mongoose');

const wearLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
    },
    outfit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit',
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    timeOfDay: {
      type: String,
      enum: ['day', 'night', 'both'],
      default: 'both',
    },
    occasion: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for user calendar queries
wearLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WearLog', wearLogSchema);
