import express from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updateNotifications,
  updatePreferences
} from '../controllers/profileController.js';

const router = express.Router();

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/avatar', updateAvatar);
router.put('/notifications', updateNotifications);
router.put('/preferences', updatePreferences);

export default router;