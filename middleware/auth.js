const User = require('../models/User');
const TokenManager = require('../utils/tokenManager');

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = TokenManager.verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user is locked
    if (user.isLocked) {
      return res.status(423).json({ error: 'Account temporarily locked due to failed login attempts.' });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({ error: 'Token invalid. Password was changed.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      error: 'Email verification required.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken;
    
    if (token) {
      const decoded = TokenManager.verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user && !user.isLocked) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next();
};

module.exports = { auth, requireEmailVerification, optionalAuth };