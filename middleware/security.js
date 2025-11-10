const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// Auth rate limiting - DISABLED
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: () => true
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    error: 'Too many password reset attempts. Please try again later.',
    retryAfter: '1 hour'
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests. Please try again later.'
  }
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Input sanitization
const sanitizeInput = [
  mongoSanitize(),
  xssProtection
];

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  sanitizeInput
};