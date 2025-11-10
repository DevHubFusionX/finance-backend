import authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  logger.info('User signup attempt', { email });
  
  const result = await authService.signup({ name, email, password });
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    ...result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  logger.info('User login attempt', { email });
  
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    message: 'Login successful',
    ...result
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = authService.getUserById(req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    user
  });
});

export {
  signup,
  login,
  getProfile
};