const jwt = require('jsonwebtoken');

// ── JWT Secrets ──────────────────────────────────────────────────────────────

const getJwtSecret = () => process.env.JWT_SECRET || 'taskflow-local-dev-secret';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'taskflow-refresh-secret';

// ── Token Generators ─────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, email: user.email },
    getJwtSecret(),
    { expiresIn: '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { user_id: user.user_id },
    getRefreshSecret(),
    { expiresIn: '30d' }
  );

// ── Token Verification ───────────────────────────────────────────────────────

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    throw new Error('Invalid or expired access token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getRefreshSecret());
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
};

// ── Email Validation ─────────────────────────────────────────────────────────

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// ── Answer Normalization ────────────────────────────────────────────────────

const normalizeAnswer = (answer) => String(answer || '').trim().toLowerCase();

// ── Password Validation ──────────────────────────────────────────────────────

const isValidPassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  return true;
};

const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
};

// ── User Response Formatter ──────────────────────────────────────────────────
// ✅ FIXED: Use correct snake_case database field names

const getUserResponse = (user) => ({
  id: user.user_id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  lastLogin: user.last_login,
});

// ── Cookie Helpers ───────────────────────────────────────────────────────────

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
};

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // JWT Secrets
  getJwtSecret,
  getRefreshSecret,

  // Token Generation
  generateAccessToken,
  generateRefreshToken,

  // Token Verification
  verifyAccessToken,
  verifyRefreshToken,

  // Email
  normalizeEmail,
  isValidEmail,

  // Security Answers
  normalizeAnswer,

  // Password
  isValidPassword,
  validatePasswordStrength,

  // User Response
  getUserResponse,

  // Cookies
  REFRESH_COOKIE_OPTIONS,
  setRefreshCookie,
  clearRefreshCookie,
};