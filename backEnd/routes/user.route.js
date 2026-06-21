const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const  validateRequest  = require('../middlewares/validate-request.middleware');

// ── Import Schemas ───────────────────────────────────────────────────────────
const {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  updateSecurityQuestionsSchema,
  updateProfileSchema,
  verifySecurityAnswersSchema,
} = require('../schemas/auth.schema');

// ── Import Limiters ──────────────────────────────────────────────────────────
const {
  loginLimiter,
  signupLimiter,
  refreshLimiter,
  profileLimiter,
  passwordLimiter,
  forgotPasswordLimiter,
} = require('../utils/limiters.util');

// ── Routes ───────────────────────────────────────────────────────────────────

// Signup Route
router.post('/signup', signupLimiter, validateRequest(signupSchema), authController.signup);

// Login Route
router.post('/login', loginLimiter, validateRequest(loginSchema), authController.login);

// Refresh Route
router.post('/refresh', refreshLimiter, authController.refresh);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Update user profile (first_name, last_name, email only)
router.put('/me', authenticate, profileLimiter, validateRequest(updateProfileSchema), authController.updateProfile);

// Change password (separate endpoint for security)
router.post('/change-password', authenticate, passwordLimiter, validateRequest(changePasswordSchema), authController.changePassword);

// Logout Route
router.post('/logout', authenticate, authController.logout);

// ── Forgot Password Routes ───────────────────────────────────────────────────

// Get ALL available security questions (public, for settings form dropdown)
router.get('/security-questions', authController.getSecurityQuestions);

// Get a SPECIFIC USER's security questions by email (for verify page)
router.get('/security-questions/user', authController.getUserSecurityQuestions);

// Verify security answers with question IDs
router.post('/verify-security-answers', forgotPasswordLimiter, validateRequest(verifySecurityAnswersSchema), authController.verifySecurityAnswers);

// Reset password with token
router.post('/reset-password', forgotPasswordLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);

// Update security questions (settings page)
router.put('/security-questions', authenticate, validateRequest(updateSecurityQuestionsSchema), authController.updateSecurityQuestions);

module.exports = router;