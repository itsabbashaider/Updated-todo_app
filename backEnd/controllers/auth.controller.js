const authService   = require('../services/auth.service');
const asyncHandler  = require('../middlewares/async-handler.middleware');
const HTTP_STATUSES = require('../constants/http-status.constant');

const { setRefreshCookie, clearRefreshCookie } = require('../utils/auth.util');

// Signup
exports.signup = asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, security_question_1, security_answer_1, security_question_2, security_answer_2 } = req.body;
  const result = await authService.signup(email, password, first_name, last_name, security_question_1, security_answer_1, security_question_2, security_answer_2);
  setRefreshCookie(res, result.refreshToken);

  res.status(HTTP_STATUSES.CREATED).json({
    success: true,
    data: {
      user:        result.user,
      accessToken: result.accessToken,
    },
  });
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  setRefreshCookie(res, result.refreshToken);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: {
      user:        result.user,
      accessToken: result.accessToken,
    },
  });
});

// Refresh
exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(HTTP_STATUSES.UNAUTHORIZED).json({
      success: false,
      error: { message: 'Refresh token required' },
    });
  }

  try {
    const tokens = authService.refreshTokens(refreshToken);
    setRefreshCookie(res, tokens.refreshToken);

    res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch {
    clearRefreshCookie(res);
    res.status(HTTP_STATUSES.UNAUTHORIZED).json({
      success: false,
      error: { message: 'Invalid or expired refresh token' },
    });
  }
});

// Get current user
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.user_id);
  res.status(HTTP_STATUSES.OK).json({ success: true, data: user });
});

// Update user profile (first_name, last_name, email only)
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { first_name, last_name, email } = req.body;

  const updatedUser = await authService.updateProfile(userId, {
    first_name,
    last_name,
    email,
  });

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully',
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(userId, currentPassword, newPassword);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// Get ALL available security questions (public, for settings form dropdown)
exports.getSecurityQuestions = asyncHandler(async (req, res) => {
  const questions = authService.getSecurityQuestions();
  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: questions,
  });
});

// Get a SPECIFIC USER's security questions by email (for verify page)
exports.getUserSecurityQuestions = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const questions = await authService.getUserSecurityQuestions(email);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: questions,
  });
});

// Verify security answers with question IDs
exports.verifySecurityAnswers = asyncHandler(async (req, res) => {
  const { email, question_id_1, question_id_2, answer_1, answer_2 } = req.body;
  const result = await authService.verifySecurityAnswers(email, question_id_1, question_id_2, answer_1, answer_2);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: {
      resetToken: result.resetToken,
      message: result.message,
    },
  });
});

// Reset password with reset token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const user = await authService.resetPassword(resetToken, newPassword);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: user,
    message: 'Password reset successfully',
  });
});

// Update security questions (from settings)
exports.updateSecurityQuestions = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { security_question_1, security_answer_1, security_question_2, security_answer_2 } = req.body;

  const result = await authService.updateSecurityQuestions(
    userId,
    security_question_1,
    security_answer_1,
    security_question_2,
    security_answer_2,
  );

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    message: result.message,
  });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.status(HTTP_STATUSES.OK).json({ success: true, message: 'Logged out successfully' });
});