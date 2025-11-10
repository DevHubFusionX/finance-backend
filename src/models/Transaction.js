class Transaction {
  constructor(data) {
    this.id = data.id || Date.now();
    this.type = data.type;
    this.amount = parseFloat(data.amount);
    this.category = data.category;
    this.description = data.description;
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push('Invalid transaction type');
    }
    
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      errors.push('Invalid amount');
    }
    
    if (!data.category) {
      errors.push('Category is required');
    }
    
    if (!data.description) {
      errors.push('Description is required');
    }
    
    return errors;
  }

  update(data) {
    if (data.type) this.type = data.type;
    if (data.amount) this.amount = parseFloat(data.amount);
    if (data.category) this.category = data.category;
    if (data.description) this.description = data.description;
    if (data.date) this.date = data.date;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      category: this.category,
      description: this.description,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Transaction;