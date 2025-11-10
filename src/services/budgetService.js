import Budget from '../models/Budget.js';
import transactionService from './transactionService.js';

class BudgetService {
  constructor() {
    this.budgets = [];
  }

  async getAllBudgets() {
    return this.budgets.map(b => b.toJSON());
  }

  async getBudgetById(id) {
    const budget = this.budgets.find(b => b.id == id);
    if (!budget) {
      const error = new Error('Budget not found');
      error.name = 'NotFoundError';
      throw error;
    }
    return budget.toJSON();
  }

  async createBudget(data) {
    const errors = Budget.validate(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    const budget = new Budget(data);
    this.budgets.push(budget);
    return budget.toJSON();
  }

  async updateBudget(id, data) {
    const budget = this.budgets.find(b => b.id == id);
    if (!budget) {
      const error = new Error('Budget not found');
      error.name = 'NotFoundError';
      throw error;
    }

    budget.update(data);
    return budget.toJSON();
  }

  async deleteBudget(id) {
    const index = this.budgets.findIndex(b => b.id == id);
    if (index === -1) {
      const error = new Error('Budget not found');
      error.name = 'NotFoundError';
      throw error;
    }

    this.budgets.splice(index, 1);
    return { message: 'Budget deleted successfully' };
  }

  async getBudgetProgress() {
    const transactions = await transactionService.getAllTransactions();
    
    return this.budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget.toJSON(),
        spent,
        remaining: budget.amount - spent,
        percentage
      };
    });
  }

  async clearAllBudgets() {
    this.budgets = [];
    return { message: 'All budgets cleared successfully' };
  }
}

export default new BudgetService();