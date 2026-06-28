const express = require('express');
const Item = require('../models/Item');
const WearLog = require('../models/WearLog');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/wearlog
 * Log a wear event for an item or outfit.
 * Body: { item?, outfit?, date?, timeOfDay?, occasion?, notes? }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { item, outfit, date, timeOfDay, occasion, notes } = req.body;
    if (!item && !outfit) {
      return res.status(400).json({ error: 'Either item or outfit is required' });
    }

    const entry = new WearLog({
      user: req.user.id,
      item: item || null,
      outfit: outfit || null,
      date: date ? new Date(date) : new Date(),
      timeOfDay: timeOfDay || 'both',
      occasion: occasion || null,
      notes: notes || null,
    });
    await entry.save();

    // Also update wearCount/lastWorn on the item for backward compatibility
    if (item) {
      await Item.findByIdAndUpdate(item, {
        $inc: { wearCount: 1 },
        $set: { lastWorn: entry.date },
      });
    }

    res.status(201).json({ entry });
  } catch (err) {
    console.error('WearLog POST error:', err);
    res.status(500).json({ error: 'Server error logging wear' });
  }
});

/**
 * GET /api/wearlog
 * Get wear logs for the authenticated user.
 * Query: { from?, to?, itemId?, outfitId? }
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { from, to, itemId, outfitId } = req.query;
    const filter = { user: req.user.id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (itemId) filter.item = itemId;
    if (outfitId) filter.outfit = outfitId;

    const logs = await WearLog.find(filter)
      .sort({ date: -1 })
      .populate('item', 'name category images imageUrl imageBase64 color colors')
      .populate('outfit', 'name style');

    res.json({ logs });
  } catch (err) {
    console.error('WearLog GET error:', err);
    res.status(500).json({ error: 'Server error fetching wear logs' });
  }
});

/**
 * GET /api/wearlog/rotation
 * Return items that haven't been worn recently — good rotation suggestions.
 * Query: { limit? }
 */
router.get('/rotation', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Items worn least recently (or never) — exclude unavailable items
    const items = await Item.find({ user: req.user.id, isAvailable: true })
      .select('name category images imageUrl imageBase64 color colors wearCount lastWorn')
      .sort({ lastWorn: 1, wearCount: 1 }) // nulls first (never worn), then oldest
      .limit(limit);

    // Annotate with days-since-worn
    const today = new Date();
    const annotated = items.map(item => {
      const daysSince = item.lastWorn
        ? Math.floor((today - item.lastWorn) / (1000 * 60 * 60 * 24))
        : null;
      return { ...item.toObject(), daysSinceWorn: daysSince };
    });

    res.json({ items: annotated });
  } catch (err) {
    console.error('WearLog rotation error:', err);
    res.status(500).json({ error: 'Server error fetching rotation suggestions' });
  }
});

/**
 * DELETE /api/wearlog/:id
 * Remove a specific wear log entry.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await WearLog.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ error: 'Log entry not found' });
    await entry.deleteOne();
    res.json({ message: 'Log entry deleted' });
  } catch (err) {
    console.error('WearLog DELETE error:', err);
    res.status(500).json({ error: 'Server error deleting log entry' });
  }
});

module.exports = router;
