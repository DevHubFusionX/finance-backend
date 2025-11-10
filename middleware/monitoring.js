const logger = require('../utils/logger');

const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    logger.info('Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip
    });
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        url: originalUrl,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
};

const healthCheck = (req, res) => {
  const mongoose = require('mongoose');
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(health);
};

module.exports = { performanceMonitor, healthCheck };