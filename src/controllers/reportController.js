import reportService from '../services/reportService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const generateReport = asyncHandler(async (req, res) => {
  const { type, dateRange, startDate, endDate, categories, format } = req.body;
  
  logger.info('Generating report', { 
    type, 
    dateRange, 
    startDate, 
    endDate, 
    categories: categories?.length || 0,
    format 
  });
  
  const reportParams = {
    type: type || 'summary',
    dateRange,
    startDate,
    endDate,
    categories,
    format: format || 'json'
  };
  
  const result = await reportService.generateReport(reportParams);
  res.json(result);
});

const getReportHistory = asyncHandler(async (req, res) => {
  logger.info('Fetching report history');
  const history = await reportService.getReportHistory();
  res.json(history);
});

const getQuickReport = asyncHandler(async (req, res) => {
  const { type = 'summary', timeframe = '30d' } = req.query;
  
  logger.info('Generating quick report', { type, timeframe });
  
  const reportParams = {
    type,
    dateRange: timeframe
  };
  
  const result = await reportService.generateReport(reportParams);
  res.json(result.data);
});

export {
  generateReport,
  getReportHistory,
  getQuickReport
};