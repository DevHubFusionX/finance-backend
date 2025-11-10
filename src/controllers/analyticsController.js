import analyticsService from '../services/analyticsService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const getAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = '30d', category = 'all' } = req.query;
  logger.info('Fetching analytics', { timeframe, category });
  
  const analytics = await analyticsService.getAnalytics(timeframe, category);
  res.json(analytics);
});

const getSpendingTrends = asyncHandler(async (req, res) => {
  const { timeframe = '90d' } = req.query;
  logger.info('Fetching spending trends', { timeframe });
  
  const analytics = await analyticsService.getAnalytics(timeframe);
  res.json({
    trends: analytics.monthlyTrends,
    topCategories: analytics.topCategories
  });
});

export {
  getAnalytics,
  getSpendingTrends
};