class Budget {
  constructor(data) {
    this.id = data.id || Date.now();
    this.category = data.category;
    this.amount = parseFloat(data.amount);
    this.period = data.period || 'monthly';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.category) {
      errors.push('Category is required');
    }
    
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      errors.push('Invalid amount');
    }
    
    return errors;
  }

  update(data) {
    if (data.category) this.category = data.category;
    if (data.amount) this.amount = parseFloat(data.amount);
    if (data.period) this.period = data.period;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      category: this.category,
      amount: this.amount,
      period: this.period,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Budget;