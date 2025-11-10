import Report from '../models/Report.js';
import transactionService from './transactionService.js';
import categoryService from './categoryService.js';
import budgetService from './budgetService.js';

class ReportService {
  constructor() {
    this.reports = [];
  }

  getDateRange(dateRange, startDate, endDate) {
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = now;
      switch (dateRange) {
        case '7d':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    return { start, end };
  }

  async generateSummaryReport(params) {
    const { dateRange, startDate, endDate, categories } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const inDateRange = date >= start && date <= end;
      const inCategories = !categories?.length || categories.includes(t.category);
      return inDateRange && inCategories;
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryStats = {};
    filteredTransactions.forEach(t => {
      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { count: 0, amount: 0, type: t.type };
      }
      categoryStats[t.category].count++;
      categoryStats[t.category].amount += t.amount;
    });

    const topCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.amount - a.amount)[0]?.[0] || 'None';

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      topCategory,
      transactionCount: filteredTransactions.length,
      avgTransaction: filteredTransactions.length > 0 ? 
        filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length : 0,
      categoryBreakdown: categoryStats,
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  async generateDetailedReport(params) {
    const { dateRange, startDate, endDate, categories } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const inDateRange = date >= start && date <= end;
      const inCategories = !categories?.length || categories.includes(t.category);
      return inDateRange && inCategories;
    });

    const summary = await this.generateSummaryReport(params);

    return {
      ...summary,
      transactions: filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      dailyBreakdown: this.getDailyBreakdown(filteredTransactions, start, end)
    };
  }

  async generateCategoryReport(params) {
    const { dateRange, startDate, endDate } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const categories = await categoryService.getAllCategories();
    
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });

    const categoryReport = categories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => 
        t.category === category.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...category,
        transactionCount: categoryTransactions.length,
        totalAmount: total,
        avgAmount: categoryTransactions.length > 0 ? total / categoryTransactions.length : 0,
        transactions: categoryTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    });

    return {
      categories: categoryReport,
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  async generateMonthlyReport(params) {
    const { dateRange, startDate, endDate } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });

    const monthlyData = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transactions: 0
        };
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
      monthlyData[monthKey].transactions++;
    });

    const months = Object.values(monthlyData).map(month => ({
      ...month,
      netSavings: month.income - month.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      months,
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  getDailyBreakdown(transactions, start, end) {
    const dailyData = {};
    const current = new Date(start);
    
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      dailyData[dateKey] = { income: 0, expenses: 0, transactions: 0 };
      current.setDate(current.getDate() + 1);
    }

    transactions.forEach(t => {
      const dateKey = t.date;
      if (dailyData[dateKey]) {
        if (t.type === 'income') {
          dailyData[dateKey].income += t.amount;
        } else {
          dailyData[dateKey].expenses += t.amount;
        }
        dailyData[dateKey].transactions++;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
      netSavings: data.income - data.expenses
    }));
  }

  async generateSpendingReport(params) {
    const { dateRange, startDate, endDate, categories } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const inDateRange = date >= start && date <= end;
      const inCategories = !categories?.length || categories.includes(t.category);
      const isExpense = t.type === 'expense';
      return inDateRange && inCategories && isExpense;
    });

    const categoryStats = {};
    filteredTransactions.forEach(t => {
      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { count: 0, amount: 0 };
      }
      categoryStats[t.category].count++;
      categoryStats[t.category].amount += t.amount;
    });

    const totalSpending = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const topSpendingCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.amount - a.amount)[0]?.[0] || 'None';

    return {
      totalSpending,
      transactionCount: filteredTransactions.length,
      avgSpending: filteredTransactions.length > 0 ? totalSpending / filteredTransactions.length : 0,
      topSpendingCategory,
      categoryBreakdown: categoryStats,
      dailyAverage: totalSpending / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  async generateIncomeReport(params) {
    const { dateRange, startDate, endDate, categories } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const transactions = await transactionService.getAllTransactions();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const inDateRange = date >= start && date <= end;
      const inCategories = !categories?.length || categories.includes(t.category);
      const isIncome = t.type === 'income';
      return inDateRange && inCategories && isIncome;
    });

    const categoryStats = {};
    filteredTransactions.forEach(t => {
      if (!categoryStats[t.category]) {
        categoryStats[t.category] = { count: 0, amount: 0 };
      }
      categoryStats[t.category].count++;
      categoryStats[t.category].amount += t.amount;
    });

    const totalIncome = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const topIncomeCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.amount - a.amount)[0]?.[0] || 'None';

    return {
      totalIncome,
      transactionCount: filteredTransactions.length,
      avgIncome: filteredTransactions.length > 0 ? totalIncome / filteredTransactions.length : 0,
      topIncomeCategory,
      categoryBreakdown: categoryStats,
      dailyAverage: totalIncome / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  async generateBudgetReport(params) {
    const { dateRange, startDate, endDate } = params;
    const { start, end } = this.getDateRange(dateRange, startDate, endDate);
    
    const budgets = await budgetService.getAllBudgets();
    const budgetProgress = await budgetService.getBudgetProgress();
    const transactions = await transactionService.getAllTransactions();
    
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end && t.type === 'expense';
    });

    const budgetPerformance = budgets.map(budget => {
      const budgetTransactions = filteredTransactions.filter(t => 
        t.category === budget.category?.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget,
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good',
        transactionCount: budgetTransactions.length
      };
    });

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetPerformance.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetPerformance.filter(b => b.status === 'over').length;
    const warningCount = budgetPerformance.filter(b => b.status === 'warning').length;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      overallPercentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      budgetPerformance,
      overBudgetCount,
      warningCount,
      onTrackCount: budgets.length - overBudgetCount - warningCount,
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    };
  }

  async generateReport(params) {
    const errors = Report.validate(params);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      throw error;
    }

    let reportData;
    
    switch (params.type) {
      case 'summary':
        reportData = await this.generateSummaryReport(params);
        break;
      case 'detailed':
        reportData = await this.generateDetailedReport(params);
        break;
      case 'category':
        reportData = await this.generateCategoryReport(params);
        break;
      case 'monthly':
        reportData = await this.generateMonthlyReport(params);
        break;
      case 'spending':
        reportData = await this.generateSpendingReport(params);
        break;
      case 'income':
        reportData = await this.generateIncomeReport(params);
        break;
      case 'budget':
        reportData = await this.generateBudgetReport(params);
        break;
      default:
        reportData = await this.generateSummaryReport(params);
    }

    const report = new Report(params);
    this.reports.push(report);

    return {
      report: report.toJSON(),
      data: reportData
    };
  }

  async getReportHistory() {
    return this.reports.map(r => r.toJSON()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

export default new ReportService();