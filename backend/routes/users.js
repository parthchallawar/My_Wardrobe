const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { stylePreferences, preferredColors, avoidColors, seasons, bodyProfile } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.preferences = {
      stylePreferences: stylePreferences || user.preferences.stylePreferences,
      preferredColors: preferredColors || user.preferences.preferredColors,
      avoidColors: avoidColors || user.preferences.avoidColors,
      seasons: seasons || user.preferences.seasons,
      bodyProfile: bodyProfile !== undefined ? bodyProfile : (user.preferences.bodyProfile || {})
    };

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        preferences: user.preferences
      },
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error updating preferences' });
  }
});

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Server error fetching preferences' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user.id }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      user.username = username;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        preferences: user.preferences,
        subscription: user.subscription
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const Item = require('../models/Item');
    const Outfit = require('../models/Outfit');

    // Delete all user items
    await Item.deleteMany({ user: req.user.id });

    // Delete all user outfits
    await Outfit.deleteMany({ user: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error deleting account' });
  }
});

module.exports = router;
