const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const WardrobeAI = require('../utils/wardrobeAI');
const authMiddleware = require('../middleware/auth');
const { handleUpload, handleMultipleUpload, deleteImages } = require('../middleware/upload');
const { detectColors, detectColorsFromMultipleImages } = require('../utils/colorDetection');

const router = express.Router();

/**
 * Helper: merge aiData into itemData, populating both deep AI fields
 * and auto-filling top-level category/style/fabric/patterns/season/occasion
 */
function mergeAiData(itemData) {
  if (!itemData.aiData) return;

  try {
    const aiDataObj = typeof itemData.aiData === 'string' ? JSON.parse(itemData.aiData) : itemData.aiData;

    // Map AI response keys to schema fields
    itemData.identity = aiDataObj.identity;
    
    // Sanitize color to ensure it matches the schema object structure
    if (aiDataObj.color) {
      if (typeof aiDataObj.color === 'string') {
        itemData.color = {
          primary: {
            name: aiDataObj.color,
            hex: '#000000',
            family: 'neutral'
          }
        };
      } else {
        itemData.color = aiDataObj.color;
      }
    }
    
    // Sanitize pattern to ensure it matches the schema object structure (preventing String-to-Object CastError)
    if (aiDataObj.pattern) {
      if (typeof aiDataObj.pattern === 'string') {
        itemData.pattern = {
          type: aiDataObj.pattern
        };
      } else {
        itemData.pattern = aiDataObj.pattern;
      }
    }

    itemData.fit = aiDataObj.fit;
    itemData.construction = aiDataObj.construction;
    itemData.dimensions = aiDataObj.dimensions;
    itemData.styling = aiDataObj.styling;
    itemData.matching = aiDataObj.matching;
    itemData.condition = aiDataObj.condition;
    itemData.confidence = aiDataObj.confidence;

    // Auto-populate top-level fields from AI analysis if not explicitly provided
    if (aiDataObj.identity?.category && !itemData.category) {
      itemData.category = aiDataObj.identity.category;
    }
    if (aiDataObj.identity?.subCategory && !itemData.subCategory) {
      itemData.subCategory = aiDataObj.identity.subCategory;
    }
    if (aiDataObj.identity?.type && !itemData.name) {
      // Use AI-detected type as the item name if none provided
      itemData.name = aiDataObj.identity.type.charAt(0).toUpperCase() + aiDataObj.identity.type.slice(1);
    }
    if (aiDataObj.styling?.style && !itemData.style) {
      itemData.style = aiDataObj.styling.style;
    }
    if (aiDataObj.construction?.fabric && !itemData.fabric) {
      itemData.fabric = aiDataObj.construction.fabric;
    }
    if (aiDataObj.pattern?.type) {
      // Only set patterns from AI if user didn't provide any
      if (!itemData.patterns || itemData.patterns.length === 0) {
        itemData.patterns = [aiDataObj.pattern.type];
      }
    }
    if (aiDataObj.styling?.season && aiDataObj.styling.season.length > 0) {
      // Only set season from AI if user didn't provide any
      if (!itemData.season || itemData.season.length === 0) {
        itemData.season = aiDataObj.styling.season;
      }
    }
    if (aiDataObj.styling?.occasion && aiDataObj.styling.occasion.length > 0) {
      // Only set occasion from AI if user didn't provide any
      if (!itemData.occasion || itemData.occasion.length === 0) {
        itemData.occasion = aiDataObj.styling.occasion;
      }
    }
    if (aiDataObj.matching?.matchTags) {
      // Merge AI match tags into item tags if not already present
      if (!itemData.tags || itemData.tags.length === 0) {
        itemData.tags = aiDataObj.matching.matchTags;
      }
    }

    // Mark as AI-analyzed
    itemData.aiAnalyzed = true;

    delete itemData.aiData;
  } catch (e) {
    console.error('Failed to parse aiData:', e);
  }
}

/**
 * @route   GET /api/items
 * @desc    Get all items for a user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      category,
      style,
      season,
      color,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (style) filter.style = style;
    if (season) filter.season = season;
    if (color) filter['colors.primary'] = color;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error fetching items' });
  }
});

/**
 * @route   GET /api/items/statistics/summary
 * @desc    Get wardrobe statistics summary
 * @access  Private
 * NOTE: This route MUST come before /:id to avoid route shadowing
 */
router.get('/statistics/summary', authMiddleware, async (req, res) => {
  try {
    const stats = await Item.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalWears: { $sum: '$wearCount' },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          categoryBreakdown: {
            $push: {
              category: '$category',
              count: 1
            }
          }
        }
      }
    ]);

    const categoryStats = await Item.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      summary: stats[0] || { totalItems: 0, totalWears: 0, favorites: 0 },
      categoryStats,
      topCategories: categoryStats.slice(0, 5)
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
});

/**
 * @route   POST /api/items/with-image
 * @desc    Create a new wardrobe item with single image upload
 * @access  Private
 */
router.post('/with-image', authMiddleware, handleUpload, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      user: String(req.user.id)
    };

    // Remove manual color input - colors are auto-detected from image
    delete itemData.color;
    delete itemData.colors;

    // Add image if uploaded (Cloudinary stores it in req.file)
    if (req.file) {
      itemData.images = [{
        url: req.file.path, // Cloudinary URL
        publicId: req.file.filename, // Cloudinary public ID
        isPrimary: true,
        width: req.file.width,
        height: req.file.height,
        format: req.file.format,
        bytes: req.file.size
      }];

      // Auto-detect colors from uploaded image
      try {
        const detectedColors = await detectColors(req.file.path, 5);
        itemData.colors = detectedColors;
      } catch (colorError) {
        console.error('Color detection error:', colorError.message);
        itemData.colors = [];
      }
    }

    // Process season from FormData
    if (itemData.season && typeof itemData.season === 'string') {
      itemData.season = [itemData.season];
    }

    // Process tags from FormData
    if (itemData.tags && typeof itemData.tags === 'string') {
      itemData.tags = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Calculate AI features from detected colors
    if (itemData.colors && itemData.colors.length > 0) {
      const primaryColor = itemData.colors[0];
      const colorInfo = WardrobeAI.getColorInfoFromHex(primaryColor.hex);

      if (colorInfo) {
        itemData.aiFeatures = {
          colorAnalysis: {
            warm: colorInfo.temperature === 'warm' ? 0.9 : colorInfo.temperature === 'cool' ? 0.1 : 0.5,
            cool: colorInfo.temperature === 'cool' ? 0.9 : colorInfo.temperature === 'warm' ? 0.1 : 0.5,
            neutral: colorInfo.temperature === 'neutral' ? 1 : 0.2
          },
          compatibilityScore: 80,
          trendingScore: 70,
          versatilityScore: 75
        };
      }
    }

    // Merge AI data and auto-populate top-level fields
    mergeAiData(itemData);

    const item = new Item(itemData);
    await item.save();

    // Update user wardrobe stats
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wardrobeStats.totalItems': 1 } }
    );

    // Find matches for the new item
    const wardrobeItems = await Item.find({ user: String(req.user.id), _id: { $ne: item._id } });
    const matches = WardrobeAI.findMatchesForItem(item, wardrobeItems, 10);

    res.status(201).json({
      item,
      matches,
      message: 'Item added to wardrobe successfully'
    });
  } catch (error) {
    console.error('Create item with image error:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
});

/**
 * @route   POST /api/items/with-images
 * @desc    Create a new wardrobe item with multiple image uploads
 * @access  Private
 */
router.post('/with-images', authMiddleware, handleMultipleUpload, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      user: String(req.user.id)
    };

    // Remove manual color input - colors are auto-detected from images
    delete itemData.color;
    delete itemData.colors;

    // Add images if uploaded (Cloudinary stores them in req.files)
    if (req.files && req.files.length > 0) {
      itemData.images = req.files.map((file, index) => ({
        url: file.path, // Cloudinary URL
        publicId: file.filename, // Cloudinary public ID
        isPrimary: index === 0, // First image is primary by default
        width: file.width,
        height: file.height,
        format: file.format,
        bytes: file.size
      }));

      // Auto-detect colors from uploaded images
      try {
        const imageUrls = req.files.map(file => file.path);
        const detectedColors = await detectColorsFromMultipleImages(imageUrls, 5);
        itemData.colors = detectedColors;
      } catch (colorError) {
        console.error('Color detection error:', colorError.message);
        itemData.colors = [];
      }
    }

    // Process season from FormData
    if (itemData.season && typeof itemData.season === 'string') {
      itemData.season = [itemData.season];
    }

    // Process tags from FormData
    if (itemData.tags && typeof itemData.tags === 'string') {
      itemData.tags = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Calculate AI features from detected colors
    if (itemData.colors && itemData.colors.length > 0) {
      const primaryColor = itemData.colors[0];
      const colorInfo = WardrobeAI.getColorInfoFromHex(primaryColor.hex);

      if (colorInfo) {
        itemData.aiFeatures = {
          colorAnalysis: {
            warm: colorInfo.temperature === 'warm' ? 0.9 : colorInfo.temperature === 'cool' ? 0.1 : 0.5,
            cool: colorInfo.temperature === 'cool' ? 0.9 : colorInfo.temperature === 'warm' ? 0.1 : 0.5,
            neutral: colorInfo.temperature === 'neutral' ? 1 : 0.2
          },
          compatibilityScore: 80,
          trendingScore: 70,
          versatilityScore: 75
        };
      }
    }

    // Merge AI data and auto-populate top-level fields
    mergeAiData(itemData);

    const item = new Item(itemData);
    await item.save();

    // Update user wardrobe stats
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wardrobeStats.totalItems': 1 } }
    );

    // Find matches for the new item
    const wardrobeItems = await Item.find({ user: String(req.user.id), _id: { $ne: item._id } });
    const matches = WardrobeAI.findMatchesForItem(item, wardrobeItems, 10);

    res.status(201).json({
      item,
      matches,
      message: 'Item added to wardrobe successfully'
    });
  } catch (error) {
    console.error('Create item with images error:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Get a single item
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Server error fetching item' });
  }
});

/**
 * @route   POST /api/items
 * @desc    Create a new wardrobe item (without image)
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      user: req.user.id
    };

    const item = new Item(itemData);
    await item.save();

    // Update user wardrobe stats
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wardrobeStats.totalItems': 1 } }
    );

    // Find matches for the new item
    const wardrobeItems = await Item.find({ user: String(req.user.id), _id: { $ne: item._id } });
    const matches = WardrobeAI.findMatchesForItem(item, wardrobeItems, 10);

    res.status(201).json({
      item,
      matches,
      message: 'Item added to wardrobe successfully'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server error creating item' });
  }
});

/**
 * @route   PUT /api/items/:id/with-image
 * @desc    Update an item with single image upload
 * @access  Private
 */
router.put('/:id/with-image', authMiddleware, handleUpload, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updateData = { ...req.body };

    // Remove manual color input - colors are auto-detected from image
    delete updateData.color;
    delete updateData.colors;

    // Update image if uploaded
    if (req.file) {
      // Delete old images from Cloudinary
      if (item.images && item.images.length > 0) {
        const oldPublicIds = item.images.map(img => img.publicId);
        if (oldPublicIds.length > 0) {
          try {
            await deleteImages(oldPublicIds);
          } catch (err) {
            console.error('Error deleting old images:', err);
          }
        }
      }

      // Add new image
      updateData.images = [{
        url: req.file.path,
        publicId: req.file.filename,
        isPrimary: true,
        width: req.file.width,
        height: req.file.height,
        format: req.file.format,
        bytes: req.file.size
      }];

      // Auto-detect colors from uploaded image
      try {
        const detectedColors = await detectColors(req.file.path, 5);
        updateData.colors = detectedColors;
      } catch (colorError) {
        console.error('Color detection error:', colorError.message);
        updateData.colors = [];
      }
    }

    // Process season from FormData
    if (updateData.season && typeof updateData.season === 'string') {
      updateData.season = [updateData.season];
    }

    // Process tags from FormData
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Update the item
    Object.assign(item, updateData);
    await item.save();

    res.json({ item, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item with image error:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
});

/**
 * @route   PUT /api/items/:id/with-images
 * @desc    Update an item with multiple image uploads
 * @access  Private
 */
router.put('/:id/with-images', authMiddleware, handleMultipleUpload, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updateData = { ...req.body };

    // Remove manual color input - colors are auto-detected from images
    delete updateData.color;
    delete updateData.colors;

    // Update images if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (item.images && item.images.length > 0) {
        const oldPublicIds = item.images.map(img => img.publicId);
        if (oldPublicIds.length > 0) {
          try {
            await deleteImages(oldPublicIds);
          } catch (err) {
            console.error('Error deleting old images:', err);
          }
        }
      }

      // Add new images
      updateData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0,
        width: file.width,
        height: file.height,
        format: file.format,
        bytes: file.size
      }));

      // Auto-detect colors from uploaded images
      try {
        const imageUrls = req.files.map(file => file.path);
        const detectedColors = await detectColorsFromMultipleImages(imageUrls, 5);
        updateData.colors = detectedColors;
      } catch (colorError) {
        console.error('Color detection error:', colorError.message);
        updateData.colors = [];
      }
    }

    // Process season from FormData
    if (updateData.season && typeof updateData.season === 'string') {
      updateData.season = [updateData.season];
    }

    // Process tags from FormData
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Update the item
    Object.assign(item, updateData);
    await item.save();

    res.json({ item, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item with images error:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
});

/**
 * @route   PUT /api/items/:id
 * @desc    Update an item
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Colors are auto-detected from images - remove any manual color input
    delete updateData.color;
    delete updateData.colors;

    // Process season if sent as string
    if (updateData.season && typeof updateData.season === 'string') {
      updateData.season = [updateData.season];
    }

    // Process tags if sent as comma-separated string
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: false }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error updating item' });
  }
});

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an item
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete images from Cloudinary
    if (item.images && item.images.length > 0) {
      const publicIds = item.images.map(img => img.publicId);
      if (publicIds.length > 0) {
        try {
          await deleteImages(publicIds);
        } catch (err) {
          console.error('Error deleting images from Cloudinary:', err);
        }
      }
    }

    await Item.deleteOne({ _id: item._id });

    // Update user wardrobe stats
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wardrobeStats.totalItems': -1 } }
    );

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error deleting item' });
  }
});

/**
 * @route   POST /api/items/:id/favorite
 * @desc    Toggle favorite status
 * @access  Private
 */
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({ item, message: 'Favorite status updated' });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Server error updating favorite status' });
  }
});

/**
 * @route   POST /api/items/:id/wear
 * @desc    Record wear
 * @access  Private
 */
router.post('/:id/wear', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.wearCount = item.wearCount + 1;
    item.lastWorn = new Date();
    await item.save();

    res.json({ item, message: 'Wear recorded successfully' });
  } catch (error) {
    console.error('Record wear error:', error);
    res.status(500).json({ error: 'Server error recording wear' });
  }
});

module.exports = router;