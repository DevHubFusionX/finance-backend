import transactionService from './transactionService.js';

class AnalyticsService {
  async getAnalytics(timeframe = '30d', category = 'all') {
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = this.filterTransactions(transactions, timeframe, category);

    return {
      summary: this.calculateSummary(filteredTransactions),
      categoryBreakdown: this.getCategoryBreakdown(filteredTransactions),
      monthlyTrends: this.getMonthlyTrends(filteredTransactions),
      topCategories: this.getTopCategories(filteredTransactions)
    };
  }

  filterTransactions(transactions, timeframe, category) {
    let filtered = [...transactions];
    
    // Filter by timeframe
    const cutoffDate = this.getDateCutoff(timeframe);
    filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }
    
    return filtered;
  }

  getDateCutoff(timeframe) {
    const now = new Date();
    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (days[timeframe] || 30));
    return cutoff;
  }

  calculateSummary(transactions) {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      transactionCount: transactions.length,
      avgTransactionAmount: transactions.length > 0 ? (income + expenses) / transactions.length : 0
    };
  }

  getCategoryBreakdown(transactions) {
    const breakdown = {};
    
    transactions.forEach(t => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = { total: 0, count: 0, type: t.type };
      }
      breakdown[t.category].total += t.amount;
      breakdown[t.category].count += 1;
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data,
      percentage: this.calculatePercentage(data.total, transactions, data.type)
    }));
  }

  calculatePercentage(amount, transactions, type) {
    const total = transactions.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);
    return total > 0 ? (amount / total) * 100 : 0;
  }

  getMonthlyTrends(transactions) {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
        net: data.income - data.expenses
      }));
  }

  getTopCategories(transactions, limit = 5) {
    const categoryTotals = this.getCategoryBreakdown(transactions.filter(t => t.type === 'expense'));
    return categoryTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }
}

export default new AnalyticsService();