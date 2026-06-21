const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const { REFRESH_COOKIE_OPTIONS } = require('./auth.util');

// ── Login Limiter ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Signup Limiter ────────────────────────────────────────────────────────────
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many accounts created. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Refresh Limiter ──────────────────────────────────────────────────────────
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many refresh attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Profile Limiter ──────────────────────────────────────────────────────────
// ✅ Uses ipKeyGenerator for proper IPv6 handling
const profileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req, res) => {
    // If user is authenticated, use their ID
    if (req.user?.user_id) {
      return `profile-${req.user.user_id}`;
    }
    // Use ipKeyGenerator helper for IPv6 compatibility
    return ipKeyGenerator(req, res);
  },
  message: {
    success: false,
    message: 'Too many profile updates. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Password Limiter ─────────────────────────────────────────────────────────
// ✅ Uses ipKeyGenerator for proper IPv6 handling
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) => {
    // If user is authenticated, use their ID
    if (req.user?.user_id) {
      return `password-${req.user.user_id}`;
    }
    // Use ipKeyGenerator helper for IPv6 compatibility
    return ipKeyGenerator(req, res);
  },
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Forgot Password Limiter ──────────────────────────────────────────────────
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  signupLimiter,
  refreshLimiter,
  profileLimiter,
  passwordLimiter,
  forgotPasswordLimiter,
  REFRESH_COOKIE_OPTIONS,
};