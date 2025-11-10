import authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getProfile = asyncHandler(async (req, res) => {
  logger.info('Fetching user profile', { userId: req.user?.userId });
  const user = authService.getUserById(req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  logger.info('Updating user profile', { userId: req.user?.userId, body: req.body });
  const user = authService.updateUser(req.user?.userId, req.body);
  res.json(user);
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  logger.info('Updating user avatar', { userId: req.user?.userId });
  const user = authService.updateUser(req.user?.userId, { avatar });
  res.json(user);
});

const updateNotifications = asyncHandler(async (req, res) => {
  logger.info('Updating notification settings', { userId: req.user?.userId, body: req.body });
  const user = authService.updateUser(req.user?.userId, { notifications: req.body });
  res.json(user);
});

const updatePreferences = asyncHandler(async (req, res) => {
  logger.info('Updating user preferences', { userId: req.user?.userId, body: req.body });
  const updates = { preferences: req.body };
  if (req.body.currency) {
    updates.preferences = { ...updates.preferences, currency: req.body.currency };
  }
  const user = authService.updateUser(req.user?.userId, updates);
  res.json(user);
});

export {
  getProfile,
  updateProfile,
  updateAvatar,
  updateNotifications,
  updatePreferences
};