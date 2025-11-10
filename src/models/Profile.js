class Profile {
  constructor(data) {
    this.id = data.id || 1;
    this.name = data.name || 'John Doe';
    this.email = data.email || 'john@example.com';
    this.avatar = data.avatar || null;
    this.phone = data.phone || '';
    this.location = data.location || '';
    this.currency = data.currency || data.preferences?.currency || 'USD';
    this.timezone = data.timezone || 'UTC';
    this.language = data.language || 'en';
    this.notifications = data.notifications || {
      email: true,
      push: true,
      budgetAlerts: true,
      goalReminders: true
    };
    this.preferences = {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      currency: data.currency || data.preferences?.currency || 'USD',
      ...data.preferences
    };
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (data.name && data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    
    return errors;
  }

  update(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.avatar !== undefined) this.avatar = data.avatar;
    if (data.phone) this.phone = data.phone;
    if (data.location) this.location = data.location;
    if (data.currency) {
      this.currency = data.currency;
      this.preferences.currency = data.currency;
    }
    if (data.timezone) this.timezone = data.timezone;
    if (data.language) this.language = data.language;
    if (data.notifications) this.notifications = { ...this.notifications, ...data.notifications };
    if (data.preferences) {
      this.preferences = { ...this.preferences, ...data.preferences };
      if (data.preferences.currency) {
        this.currency = data.preferences.currency;
        this.preferences.currency = data.preferences.currency;
      }
    }
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      phone: this.phone,
      location: this.location,
      currency: this.currency,
      timezone: this.timezone,
      language: this.language,
      notifications: this.notifications,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Profile;