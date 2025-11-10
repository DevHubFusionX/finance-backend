const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { auth, optionalAuth } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter, sanitizeInput } = require('../middleware/security');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordResetValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Routes
router.post('/register', 
  authLimiter, 
  sanitizeInput, 
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

router.post('/login', 
  authLimiter, 
  sanitizeInput, 
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

router.post('/refresh', 
  sanitizeInput,
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidationErrors,
  AuthController.refresh
);

router.post('/logout', 
  optionalAuth, 
  AuthController.logout
);

router.get('/verify-email/:token', 
  AuthController.verifyEmail
);

router.post('/forgot-password', 
  passwordResetLimiter, 
  sanitizeInput,
  body('email').isEmail().normalizeEmail(),
  AuthController.forgotPassword
);

router.post('/reset-password/:token', 
  passwordResetLimiter, 
  sanitizeInput, 
  passwordResetValidation, 
  AuthController.resetPassword
);

router.post('/verify-otp',
  sanitizeInput,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
  ],
  AuthController.verifyOTP
);

router.post('/resend-otp',
  authLimiter,
  sanitizeInput,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  AuthController.resendOTP
);

router.get('/profile', 
  auth, 
  AuthController.getProfile
);

module.exports = router;