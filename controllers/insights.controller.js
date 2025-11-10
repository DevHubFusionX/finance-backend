const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const AIService = require('../services/aiService');

class InsightsController {
  static async getInsights(req, res) {
    try {
      const userId = req.user._id;
      const { timeframe = '30d' } = req.query;
      
      // Calculate date range
      const days = { '7d': 7, '30d': 30, '90d': 90 };
      const daysBack = days[timeframe] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get transactions in timeframe
      const transactions = await Transaction.find({
        userId,
        date: { $gte: startDate }
      });

      // Calculate totals
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netSavings = income - expenses;
      const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

      // Top categories
      const categoryTotals = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

      const topCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: expenses > 0 ? (amount / expenses) * 100 : 0
        }));

      // Generate AI insights
      const aiInsights = await AIService.generateSpendingInsights(
        transactions.slice(0, 20),
        req.user.preferences || { currency: 'USD', country: 'US' }
      );

      res.json({
        totalIncome: income,
        totalExpenses: expenses,
        netSavings,
        savingsRate: Math.round(savingsRate),
        monthlyTrend: netSavings > 0 ? 'up' : 'down',
        topCategories,
        transactionCount: transactions.length,
        aiInsights
      });
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = InsightsController;