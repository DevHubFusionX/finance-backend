import transactionService from './transactionService.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class InsightService {
  async generateInsights(timeframe = '30d', currency = 'USD') {
    const transactions = await transactionService.getAllTransactions();
    const cutoffDate = this.getDateCutoff(timeframe);
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = this.getCategoryBreakdown(filteredTransactions);
    const trends = this.calculateTrends(filteredTransactions);

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        transactionCount: filteredTransactions.length
      },
      categoryBreakdown,
      trends,
      recommendations: this.generateRecommendations(filteredTransactions, currency)
    };
  }

  getDateCutoff(timeframe) {
    const now = new Date();
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (days[timeframe] || 30));
    return cutoff;
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
      average: data.total / data.count
    }));
  }

  calculateTrends(transactions) {
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

  async generateRecommendations(transactions, currency = 'USD') {
    const categoryTotals = this.getCategoryBreakdown(transactions.filter(t => t.type === 'expense'));
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹', NGN: '₦', CNY: '¥', CHF: 'Fr', BRL: 'R$', MXN: '$', ZAR: 'R', KRW: '₩' };
    const symbol = currencySymbols[currency] || '$';

    const prompt = `As a financial advisor, analyze this spending data and provide 3 concise recommendations:

Total Income: ${symbol}${totalIncome.toFixed(2)}
Total Expenses: ${symbol}${totalExpenses.toFixed(2)}
Top Spending Categories: ${categoryTotals.slice(0, 3).map(c => `${c.category}: ${symbol}${c.total.toFixed(2)}`).join(', ')}

Provide 3 brief, actionable recommendations (max 100 chars each).`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200
        })
      });

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || '';
      
      return [{ type: 'ai', message: aiText, markdown: true }];
    } catch (error) {
      console.error('Groq API error:', error);
      return [{
        type: 'spending',
        message: `Your highest spending is ${categoryTotals[0]?.category || 'unknown'} at $${(categoryTotals[0]?.total || 0).toFixed(2)}`
      }];
    }
  }
}

export default new InsightService();