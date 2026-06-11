const express = require('express');
const Item = require('../models/Item');
const Outfit = require('../models/Outfit');
const WardrobeAI = require('../utils/wardrobeAI');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/outfits
 * @desc    Get all outfits for a user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { season, occasion, style, isFavorite, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user.id };

    if (season) filter.season = season;
    if (occasion) filter.occasion = occasion;
    if (style) filter.style = style;
    if (isFavorite === 'true') filter.isFavorite = true;

    const total = await Outfit.countDocuments(filter);
    const outfits = await Outfit.find(filter)
      .populate('items.item')
      .sort({ aiScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      outfits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOutfits: total
      }
    });
  } catch (error) {
    console.error('Get outfits error:', error);
    res.status(500).json({ error: 'Server error fetching outfits' });
  }
});

/**
 * @route   GET /api/outfits/:id
 * @desc    Get a single outfit
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.item');

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json({ outfit });
  } catch (error) {
    console.error('Get outfit error:', error);
    res.status(500).json({ error: 'Server error fetching outfit' });
  }
});

/**
 * @route   POST /api/outfits
 * @desc    Create a new outfit
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, items, season, occasion, style, notes } = req.body;

    // Validate that all items belong to the user
    const itemIds = items.map(i => i.item);
    const userItems = await Item.find({
      _id: { $in: itemIds },
      user: req.user.id
    });

    if (userItems.length !== itemIds.length) {
      return res.status(400).json({ error: 'Some items not found or do not belong to you' });
    }

    // Populate item details for AI scoring
    const itemsWithDetails = items.map(outfitItem => ({
      ...userItems.find(item => item._id.toString() === outfitItem.item.toString()),
      ...outfitItem
    }));

    // Calculate AI scores
    const aiScore = WardrobeAI.calculateOutfitScore(itemsWithDetails);

    // Determine color scheme
    const colors = itemsWithDetails.flatMap(item =>
      item.colors ? [item.colors[0]?.primary] : []
    ).filter(Boolean);

    const colorScheme = {
      primary: colors[0] || 'black',
      secondary: colors[1] || null,
      accent: colors[2] || null
    };

    const outfit = new Outfit({
      user: req.user.id,
      name,
      items,
      season,
      occasion,
      style,
      colorScheme,
      aiScore,
      generatedBy: 'user',
      notes
    });

    await outfit.save();
    await outfit.populate('items.item');

    res.status(201).json({
      outfit,
      message: 'Outfit created successfully'
    });
  } catch (error) {
    console.error('Create outfit error:', error);
    res.status(500).json({ error: 'Server error creating outfit' });
  }
});

/**
 * @route   PUT /api/outfits/:id
 * @desc    Update an outfit
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id });

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // If items are updated, recalculate AI score
    if (req.body.items) {
      const itemIds = req.body.items.map(i => i.item);
      const userItems = await Item.find({
        _id: { $in: itemIds },
        user: req.user.id
      });

      const itemsWithDetails = req.body.items.map(outfitItem => ({
        ...userItems.find(item => item._id.toString() === outfitItem.item.toString()),
        ...outfitItem
      }));

      req.body.aiScore = WardrobeAI.calculateOutfitScore(itemsWithDetails);
    }

    Object.assign(outfit, req.body);
    await outfit.save();
    await outfit.populate('items.item');

    res.json({ outfit, message: 'Outfit updated successfully' });
  } catch (error) {
    console.error('Update outfit error:', error);
    res.status(500).json({ error: 'Server error updating outfit' });
  }
});

/**
 * @route   DELETE /api/outfits/:id
 * @desc    Delete an outfit
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({ error: 'Server error deleting outfit' });
  }
});

/**
 * @route   POST /api/outfits/:id/favorite
 * @desc    Toggle outfit favorite status
 * @access  Private
 */
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id });

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();

    res.json({ outfit, message: 'Favorite status updated' });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Server error updating favorite status' });
  }
});

/**
 * @route   POST /api/outfits/:id/wear
 * @desc    Record when an outfit was worn
 * @access  Private
 */
router.post('/:id/wear', authMiddleware, async (req, res) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user.id });

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // Update outfit wear count
    outfit.wornCount = (outfit.wornCount || 0) + 1;
    outfit.lastWorn = new Date();

    // Update wear count for all items in the outfit
    await Item.updateMany(
      { _id: { $in: outfit.items.map(i => i.item) } },
      {
        $inc: { wearCount: 1 },
        $set: { lastWorn: new Date() }
      }
    );

    await outfit.save();
    await outfit.populate('items.item');

    res.json({ outfit, message: 'Wear recorded' });
  } catch (error) {
    console.error('Record wear error:', error);
    res.status(500).json({ error: 'Server error recording wear' });
  }
});

/**
 * @route   POST /api/outfits/generate
 * @desc    Generate AI outfit suggestions
 * @access  Private
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { season, occasion, style, limit = 10 } = req.body;

    // Get all user items
    const wardrobeItems = await Item.find({ user: req.user.id, isAvailable: true });

    if (wardrobeItems.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 items in your wardrobe to generate outfits' });
    }

    const options = {
      season: season || 'all-season',
      occasion: occasion || 'everyday',
      style,
      limit
    };

    const suggestions = WardrobeAI.generateOutfitSuggestions(wardrobeItems, options);

    // Convert suggestions to outfit format
    const generatedOutfits = suggestions.map((suggestion, index) => {
      const colors = suggestion.items.flatMap(item =>
        item.colors ? [item.colors[0]?.primary] : []
      ).filter(Boolean);

      return {
        name: `AI Generated Outfit ${index + 1}`,
        items: suggestion.items.map(item => ({ item: item._id, type: item.category })),
        season: options.season,
        occasion: options.occasion,
        style: suggestion.items[0]?.style || 'casual',
        colorScheme: {
          primary: colors[0] || 'black',
          secondary: colors[1] || null,
          accent: colors[2] || null
        },
        aiScore: suggestion.score,
        generatedBy: 'ai'
      };
    });

    res.json({
      suggestions: generatedOutfits,
      total: generatedOutfits.length
    });
  } catch (error) {
    console.error('Generate outfits error:', error);
    res.status(500).json({ error: 'Server error generating outfits' });
  }
});

module.exports = router;
