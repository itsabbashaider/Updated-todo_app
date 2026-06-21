import axiosInstance from './axios-instance.service';

/**
 * Auth Service
 * Uses snake_case throughout - matches backend exactly
 * No transformation needed
 */

// ==========================================
// AUTH OPERATIONS
// ==========================================

export const signup = (email, password, first_name, last_name, security_question_1, security_answer_1, security_question_2, security_answer_2) =>
  axiosInstance.post('/users/signup', {
    email,
    password,
    first_name,
    last_name,
    security_question_1,
    security_answer_1,
    security_question_2,
    security_answer_2,
  });

export const login = async (email, password) =>
  axiosInstance.post('/users/login', {
    email,
    password,
  });

export const logout = async () => {
  try {
    await axiosInstance.post('/users/logout');
  } finally {
    localStorage.removeItem('accessToken');
  }
};

// ==========================================
// PROFILE OPERATIONS
// ==========================================

export const getCurrentUser = () =>
  axiosInstance.get('/users/me');

export const updateProfile = (first_name, last_name, email) =>
  axiosInstance.put('/users/me', {
    first_name,
    last_name,
    email,
  });

// ==========================================
// PASSWORD OPERATIONS
// ==========================================

export const changePassword = (currentPassword, newPassword) =>
  axiosInstance.post('/users/change-password', {
    currentPassword,
    newPassword,
    confirmPassword: newPassword,
  });

// ==========================================
// SECURITY QUESTIONS
// ==========================================

export const getSecurityQuestions = () =>
  axiosInstance.get('/users/security-questions');

export const updateSecurityQuestions = (security_question_1, security_answer_1, security_question_2, security_answer_2) =>
  axiosInstance.put('/users/security-questions', {
    security_question_1,
    security_answer_1,
    security_question_2,
    security_answer_2,
  });