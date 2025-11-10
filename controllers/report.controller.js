const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

exports.generateReport = async (req, res) => {
  try {
    const { type = 'summary', timeframe = '30d' } = req.query;
    const userId = req.user._id;

    const days = parseInt(timeframe) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    let reportData = {};

    switch (type) {
      case 'spending':
        reportData = await generateSpendingReport(transactions);
        break;
      case 'income':
        reportData = await generateIncomeReport(transactions);
        break;
      case 'budget':
        reportData = await generateBudgetReport(userId, startDate);
        break;
      default:
        reportData = await generateSummaryReport(transactions);
    }

    res.json(reportData);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

async function generateSummaryReport(transactions) {
  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryBreakdown = {};
  transactions.forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0, type: t.type };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count++;
  });

  const topCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'None';

  return {
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    topCategory,
    avgTransaction: transactions.length ? (totalIncome + totalExpenses) / transactions.length : 0,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      ...data
    }))
  };
}

async function generateSpendingReport(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryBreakdown = {};
  expenses.forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0 };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count++;
  });

  const topSpendingCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'None';

  return {
    totalSpending,
    transactionCount: expenses.length,
    avgSpending: expenses.length ? totalSpending / expenses.length : 0,
    dailyAverage: totalSpending / 30,
    topSpendingCategory,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      type: 'expense',
      ...data
    }))
  };
}

async function generateIncomeReport(transactions) {
  const income = transactions.filter(t => t.type === 'income');
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryBreakdown = {};
  income.forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, count: 0 };
    }
    categoryBreakdown[t.category].total += t.amount;
    categoryBreakdown[t.category].count++;
  });

  const topIncomeCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'None';

  return {
    totalIncome,
    transactionCount: income.length,
    avgIncome: income.length ? totalIncome / income.length : 0,
    dailyAverage: totalIncome / 30,
    topIncomeCategory,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      type: 'income',
      ...data
    }))
  };
}

async function generateBudgetReport(userId, startDate) {
  const budgets = await Budget.find({ userId });
  const transactions = await Transaction.find({
    userId,
    type: 'expense',
    date: { $gte: startDate }
  });

  const budgetData = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget.amount ? (spent / budget.amount) * 100 : 0;
    
    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentage
    };
  });

  const totalBudgeted = budgetData.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);

  return {
    totalBudgeted,
    totalSpent,
    totalRemaining: totalBudgeted - totalSpent,
    overallPercentage: totalBudgeted ? (totalSpent / totalBudgeted) * 100 : 0,
    overBudgetCount: budgetData.filter(b => b.spent > b.budgeted).length,
    onTrackCount: budgetData.filter(b => b.spent <= b.budgeted).length,
    budgets: budgetData
  };
}
