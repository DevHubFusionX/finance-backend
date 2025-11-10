import Profile from '../models/Profile.js';
import authService from './authService.js';

class ProfileService {
  constructor() {
    this.profiles = new Map();
  }

  getOrCreateProfile(userId, userData = {}) {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, new Profile({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.country,
        currency: userData.preferences?.currency || 'USD',
        preferences: userData.preferences
      }));
    }
    return this.profiles.get(userId);
  }

  async getProfile(userId) {
    const user = authService.getUserById(userId);
    if (!user) return null;
    
    const profile = this.getOrCreateProfile(userId, user);
    return profile.toJSON();
  }

  async updateProfile(userId, data) {
    const errors = Profile.validate(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    const profile = this.getOrCreateProfile(userId);
    profile.update(data);
    return profile.toJSON();
  }

  async updateAvatar(userId, avatarData) {
    const profile = this.getOrCreateProfile(userId);
    profile.update({ avatar: avatarData });
    return profile.toJSON();
  }

  async updateNotifications(userId, notifications) {
    const profile = this.getOrCreateProfile(userId);
    profile.update({ notifications });
    return profile.toJSON();
  }

  async updatePreferences(userId, preferences) {
    const profile = this.getOrCreateProfile(userId);
    const updates = { preferences };
    if (preferences.currency) {
      updates.currency = preferences.currency;
    }
    profile.update(updates);
    return profile.toJSON();
  }
}

export default new ProfileService();