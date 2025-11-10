const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenManager {
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
    );

    return { accessToken, refreshToken };
  }

  static verifyToken(token, type = 'access') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (type === 'refresh' && decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = TokenManager;