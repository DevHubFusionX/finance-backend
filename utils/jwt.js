const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTUtils {
  static generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
  }

  static generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateTokens(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken()
    };
  }

  static setTokenCookies(res, accessToken, refreshToken) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  static clearTokenCookies(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}

module.exports = JWTUtils;