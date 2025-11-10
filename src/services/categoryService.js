import Category from '../models/Category.js';
import transactionService from './transactionService.js';
import sessionStorage from '../utils/sessionStorage.js';

class CategoryService {
  getCategories(sessionId) {
    const categories = sessionStorage.getSessionData(sessionId).categories;
    if (categories.length === 0) {
      this.initializeData(sessionId);
      return sessionStorage.getSessionData(sessionId).categories;
    }
    return categories;
  }

  setCategories(sessionId, categories) {
    sessionStorage.setSessionData(sessionId, 'categories', categories);
  }

  initializeData(sessionId) {
    const defaultCategories = [
      { name: 'Food & Dining', type: 'expense', color: '#FF6B6B' },
      { name: 'Transportation', type: 'expense', color: '#4ECDC4' },
      { name: 'Shopping', type: 'expense', color: '#45B7D1' },
      { name: 'Entertainment', type: 'expense', color: '#96CEB4' },
      { name: 'Bills & Utilities', type: 'expense', color: '#FFEAA7' },
      { name: 'Healthcare', type: 'expense', color: '#DDA0DD' },
      { name: 'Salary', type: 'income', color: '#98D8C8' },
      { name: 'Freelance', type: 'income', color: '#A8E6CF' }
    ];

    const categories = defaultCategories.map(data => new Category(data));
    this.setCategories(sessionId, categories);
  }

  async getAllCategories(sessionId = 'default') {
    const categories = this.getCategories(sessionId);
    return categories.map(c => c.toJSON ? c.toJSON() : c);
  }

  async getCategoryById(id, sessionId = 'default') {
    const categories = this.getCategories(sessionId);
    const category = categories.find(c => c.id == id);
    if (!category) {
      const error = new Error('Category not found');
      error.name = 'NotFoundError';
      throw error;
    }
    return category.toJSON ? category.toJSON() : category;
  }

  async createCategory(data) {
    const errors = Category.validate(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    const category = new Category(data);
    this.categories.push(category);
    return category.toJSON();
  }

  async updateCategory(id, data) {
    const category = this.categories.find(c => c.id == id);
    if (!category) {
      const error = new Error('Category not found');
      error.name = 'NotFoundError';
      throw error;
    }

    category.update(data);
    return category.toJSON();
  }

  async deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id == id);
    if (index === -1) {
      const error = new Error('Category not found');
      error.name = 'NotFoundError';
      throw error;
    }

    this.categories.splice(index, 1);
    return { message: 'Category deleted successfully' };
  }

  async getCategoryStats(sessionId = 'default') {
    const transactions = await transactionService.getAllTransactions(sessionId);
    const categories = this.getCategories(sessionId);
    
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => 
        t.category === category.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...(category.toJSON ? category.toJSON() : category),
        transactionCount: categoryTransactions.length,
        totalAmount: total
      };
    });
  }

  async clearAllCategories() {
    this.initializeData();
    return { message: 'Categories reset to defaults' };
  }
}

export default new CategoryService();