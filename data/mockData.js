// Mock data store for development
let transactions = [
  {
    id: 1,
    type: 'expense',
    amount: 45.99,
    category: 'fooddining',
    description: 'Grocery shopping',
    date: '2024-01-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: 'expense',
    amount: 12.50,
    category: 'transportation',
    description: 'Bus fare',
    date: '2024-01-14',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    type: 'income',
    amount: 2500.00,
    category: 'salary',
    description: 'Monthly salary',
    date: '2024-01-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    type: 'expense',
    amount: 89.99,
    category: 'shopping',
    description: 'Online purchase',
    date: '2024-01-12',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    type: 'expense',
    amount: 25.00,
    category: 'entertainment',
    description: 'Movie tickets',
    date: '2024-01-10',
    createdAt: new Date().toISOString()
  }
];

let nextId = 6;

export const getTransactions = () => transactions;

export const addTransaction = (transaction) => {
  const newTransaction = {
    ...transaction,
    id: nextId++,
    createdAt: new Date().toISOString()
  };
  transactions.push(newTransaction);
  return newTransaction;
};

export const updateTransaction = (id, updates) => {
  const index = transactions.findIndex(t => t.id === parseInt(id));
  if (index === -1) return null;
  
  transactions[index] = { ...transactions[index], ...updates };
  return transactions[index];
};

export const deleteTransaction = (id) => {
  const index = transactions.findIndex(t => t.id === parseInt(id));
  if (index === -1) return false;
  
  transactions.splice(index, 1);
  return true;
};

export const generateInsights = (timeframe = '30d') => {
  const now = new Date();
  const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  const recentTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);
  
  const totalSpent = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const categorySpending = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
  
  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    netIncome: Math.round((totalIncome - totalSpent) * 100) / 100,
    topCategory,
    categoryBreakdown: categorySpending,
    transactionCount: recentTransactions.length,
    forecast: {
      nextMonth: Math.round(totalSpent * 1.05 * 100) / 100,
      confidence: 0.85
    },
    trends: {
      spending: totalSpent > 1000 ? 'increasing' : 'stable',
      percentage: Math.round(Math.random() * 20 * 100) / 100
    }
  };
};