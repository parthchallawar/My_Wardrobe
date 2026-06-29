const express = require('express');
const Item = require('../models/Item');
const Outfit = require('../models/Outfit');
const User = require('../models/User');
const WardrobeAI = require('../utils/wardrobeAI');
const authMiddleware = require('../middleware/auth');
const WearLog = require('../models/WearLog');

const router = express.Router();

/**
 * Derive a clothing season from the current temperature (°C). Falls back to the
 * calendar month when no temperature is supplied (e.g. geolocation denied).
 */
function deriveSeason(tempC) {
  if (typeof tempC !== 'number' || Number.isNaN(tempC)) {
    const m = new Date().getMonth();
    if ([11, 0, 1].includes(m)) return 'winter';
    if ([2, 3, 4].includes(m)) return 'spring';
    if ([5, 6, 7].includes(m)) return 'summer';
    return 'fall';
  }
  if (tempC < 8) return 'winter';
  if (tempC < 16) return 'fall';
  if (tempC < 24) return 'spring';
  return 'summer';
}

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
    const { name, items, season, occasion, style, notes, weather, timeOfDay } = req.body;

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
      trendReasons: Array.isArray(aiScore.trendReasons) ? aiScore.trendReasons.slice(0, 4) : [],
      timeOfDay: ['day', 'night', 'both'].includes(timeOfDay) ? timeOfDay : 'both',
      weather: weather && typeof weather === 'object'
        ? { tempC: weather.tempC ?? null, condition: weather.condition || null, city: weather.city || null }
        : undefined,
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

    // Create WearLog entry for history/calendar
    const { timeOfDay, occasion, notes, date } = req.body || {};
    await WearLog.create({
      user: req.user.id,
      outfit: outfit._id,
      date: date ? new Date(date) : outfit.lastWorn,
      timeOfDay: timeOfDay || 'both',
      occasion: occasion || null,
      notes: notes || null,
    });

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
    const { season, occasion, style, timeOfDay, limit = 12 } = req.body;

    // Get all user items
    const wardrobeItems = await Item.find({ user: req.user.id, isAvailable: true });

    if (wardrobeItems.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 items in your wardrobe to generate outfits' });
    }

    const user = await require('../models/User').findById(req.user.id).select('preferences').lean();
    const options = {
      season: season || 'all-season',
      occasion: occasion || 'everyday',
      style,
      timeOfDay: timeOfDay || null,
      limit,
      userPrefs: user?.preferences || null
    };

    const suggestions = WardrobeAI.generateOutfitSuggestions(wardrobeItems, options);

    // Map plural category names to Outfit schema enum values
    const categoryToType = {
      tops: 'top', bottoms: 'bottom', shoes: 'shoes',
      accessories: 'accessory', outerwear: 'layer', dresses: 'dress',
      traditional: 'top', kurta: 'top', sarees: 'dress', lehenga: 'dress'
    };

    const validStyles = ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage', 'streetwear', 'glam'];
    const safeNum = (val, fallback = 80) => {
      const n = Number(val);
      return isNaN(n) ? fallback : Math.round(Math.min(100, Math.max(0, n)));
    };

    // Track names so duplicates within a batch get a distinguishing suffix
    const nameCounts = {};
    const uniqueName = (base) => {
      nameCounts[base] = (nameCounts[base] || 0) + 1;
      return nameCounts[base] === 1 ? base : `${base} ${nameCounts[base]}`;
    };

    // Convert suggestions to outfit format
    const generatedOutfits = suggestions.map((suggestion, index) => {
      const colors = suggestion.items.flatMap(item =>
        item.colors ? [item.colors[0]?.primary] : []
      ).filter(Boolean);

      const rawStyle = suggestion.items[0]?.style || 'casual';
      const style = validStyles.includes(rawStyle) ? rawStyle : 'casual';
      const bd = suggestion.breakdown || {};

      const baseName = WardrobeAI.nameOutfit(suggestion.items, bd, {
        season: options.season,
        occasion: options.occasion,
        timeOfDay: options.timeOfDay
      });

      return {
        name: uniqueName(baseName),
        items: suggestion.items.map(item => ({
          item: item._id,
          type: categoryToType[item.category] || 'top'
        })),
        season: options.season,
        occasion: options.occasion,
        style,
        colorScheme: {
          primary: colors[0] || 'black',
          secondary: colors[1] || null,
          accent: colors[2] || null
        },
        aiScore: {
          overallMatch: safeNum(bd.overallMatch),
          colorHarmony: safeNum(bd.colorHarmony),
          styleConsistency: safeNum(bd.styleConsistency),
          seasonality: safeNum(bd.seasonality, 100),
          versatility: safeNum(bd.versatility, 75),
          trendScore: safeNum(bd.trendScore, 0),
          bestScore: safeNum(bd.bestScore, 0)
        },
        trendReasons: Array.isArray(bd.trendReasons) ? bd.trendReasons.slice(0, 4) : [],
        generatedBy: 'ai',
        timeOfDay: options.timeOfDay || 'both'
      };
    });

    // Replace the previous AI-generated batch so the list reflects the latest run
    // instead of accumulating stale duplicates. User-created/favorited outfits are kept.
    await Outfit.deleteMany({ user: req.user.id, generatedBy: 'ai', isFavorite: { $ne: true } });

    // Save generated outfits to DB so they appear in the outfits list
    const savedOutfits = await Outfit.insertMany(
      generatedOutfits.map(o => ({ ...o, user: req.user.id }))
    );

    res.json({
      suggestions: savedOutfits,
      total: savedOutfits.length
    });
  } catch (error) {
    console.error('Generate outfits error:', error);
    res.status(500).json({ error: 'Server error generating outfits' });
  }
});

/**
 * @route   POST /api/outfits/today
 * @desc    Generate a single "look of the day" based on today's weather, time of day,
 *          and rotation (favours least-worn pieces). Ephemeral — not saved unless the
 *          user explicitly saves it via POST /outfits.
 * @access  Private
 */
router.post('/today', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, timeOfDay } = req.body || {};
    let { tempC, condition } = req.body || {};
    let city = null;

    const wardrobeItems = await Item.find({ user: req.user.id, isAvailable: true }).lean();
    if (wardrobeItems.length < 2) {
      return res.status(400).json({ error: 'Add at least 2 items to your wardrobe to generate a look' });
    }

    // Fetch live weather server-side so the OpenWeather key stays private. The frontend
    // only sends coordinates (from browser geolocation).
    if (tempC == null && lat != null && lon != null && process.env.OPENWEATHER_API) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API}`;
        const r = await fetch(url);
        if (r.ok) {
          const w = await r.json();
          if (typeof w.main?.temp === 'number') tempC = w.main.temp;
          condition = w.weather?.[0]?.main || condition;
          city = w.name || null;
        } else {
          console.warn('OpenWeather responded', r.status);
        }
      } catch (e) {
        console.warn('Weather fetch failed:', e.message);
      }
    }

    const season = deriveSeason(typeof tempC === 'number' ? tempC : undefined);
    const hour = new Date().getHours();
    const tod = timeOfDay || (hour >= 18 || hour < 6 ? 'night' : 'day');

    const user = await User.findById(req.user.id).select('preferences').lean();
    const suggestions = WardrobeAI.generateOutfitSuggestions(wardrobeItems, {
      season,
      occasion: 'everyday',
      timeOfDay: tod,
      limit: 8,
      userPrefs: user?.preferences || null
    });

    if (!suggestions.length) {
      return res.status(404).json({ error: 'Could not assemble a look from your wardrobe' });
    }

    // For "today" we blend match quality with rotation freshness so unworn pieces surface.
    const todayScore = (s) => {
      const avgWear = s.items.reduce((a, i) => a + (i.wearCount || 0), 0) / s.items.length;
      const freshness = Math.max(0, 25 - Math.min(25, avgWear * 3));
      return (s.breakdown?.rankScore ?? s.score ?? 0) + freshness;
    };
    const ranked = [...suggestions].sort((a, b) => todayScore(b) - todayScore(a));

    const shape = (s) => ({
      name: WardrobeAI.nameOutfit(s.items, s.breakdown, { season, timeOfDay: tod }),
      items: s.items.map(i => ({
        _id: i._id,
        name: i.name,
        category: i.category,
        image: i.imageBase64 || i.imageUrl || i.images?.[0]?.url || null,
        color: i.color?.primary?.hex || i.colors?.[0]?.hex || null,
        wearCount: i.wearCount || 0
      })),
      aiScore: s.breakdown,
      trendReasons: s.breakdown?.trendReasons || [],
      why: s.why || []
    });

    res.json({
      weather: {
        tempC: typeof tempC === 'number' ? Math.round(tempC) : null,
        condition: condition || null,
        city,
        season,
        timeOfDay: tod
      },
      look: shape(ranked[0]),
      alternates: ranked.slice(1, 3).map(shape)
    });
  } catch (error) {
    console.error("Today's look error:", error);
    res.status(500).json({ error: "Server error generating today's look" });
  }
});

module.exports = router;
