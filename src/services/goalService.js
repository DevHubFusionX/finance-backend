import Goal from '../models/Goal.js';

class GoalService {
  constructor() {
    this.goals = [];
  }

  async getAllGoals() {
    return this.goals.map(g => g.toJSON());
  }

  async getGoalById(id) {
    const goal = this.goals.find(g => g.id == id);
    if (!goal) {
      const error = new Error('Goal not found');
      error.name = 'NotFoundError';
      throw error;
    }
    return goal.toJSON();
  }

  async createGoal(data) {
    const errors = Goal.validate(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    const goal = new Goal(data);
    this.goals.push(goal);
    return goal.toJSON();
  }

  async updateGoal(id, data) {
    const goal = this.goals.find(g => g.id == id);
    if (!goal) {
      const error = new Error('Goal not found');
      error.name = 'NotFoundError';
      throw error;
    }

    goal.update(data);
    return goal.toJSON();
  }

  async deleteGoal(id) {
    const index = this.goals.findIndex(g => g.id == id);
    if (index === -1) {
      const error = new Error('Goal not found');
      error.name = 'NotFoundError';
      throw error;
    }

    this.goals.splice(index, 1);
    return { message: 'Goal deleted successfully' };
  }

  async getGoalProgress() {
    return this.goals.map(goal => {
      const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal.toJSON(),
        percentage,
        daysLeft,
        isCompleted: goal.currentAmount >= goal.targetAmount
      };
    });
  }

  async clearAllGoals() {
    this.goals = [];
    return { message: 'All goals cleared successfully' };
  }
}

export default new GoalService();