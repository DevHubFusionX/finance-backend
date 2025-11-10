class Report {
  constructor(data) {
    this.id = data.id || Date.now();
    this.type = data.type; // 'summary', 'detailed', 'category', 'monthly'
    this.dateRange = data.dateRange;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.categories = data.categories || [];
    this.format = data.format || 'json'; // 'json', 'pdf', 'csv'
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.type || !['summary', 'detailed', 'category', 'monthly', 'spending', 'income', 'budget'].includes(data.type)) {
      errors.push('Type must be one of: summary, detailed, category, monthly, spending, income, budget');
    }
    
    if (!data.dateRange && (!data.startDate || !data.endDate)) {
      errors.push('Either dateRange or startDate/endDate must be provided');
    }
    
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      dateRange: this.dateRange,
      startDate: this.startDate,
      endDate: this.endDate,
      categories: this.categories,
      format: this.format,
      createdAt: this.createdAt
    };
  }
}

export default Report;