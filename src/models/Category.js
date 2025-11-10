class Category {
  constructor(data) {
    this.id = data.id || Date.now();
    this.name = data.name;
    this.type = data.type;
    this.color = data.color || '#A67C00';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.name) {
      errors.push('Name is required');
    }
    
    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push('Type must be either "income" or "expense"');
    }
    
    return errors;
  }

  update(data) {
    if (data.name) this.name = data.name;
    if (data.type) this.type = data.type;
    if (data.color) this.color = data.color;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Category;