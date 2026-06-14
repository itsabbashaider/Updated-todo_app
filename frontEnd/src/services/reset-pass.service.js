import axiosInstance from './axios-instance.service';

/**
 * Password Reset Service
 * Handles: security questions, verification, password reset
 */

// ==========================================
// PUBLIC API CALLS
// ==========================================

export const getSecurityQuestions = () =>
  axiosInstance.get('/users/security-questions');

export const getSecurityQuestionsByEmail = (email) =>
  axiosInstance.get('/users/security-questions/user', {
    params: { email },
  });

export const verifySecurityAnswers = (email, questionId1, questionId2, answer1, answer2) =>
  axiosInstance.post('/users/verify-security-answers', {
    email,
    questionId1,
    questionId2,
    answer1: answer1.trim(),
    answer2: answer2.trim(),
  });

export const resetPassword = (resetToken, newPassword) =>
  axiosInstance.post('/users/reset-password', {
    resetToken,
    newPassword,
  });