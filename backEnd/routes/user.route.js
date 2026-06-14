const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate   = require('../middlewares/auth.middleware');
const rateLimit      = require('express-rate-limit');

// Integration: Import your validation utility
const { validateProfileUpdate } = require('../utils/email-validation.util');

// ── Rate Limiters ─────────────────────────────────────────────────────────────

// Login: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Signup: 5 accounts per hour per IP
const signupLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             5,
  message: {
    success: false,
    message: 'Too many accounts created. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Refresh: 30 requests per 15 minutes per IP
const refreshLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             30,
  message: {
    success: false,
    message: 'Too many refresh attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Profile updates: 10 per hour per user
const profileLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             10,
  keyGenerator:    (req) => req.user?.user_id || req.ip,
  message: {
    success: false,
    message: 'Too many profile updates. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Password change: 5 per hour per user (stricter)
const passwordLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             5,
  keyGenerator:    (req) => req.user?.user_id || req.ip,
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Forgot password: 5 attempts per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Signup Route
router.post('/signup', signupLimiter, validateProfileUpdate, authController.signup);

// Login Route
router.post('/login', loginLimiter, authController.login);

// Refresh Route
router.post('/refresh', refreshLimiter, authController.refresh);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Update user profile (firstName, lastName, email only)
router.put('/me', authenticate, profileLimiter, validateProfileUpdate, authController.updateProfile);

// Change password (separate endpoint for security)
router.post('/change-password', authenticate, passwordLimiter, authController.changePassword);

// Logout Route
router.post('/logout', authenticate, authController.logout);

// ── Forgot Password Routes ────────────────────────────────────────────────────

// Get ALL available security questions (public, for settings form dropdown)
router.get('/security-questions', authController.getSecurityQuestions);

// Usage: GET /api/users/security-questions/user?email=user@example.com
router.get('/security-questions/user', authController.getUserSecurityQuestions);

router.post('/verify-security-answers', forgotPasswordLimiter, authController.verifySecurityAnswers);

// Reset password with token
router.post('/reset-password', forgotPasswordLimiter, authController.resetPassword);

// Update security questions (settings page)
router.put('/security-questions', authenticate, authController.updateSecurityQuestions);

module.exports = router;