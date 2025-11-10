const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

class BudgetController {
  static async getBudgets(req, res) {
    try {
      const budgets = await Budget.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
      
      // Calculate spent amounts for each budget
      const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: req.user._id,
              type: 'expense',
              date: { $gte: budget.startDate, $lte: budget.endDate },
              ...(budget.categories.length > 0 && { category: { $in: budget.categories } })
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        
        const spentAmount = spent[0]?.total || 0;
        const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
        const remaining = budget.amount - spentAmount;
        
        return {
          ...budget.toObject(),
          spent: spentAmount,
          percentage: Math.round(percentage * 10) / 10,
          remaining
        };
      }));
      
      res.json(budgetsWithSpent);
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createBudget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const budget = new Budget({
        ...req.body,
        userId: req.user._id
      });

      await budget.save();
      res.status(201).json(budget);
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async updateBudget(req, res) {
    try {
      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
      );

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      res.json(budget);
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async deleteBudget(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid budget ID format' });
      }
      
      const budget = await Budget.findOneAndDelete({
        _id: id,
        userId: req.user._id
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      res.json({ message: 'Budget deleted' });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = BudgetController;