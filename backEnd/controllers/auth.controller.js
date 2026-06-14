const authService   = require('../services/auth.service');
const asyncHandler  = require('../middlewares/async-handler.middleware');
const HTTP_STATUSES = require('../constants/http-status.constant');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   30 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
};

// Signup
exports.signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;
  const result = await authService.signup(email, password, firstName, lastName, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2);
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

// Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { firstName, lastName, email } = req.body;

  try {
    const updatedUser = await authService.updateProfile(userId, {
      firstName,
      lastName,
      email,
    });

    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
    
  } catch (error) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to update profile settings.' }
    });
  }
};

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: 'Password changed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to change password.' }
    });
  }
});

// Get security questions (all available questions - for settings form dropdown)
exports.getSecurityQuestions = asyncHandler(async (req, res) => {
  const questions = authService.getSecurityQuestions();
  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: questions,
  });
});

// ✅ NEW: Get a SPECIFIC USER's security questions by email (for verify page)
exports.getUserSecurityQuestions = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: 'Email is required' },
    });
  }

  try {
    const questions = await authService.getUserSecurityQuestions(email);
    
    res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to retrieve security questions' },
    });
  }
});

// ✅ UPDATED: Verify security answers with question IDs
exports.verifySecurityAnswers = asyncHandler(async (req, res) => {
  const { email, questionId1, questionId2, answer1, answer2 } = req.body;

  if (!email || !answer1 || !answer2) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: 'Email and security answers required' },
    });
  }

  // Question IDs are optional for backwards compatibility, but recommended
  if (!questionId1 || !questionId2) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: 'Question IDs are required' },
    });
  }

  try {
    const result = await authService.verifySecurityAnswers(email, questionId1, questionId2, answer1, answer2);
    
    res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: {
        resetToken: result.resetToken,
        message: result.message,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to verify security answers' },
    });
  }
});

// Reset password with reset token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: 'Reset token and new password required' },
    });
  }

  try {
    const user = await authService.resetPassword(resetToken, newPassword);
    
    res.status(HTTP_STATUSES.OK).json({
      success: true,
      data: user,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to reset password' },
    });
  }
});

// Update security questions (from settings)
exports.updateSecurityQuestions = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;

  if (!securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: 'All security questions and answers are required' },
    });
  }

  try {
    const result = await authService.updateSecurityQuestions(
      userId,
      securityQuestion1,
      securityAnswer1,
      securityQuestion2,
      securityAnswer2,
    );

    res.status(HTTP_STATUSES.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(HTTP_STATUSES.BAD_REQUEST).json({
      success: false,
      error: { message: error.message || 'Failed to update security questions' },
    });
  }
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.status(HTTP_STATUSES.OK).json({ success: true, message: 'Logged out successfully' });
});