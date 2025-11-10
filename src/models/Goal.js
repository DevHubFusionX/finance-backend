class Goal {
  constructor(data) {
    this.id = data.id || Date.now();
    this.title = data.title;
    this.targetAmount = parseFloat(data.targetAmount);
    this.currentAmount = parseFloat(data.currentAmount || 0);
    this.targetDate = data.targetDate;
    this.category = data.category;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.title) {
      errors.push('Title is required');
    }
    
    if (!data.targetAmount || isNaN(data.targetAmount) || data.targetAmount <= 0) {
      errors.push('Invalid target amount');
    }
    
    if (!data.targetDate) {
      errors.push('Target date is required');
    }
    
    return errors;
  }

  update(data) {
    if (data.title) this.title = data.title;
    if (data.targetAmount) this.targetAmount = parseFloat(data.targetAmount);
    if (data.currentAmount !== undefined) this.currentAmount = parseFloat(data.currentAmount);
    if (data.targetDate) this.targetDate = data.targetDate;
    if (data.category) this.category = data.category;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount,
      targetDate: this.targetDate,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Goal;