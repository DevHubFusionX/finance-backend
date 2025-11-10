class User {
  constructor(data) {
    this.id = data.id || Date.now();
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.phone = data.phone || '';
    this.country = data.country || 'US';
    this.avatar = data.avatar || null;
    this.location = data.location || '';
    this.currency = data.currency || 'USD';
    this.timezone = data.timezone || 'UTC';
    this.language = data.language || 'en';
    this.notifications = data.notifications || { email: true, budgetAlerts: true, goalReminders: true };
    this.preferences = data.preferences || { currency: data.currency || 'USD' };
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return errors;
  }

  update(data) {
    if (data.name) this.name = data.name;
    if (data.phone) this.phone = data.phone;
    if (data.country) this.country = data.country;
    if (data.avatar !== undefined) this.avatar = data.avatar;
    if (data.location) this.location = data.location;
    if (data.timezone) this.timezone = data.timezone;
    if (data.language) this.language = data.language;
    if (data.notifications) this.notifications = { ...this.notifications, ...data.notifications };
    if (data.preferences) {
      this.preferences = { ...this.preferences, ...data.preferences };
      if (data.preferences.currency) this.currency = data.preferences.currency;
    }
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      country: this.country,
      avatar: this.avatar,
      location: this.location,
      currency: this.currency,
      timezone: this.timezone,
      language: this.language,
      notifications: this.notifications,
      preferences: this.preferences,
      createdAt: this.createdAt
    };
  }
}

export default User;