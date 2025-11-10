const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const TokenManager = require('../utils/tokenManager');
const EmailService = require('../utils/email');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Validation is handled by middleware, so we can proceed

      const { name, email, password, phone, country, currency } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        phone,
        country,
        preferences: {
          currency: currency || 'USD',
          theme: 'light',
          language: 'en'
        }
      });

      // Generate OTP for email verification
      const otp = user.generateOTP();
      await user.save();

      // Send OTP email
      try {
        await EmailService.sendOTPEmail(user, otp);
      } catch (emailError) {
        console.error('OTP email sending failed:', emailError);
        // Don't fail registration if email fails
      }

      console.log('User registered, OTP sent:', { id: user._id, email: user.email });

      res.status(201).json({
        message: 'Registration successful. Please check your email for the verification code.',
        userId: user._id,
        email: user.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Validation is handled by middleware, so we can proceed

      const { email, password, rememberMe } = req.body;
      logger.debug('Login attempt', { email, hasPassword: !!password });

      // Find user and include password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({ 
          error: 'Account temporarily locked due to failed login attempts. Please try again later.' 
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await user.incLoginAttempts();
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Generate tokens
      const { accessToken, refreshToken } = TokenManager.generateTokens(user._id);
      
      // Store refresh token
      await user.addRefreshToken(refreshToken, req.get('User-Agent'), req.ip);

      // Set secure cookies
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      console.log('User logged in:', { id: user._id, email: user.email });

      res.json({
        message: 'Login successful',
        user,
        tokens: { accessToken, refreshToken }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }

  // Refresh access token
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body || req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      // Find user with this refresh token
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = TokenManager.generateTokens(user._id);
      
      // Remove old refresh token and add new one
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(newRefreshToken, req.get('User-Agent'), req.ip);

      // Set new cookies
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.json({
        message: 'Token refreshed successfully',
        tokens: { accessToken, refreshToken: newRefreshToken }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Server error during token refresh' });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body || req.cookies;
      
      if (refreshToken && req.user) {
        await req.user.removeRefreshToken(refreshToken);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      console.log('User logged out:', { id: req.user?._id });

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Server error during logout' });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // Invalidate all refresh tokens
      await user.save();

      console.log('Password reset:', { id: user._id, email: user.email });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Server error during password reset' });
    }
  }

  // Verify OTP
  static async verifyOTP(req, res) {
    try {
      // Validation is handled by middleware, so we can proceed

      const { email, otp } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Check OTP attempts
      if (user.otpAttempts >= 5) {
        return res.status(429).json({ error: 'Too many OTP attempts. Please request a new code.' });
      }

      // Verify OTP
      if (!user.verifyOTP(otp)) {
        user.otpAttempts += 1;
        await user.save();
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = TokenManager.generateTokens(user._id);
      
      // Store refresh token
      await user.addRefreshToken(refreshToken, req.get('User-Agent'), req.ip);

      // Set secure cookies
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      console.log('Email verified via OTP:', { id: user._id, email: user.email });

      res.json({
        message: 'Email verified successfully',
        user,
        tokens: { accessToken, refreshToken }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Server error during OTP verification' });
    }
  }

  // Resend OTP
  static async resendOTP(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      // Send OTP email
      try {
        await EmailService.sendOTPEmail(user, otp);
      } catch (emailError) {
        console.error('OTP resend email failed:', emailError);
        return res.status(500).json({ error: 'Failed to send OTP email' });
      }

      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('OTP resend error:', error);
      res.status(500).json({ error: 'Server error during OTP resend' });
    }
  }

  // Request password reset
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: 'If the email exists, a reset link has been sent.' });
      }

      const resetToken = user.createPasswordResetToken();
      await user.save();

      try {
        await EmailService.sendPasswordResetEmail(user, resetToken);
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return res.status(500).json({ error: 'Failed to send reset email' });
      }

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      console.log('Email verified:', { id: user._id, email: user.email });

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Server error during email verification' });
    }
  }

  // Get current user
  static async getProfile(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = AuthController;