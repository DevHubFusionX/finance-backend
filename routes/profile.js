const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone })
      },
      { new: true, runValidators: true }
    );

    console.log('Profile updated:', { id: userId, updates: { name, email, phone } });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', auth, [
  body('avatar').isBase64().withMessage('Avatar must be a valid base64 string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { avatar } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );

    console.log('Avatar updated:', { id: userId });

    res.json({
      message: 'Avatar updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { currency, theme, language } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        preferences: {
          ...req.user.preferences,
          ...(currency && { currency }),
          ...(theme && { theme }),
          ...(language && { language })
        }
      },
      { new: true }
    );

    console.log('Preferences updated:', { id: userId, preferences: { currency, theme, language } });

    res.json({
      message: 'Preferences updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile/notifications
// @desc    Update notification settings
// @access  Private
router.put('/notifications', auth, async (req, res) => {
  try {
    const { email, push, budgetAlerts } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        notifications: {
          ...req.user.notifications,
          ...(typeof email === 'boolean' && { email }),
          ...(typeof push === 'boolean' && { push }),
          ...(typeof budgetAlerts === 'boolean' && { budgetAlerts })
        }
      },
      { new: true }
    );

    console.log('Notifications updated:', { id: userId, notifications: { email, push, budgetAlerts } });

    res.json({
      message: 'Notification settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Notifications update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;