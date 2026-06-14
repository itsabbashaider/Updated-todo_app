const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

const { User } = require('../models');
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors-classes.util');

const SECURITY_QUESTIONS = require('../constants/security-questions.constant');

const getJwtSecret     = () => process.env.JWT_SECRET          || 'taskflow-local-dev-secret';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET  || 'taskflow-refresh-secret';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail   = (email) => /\S+@\S+\.\S+/.test(email);

// ✅ NEW: Normalize security answer (trim + lowercase)
const normalizeAnswer = (answer) => String(answer || '').trim().toLowerCase();

const getUserResponse = (user) => ({
  id:        user.user_id,
  email:     user.email,
  firstName: user.firstName,
  lastName:  user.lastName,
  lastLogin: user.lastLogin,
});

// ── Token generators ─────────────────────────────────────────────────────────

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

exports.generateAccessToken  = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateToken        = generateAccessToken; // backwards compat

// ── Signup ───────────────────────────────────────────────────────────────────

exports.signup = async (email, password, firstName, lastName, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail))  throw new BadRequestError('Enter a valid email');
  if (password.length < 6)             throw new BadRequestError('Password must be at least 6 characters');
  if (!securityAnswer1 || !securityAnswer2) throw new BadRequestError('Security answers required');

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) throw new BadRequestError('Email already registered');

  const user = await User.create({
    email:           normalizedEmail,
    password:        await bcrypt.hash(password, 10),
    firstName:       firstName || null,
    lastName:        lastName  || null,
    securityQuestion1,
    // ✅ Use normalizeAnswer helper
    securityAnswer1: await bcrypt.hash(normalizeAnswer(securityAnswer1), 10),
    securityQuestion2,
    // ✅ Use normalizeAnswer helper
    securityAnswer2: await bcrypt.hash(normalizeAnswer(securityAnswer2), 10),
    isEmailVerified: true,
    lastLogin:       new Date(),
  });

  return {
    user:         getUserResponse(user),
    accessToken:  generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

// ── Login ────────────────────────────────────────────────────────────────────

exports.login = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user)                            throw new UnauthorizedError('Invalid email or password');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)                 throw new UnauthorizedError('Invalid email or password');

  if (!user.isActive)                   throw new UnauthorizedError('Account is deactivated');

  user.lastLogin = new Date();
  await user.save();

  return {
    user:         getUserResponse(user),
    accessToken:  generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

// ── Verify access token ──────────────────────────────────────────────────────

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

// ── Refresh tokens ───────────────────────────────────────────────────────────

exports.refreshTokens = (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshSecret());
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return {
    accessToken:  jwt.sign({ user_id: decoded.user_id }, getJwtSecret(),     { expiresIn: '15m' }),
    refreshToken: jwt.sign({ user_id: decoded.user_id }, getRefreshSecret(), { expiresIn: '30d' }),
  };
};

// ── Get user by ID ───────────────────────────────────────────────────────────

exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  if (!user) throw new NotFoundError('User not found');

  return user;
};

// ── Update user profile (firstName, lastName, email only) ──────────────────────

exports.updateProfile = async (userId, updates) => {
  const { firstName, lastName, email } = updates;

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  // Update firstName/lastName
  if (firstName !== undefined) user.firstName = firstName.trim() || null;
  if (lastName !== undefined)  user.lastName  = lastName.trim()  || null;

  // Update email (check for duplicates)
  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) throw new BadRequestError('Invalid email format');

    const existingUser = await User.findOne({
      where: { 
        email: normalizedEmail, 
        user_id: { [require('sequelize').Op.ne]: userId } 
      }
    });
    if (existingUser) throw new BadRequestError('Email already in use');

    user.email = normalizedEmail;
  }

  await user.save();

  return getUserResponse(user);
};

// ── Change password (separate from profile) ────────────────────────────────────

exports.changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new BadRequestError('New password must be at least 6 characters');
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('New password must be different from current password');
  }

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new BadRequestError('Current password is incorrect');

  // Update password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return getUserResponse(user);
};

// ── Get security questions ───────────────────────────────────────────────────

exports.getSecurityQuestions = () => {
  return Object.values(SECURITY_QUESTIONS).map(q => ({
    id: q.id,
    text: q.text,
  }));
};

// ✅ NEW: Get a specific user's security questions by email (for verification page)
exports.getUserSecurityQuestions = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new BadRequestError('Invalid email format');
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.securityQuestion1 || !user.securityQuestion2) {
    throw new BadRequestError('Security questions not configured for this account');
  }

  // ✅ FIX: Find questions by ID property instead of key lookup
  const question1 = Object.values(SECURITY_QUESTIONS).find(q => q.id === user.securityQuestion1);
  const question2 = Object.values(SECURITY_QUESTIONS).find(q => q.id === user.securityQuestion2);

  if (!question1 || !question2) {
    throw new BadRequestError('Invalid security questions stored for this account');
  }

  return [
    { id: question1.id, text: question1.text },
    { id: question2.id, text: question2.text },
  ];
};

// ✅ UPDATED: Verify security answers with question IDs
exports.verifySecurityAnswers = async (email, questionId1, questionId2, answer1, answer2) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.securityAnswer1 || !user.securityAnswer2) {
    throw new BadRequestError('Security questions not configured for this account');
  }

  // ✅ Validate that the questions match the ones the user set up
  if (user.securityQuestion1 !== questionId1 || user.securityQuestion2 !== questionId2) {
    throw new BadRequestError('Security answers are incorrect');
  }

  // ✅ Verify answers using normalized comparison
  const isAnswer1Valid = await bcrypt.compare(
    normalizeAnswer(answer1),
    user.securityAnswer1
  );

  const isAnswer2Valid = await bcrypt.compare(
    normalizeAnswer(answer2),
    user.securityAnswer2
  );

  if (!isAnswer1Valid || !isAnswer2Valid) {
    throw new BadRequestError('Security answers are incorrect');
  }

  // Generate reset token (valid for 15 minutes)
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  return {
    resetToken,
    message: 'Security answers verified. Use the reset token to change your password.',
  };
};

// ── Reset password with token ────────────────────────────────────────────────

exports.resetPassword = async (resetToken, newPassword) => {
  if (!resetToken || !newPassword) {
    throw new BadRequestError('Reset token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new BadRequestError('New password must be at least 6 characters');
  }

  const user = await User.findOne({
    where: {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: { [require('sequelize').Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  // Update password
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return getUserResponse(user);
};

// ── Update security questions ────────────────────────────────────────────────

exports.updateSecurityQuestions = async (userId, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2) => {
  if (!securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2) {
    throw new BadRequestError('All security questions and answers are required');
  }

  if (securityQuestion1 === securityQuestion2) {
    throw new BadRequestError('Please select two different security questions');
  }

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  // Hash answers with normalized values
  user.securityQuestion1 = securityQuestion1;
  user.securityAnswer1 = await bcrypt.hash(normalizeAnswer(securityAnswer1), 10);
  user.securityQuestion2 = securityQuestion2;
  user.securityAnswer2 = await bcrypt.hash(normalizeAnswer(securityAnswer2), 10);
  
  await user.save();

  return {
    success: true,
    message: 'Security questions updated successfully',
  };
};