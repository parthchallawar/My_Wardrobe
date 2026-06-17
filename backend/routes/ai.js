const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const WardrobeAI = require('../utils/wardrobeAI');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/ai/shop-match
 * @desc    Get matching combinations for a new item being shopped
 * @access  Private
 */
router.post('/shop-match', authMiddleware, async (req, res) => {
  try {
    const { newItem } = req.body;

    if (!newItem || !newItem.category || !newItem.colors) {
      return res.status(400).json({ error: 'Invalid item data. Category and colors are required.' });
    }

    // Get user's wardrobe
    const wardrobeItems = await Item.find({ user: req.user.id, isAvailable: true });

    // Get user preferences
    const user = await User.findById(req.user.id);
    const userPreferences = user?.preferences || {};

    // Generate combinations
    const combinations = WardrobeAI.generateShoppingCombinations(
      newItem,
      wardrobeItems,
      userPreferences
    );

    // Group combinations by category
    const groupedCombinations = combinations.reduce((acc, combo) => {
      if (!acc[combo.category]) {
        acc[combo.category] = [];
      }
      acc[combo.category].push(combo);
      return acc;
    }, {});

    // Get missing categories
    const wardrobeCategories = [...new Set(wardrobeItems.map(i => i.category))];
    const requiredCategories = ['tops', 'bottoms', 'shoes'];
    const missingCategories = requiredCategories.filter(cat =>
      !wardrobeCategories.includes(cat) && cat !== newItem.category
    );

    const suggestions = missingCategories.length > 0 ? {
      recommendations: `Consider adding ${missingCategories.join(', ')} to complete more outfits`,
      missingCategories
    } : null;

    res.json({
      newItem,
      combinations,
      groupedCombinations,
      wardrobeStats: {
        totalItems: wardrobeItems.length,
        categories: wardrobeCategories
      },
      suggestions
    });
  } catch (error) {
    console.error('Shop match error:', error);
    res.status(500).json({ error: 'Server error generating shop matches' });
  }
});

/**
 * @route   POST /api/ai/match-items
 * @desc    Find matching items for specific items in your wardrobe
 * @access  Private
 */
router.post('/match-items', authMiddleware, async (req, res) => {
  try {
    const { itemIds, limit = 10 } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'Item IDs are required' });
    }

    // Get target items
    const targetItems = await Item.find({
      _id: { $in: itemIds },
      user: req.user.id
    });

    if (targetItems.length === 0) {
      return res.status(404).json({ error: 'No items found' });
    }

    // Get all other items in wardrobe
    const wardrobeItems = await Item.find({
      user: req.user.id,
      _id: { $nin: itemIds },
      isAvailable: true
    });

    const matches = targetItems.map(targetItem => ({
      targetItem,
      matches: WardrobeAI.findMatchesForItem(targetItem, wardrobeItems, limit)
    }));

    res.json({ matches });
  } catch (error) {
    console.error('Match items error:', error);
    res.status(500).json({ error: 'Server error finding matches' });
  }
});

/**
 * @route   POST /api/ai/analyze-outfits
 * @desc    Analyze potential outfit combinations
 * @access  Private
 */
router.post('/analyze-outfits', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length < 2) {
      return res.status(400).json({ error: 'At least 2 items are required for analysis' });
    }

    // Get item details
    const itemIds = items.map(i => i._id);
    const wardrobeItems = await Item.find({
      _id: { $in: itemIds },
      user: req.user.id
    });

    if (wardrobeItems.length === 0) {
      return res.status(404).json({ error: 'No valid items found' });
    }

    // Calculate scores
    const scores = WardrobeAI.calculateOutfitScore(wardrobeItems);

    // Get detailed analysis
    const colors = wardrobeItems.flatMap(item => {
      // Prefer colorAnalysis.primary.name (new AI format), fallback to colors[0].hex (legacy)
      if (item.colorAnalysis?.primary?.name) return [item.colorAnalysis.primary.name];
      if (item.colors?.[0]?.hex) return [WardrobeAI.getColorNameFromHex(item.colors[0].hex) || item.colors[0].hex];
      return [];
    }).filter(Boolean);

    const styles = wardrobeItems.map(item => item.style).filter(Boolean);
    const patterns = wardrobeItems.flatMap(item =>
      item.patterns ? item.patterns : ['none']
    );

    const analysis = {
      ...scores,
      colors: {
        palette: [...new Set(colors)],
        count: colors.length,
        harmony: scores.colorHarmony >= 80 ? 'Excellent' :
                 scores.colorHarmony >= 60 ? 'Good' :
                 scores.colorHarmony >= 40 ? 'Fair' : 'Needs improvement'
      },
      style: {
        consistency: styles.length === 1 ? 'Perfectly matched' :
                    styles.length === 2 ? 'Well blended' : 'Eclectic mix',
        types: [...new Set(styles)]
      },
      patterns: {
        count: patterns.filter(p => p !== 'none' && p !== 'solid').length,
        type: patterns.filter(p => p !== 'none' && p !== 'solid').length <= 2 ?
              'Balanced' : 'Too many patterns'
      },
      tips: WardrobeAI.explainMatch(wardrobeItems[0], wardrobeItems[1], scores)
    };

    res.json({ analysis, items: wardrobeItems });
  } catch (error) {
    console.error('Analyze outfits error:', error);
    res.status(500).json({ error: 'Server error analyzing outfits' });
  }
});

/**
 * @route   GET /api/ai/style-insights
 * @desc    Get style insights and recommendations
 * @access  Private
 */
router.get('/style-insights', authMiddleware, async (req, res) => {
  try {
    const wardrobeItems = await Item.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (wardrobeItems.length === 0) {
      return res.json({ insights: null, message: 'Add items to your wardrobe to get insights' });
    }

    // Category distribution
    const categoryStats = {};
    wardrobeItems.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });

    // Color distribution
    const colorStats = {};
    wardrobeItems.forEach(item => {
      // Prefer colorAnalysis.primary.name (new AI format), fallback to legacy hex-based extraction
      let primaryColor;
      if (item.colorAnalysis?.primary?.name) {
        primaryColor = item.colorAnalysis.primary.name;
      } else if (item.colors?.[0]?.hex) {
        primaryColor = WardrobeAI.getColorNameFromHex(item.colors[0].hex) || item.colors[0].hex;
      }
      if (primaryColor) {
        colorStats[primaryColor] = (colorStats[primaryColor] || 0) + 1;
      }
    });

    // Style distribution
    const styleStats = {};
    wardrobeItems.forEach(item => {
      if (item.style) {
        styleStats[item.style] = (styleStats[item.style] || 0) + 1;
      }
    });

    // Most and least worn items
    const sortedByWear = [...wardrobeItems].sort((a, b) => b.wearCount - a.wearCount);
    const mostWorn = sortedByWear.slice(0, 5);
    const leastWorn = sortedByWear.slice(-5).reverse();

    // Suggestions based on data
    const suggestions = [];

    // Missing categories
    const topCategories = ['tops', 'bottoms', 'shoes', 'accessories'];
    const missingCategories = topCategories.filter(cat => !categoryStats[cat]);
    if (missingCategories.length > 0) {
      suggestions.push(`Consider adding ${missingCategories.join(', ')} to create more outfit combinations`);
    }

    // Color suggestions
    const colorCount = Object.keys(colorStats).length;
    if (colorCount < 3) {
      suggestions.push('Add more variety in colors to create versatile outfits');
    } else if (colorCount > 8) {
      suggestions.push('Focus on a cohesive color palette for easier mixing');
    }

    // Unworn items
    const unwornItems = wardrobeItems.filter(item => item.wearCount === 0);
    if (unwornItems.length > 5) {
      suggestions.push(`You have ${unwornItems.length} unworn items. Try creating outfits with them!`);
    }

    // Style suggestions
    const dominantStyle = Object.entries(styleStats).sort((a, b) => b[1] - a[1])[0];
    if (dominantStyle) {
      suggestions.push(`Your wardrobe leans toward ${dominantStyle[0]} style. Embrace it or explore complementary styles!`);
    }

    const insights = {
      wardrobe: {
        totalItems: wardrobeItems.length,
        totalWears: wardrobeItems.reduce((sum, item) => sum + item.wearCount, 0),
        averageWears: (wardrobeItems.reduce((sum, item) => sum + item.wearCount, 0) / wardrobeItems.length).toFixed(1)
      },
      distribution: {
        byCategory: categoryStats,
        byColor: Object.fromEntries(
          Object.entries(colorStats).sort((a, b) => b[1] - a[1]).slice(0, 10)
        ),
        byStyle: Object.entries(styleStats).sort((a, b) => b[1] - a[1])
      },
      usage: {
        mostWorn,
        leastWorn,
        unwornCount: unwornItems.length
      },
      preferences: user?.preferences || {},
      suggestions
    };

    res.json({ insights });
  } catch (error) {
    console.error('Style insights error:', error);
    res.status(500).json({ error: 'Server error generating insights' });
  }
});

/**
 * @route   POST /api/ai/recommend-purchases
 * @desc    Get purchase recommendations based on wardrobe gaps
 * @access  Private
 */
router.post('/recommend-purchases', authMiddleware, async (req, res) => {
  try {
    const { season, style, budget } = req.body;

    const wardrobeItems = await Item.find({ user: req.user.id });
    const user = await User.findById(req.user.id);

    // Analyze wardrobe gaps
    const categoryCount = {};
    wardrobeItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    // Determine gaps
    const recommendations = [];
    const idealCounts = {
      tops: 8,
      bottoms: 6,
      shoes: 4,
      accessories: 6,
      outerwear: 3,
      dresses: 2
    };

    Object.entries(idealCounts).forEach(([category, ideal]) => {
      const current = categoryCount[category] || 0;
      if (current < ideal) {
        const gap = ideal - current;
        const subCategories = {
          tops: ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie'],
          bottoms: ['jeans', 'trousers', 'shorts'],
          shoes: ['sneakers', 'boots', 'formal'],
          accessories: ['belt', 'watch', 'bag'],
          outerwear: ['jacket', 'coat', 'blazer'],
          dresses: ['casual', 'formal']
        };

        recommendations.push({
          category,
          gap,
          priority: gap >= 3 ? 'high' : gap >= 2 ? 'medium' : 'low',
          suggestions: subCategories[category] || [],
          colors: user?.preferences?.preferredColors || []
        });
      }
    });

    // Color recommendations based on current wardrobe
    const existingColors = [...new Set(
      wardrobeItems.flatMap(item => {
        if (item.colorAnalysis?.primary?.name) return [item.colorAnalysis.primary.name];
        if (item.colors?.[0]?.hex) return [WardrobeAI.getColorNameFromHex(item.colors[0].hex) || item.colors[0].hex];
        return [];
      }).filter(Boolean)
    )];

    const recommendedColors = ['black', 'white', 'navy', 'gray', 'beige']
      .filter(color => !existingColors.includes(color));

    res.json({
      recommendations: recommendations.filter(r => r.gap > 0),
      recommendedColors: recommendedColors.slice(0, 3),
      wardrobeSummary: categoryCount
    });
  } catch (error) {
    console.error('Recommend purchases error:', error);
    res.status(500).json({ error: 'Server error generating recommendations' });
  }
});

/**
 * @route   GET /api/ai/colors
 * @desc    Get available colors and color theory information
 * @access  Private
 */
router.get('/colors', authMiddleware, async (req, res) => {
  try {
    const colors = Object.keys(WardrobeAI.colorWheel).map(color => ({
      name: color,
      ...WardrobeAI.colorWheel[color]
    }));

    const neutralColors = WardrobeAI.fashionRules.neutrals;

    res.json({
      colors,
      neutrals: neutralColors,
      maxColors: WardrobeAI.fashionRules.maxColors,
      maxPatterns: WardrobeAI.fashionRules.maxPatterns
    });
  } catch (error) {
    console.error('Get colors error:', error);
    res.status(500).json({ error: 'Server error fetching colors' });
  }
});

/**
 * @route   GET /api/ai/seasonal-guide
 * @desc    Get seasonal styling guide
 * @access  Private
 */
router.get('/seasonal-guide', authMiddleware, async (req, res) => {
  try {
    const seasonalTips = {
      spring: {
        colors: ['pastels', 'light-greens', 'coral', 'lavender', 'cream'],
        fabrics: ['cotton', 'linen', 'light blends'],
        keyPieces: ['light-jacket', 'cardigan', 'light-sweater'],
        tips: [
          'Layer with light layers for unpredictable weather',
          'Embrace pastel colors for the season',
          'Mix textures for visual interest'
        ]
      },
      summer: {
        colors: ['bright', 'white', 'navy', 'yellow', 'tropical'],
        fabrics: ['cotton', 'linen', 'lightweight synthetics'],
        keyPieces: ['shorts', 't-shirts', 'sandals', 'light-dresses'],
        tips: [
          'Choose breathable fabrics for hot weather',
          'Light colors reflect heat',
          'Accessorize with sunglasses and hats'
        ]
      },
      fall: {
        colors: ['earth-tones', 'burgundy', 'mustard', 'olive', 'brown'],
        fabrics: ['wool blends', 'denim', 'heavier cotton'],
        keyPieces: ['jackets', 'boots', 'sweaters', 'scarves'],
        tips: [
          'Layering is key for changing temperatures',
          'Earth tones complement the season',
          'Add texture with knits and corduroy'
        ]
      },
      winter: {
        colors: ['dark', 'jewel-tones', 'red', 'navy', 'black'],
        fabrics: ['wool', 'cashmere', 'thermal', 'leather'],
        keyPieces: ['coat', 'boots', 'sweaters', 'thermal-layers'],
        tips: [
          'Layer strategically for warmth',
          'Dark colors absorb heat',
          'Invest in quality outerwear'
        ]
      }
    };

    res.json({ seasonalTips });
  } catch (error) {
    console.error('Seasonal guide error:', error);
    res.status(500).json({ error: 'Server error fetching seasonal guide' });
  }
});

module.exports = router;
