const express = require('express');
const Item = require('../models/Item');
const WardrobeAI = require('../utils/wardrobeAI');
const { authMiddleware } = require('../middleware/auth');
const { handleUpload, handleMultipleUpload, deleteImages } = require('../middleware/upload');

const router = express.Router();

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
    }

    // Process colors from FormData
    if (itemData.color) {
      itemData.colors = [{ primary: itemData.color, secondary: itemData.color }];
      delete itemData.color;
    }

    // Process season from FormData
    if (itemData.season) {
      itemData.season = [itemData.season];
    }

    // Process tags from FormData
    if (itemData.tags) {
      itemData.tags = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Calculate AI features
    if (itemData.colors && itemData.colors[0]) {
      const color = WardrobeAI.normalizeColor(itemData.colors[0].primary);
      const colorInfo = WardrobeAI.colorWheel[color];

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

    const item = new Item(itemData);
    await item.save();

    // Update user wardrobe stats
    const User = require('../models/User');
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
    }

    // Process colors from FormData
    if (itemData.color) {
      itemData.colors = [{ primary: itemData.color, secondary: itemData.color }];
      delete itemData.color;
    }

    // Process season from FormData
    if (itemData.season) {
      itemData.season = [itemData.season];
    }

    // Process tags from FormData
    if (itemData.tags) {
      itemData.tags = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Calculate AI features
    if (itemData.colors && itemData.colors[0]) {
      const color = WardrobeAI.normalizeColor(itemData.colors[0].primary);
      const colorInfo = WardrobeAI.colorWheel[color];

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

    const item = new Item(itemData);
    await item.save();

    // Update user wardrobe stats
    const User = require('../models/User');
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
    const User = require('../models/User');
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
    }

    // Process colors from FormData
    if (updateData.color) {
      updateData.colors = [{ primary: updateData.color, secondary: updateData.color }];
      delete updateData.color;
    }

    // Process season from FormData
    if (updateData.season) {
      updateData.season = [updateData.season];
    }

    // Process tags from FormData
    if (updateData.tags) {
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
    }

    // Process colors from FormData
    if (updateData.color) {
      updateData.colors = [{ primary: updateData.color, secondary: updateData.color }];
      delete updateData.color;
    }

    // Process season from FormData
    if (updateData.season) {
      updateData.season = [updateData.season];
    }

    // Process tags from FormData
    if (updateData.tags) {
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

    // Process colors if sent as color field
    if (updateData.color) {
      updateData.colors = [{ primary: updateData.color, secondary: updateData.color }];
      delete updateData.color;
    }

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
      { new: true, runValidators: true }
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
    const User = require('../models/User');
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

/**
 * @route   GET /api/items/statistics/summary
 * @desc    Get wardrobe statistics summary
 * @access  Private
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

module.exports = router;
