import insightService from '../services/insightService.js';

const getInsights = async (req, res, next) => {
  try {
    const { timeframe } = req.query;
    const user = req.user ? await import('../services/authService.js').then(m => m.default.getUserById(req.user.userId)) : null;
    const currency = user?.currency || user?.preferences?.currency || 'USD';
    const insights = await insightService.generateInsights(timeframe, currency);
    res.json(insights);
  } catch (error) {
    next(error);
  }
};

const generateForecast = async (req, res, next) => {
  try {
    // Simple forecast based on recent trends
    const insights = await insightService.generateInsights('90d');
    const trends = insights.trends;
    
    if (trends.length < 2) {
      return res.json({
        forecast: 'Insufficient data for forecast',
        confidence: 'low'
      });
    }

    const recentTrend = trends.slice(-2);
    const avgIncome = recentTrend.reduce((sum, t) => sum + t.income, 0) / recentTrend.length;
    const avgExpenses = recentTrend.reduce((sum, t) => sum + t.expenses, 0) / recentTrend.length;

    res.json({
      forecast: {
        nextMonthIncome: avgIncome,
        nextMonthExpenses: avgExpenses,
        projectedSavings: avgIncome - avgExpenses
      },
      confidence: 'medium',
      basedOn: `${trends.length} months of data`
    });
  } catch (error) {
    next(error);
  }
};

export {
  getInsights,
  generateForecast
};