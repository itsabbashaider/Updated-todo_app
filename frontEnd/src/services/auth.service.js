import axiosInstance from './axios-instance.service';

/**
 * User Service
 * Handles: API calls only
 * Does NOT handle: token storage, auth state, business logic
 */

// ==========================================
// AUTH OPERATIONS
// ==========================================

export const signup = (email, password, firstName, lastName) =>
  axiosInstance.post('/users/signup', {
    email,
    password,
    firstName,
    lastName,
  });

export const login = async (email, password) => {
  const response = await axiosInstance.post('/users/login', {
    email,
    password,
  });

  const accessToken = response?.data?.data?.accessToken;

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }

  return response;
};

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
  axiosInstance.get('/users/me', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });

export const updateProfile = (updates) =>
  axiosInstance.put('/users/me', updates);

// ==========================================
// PASSWORD OPERATIONS
// ==========================================

export const changePassword = (currentPassword, newPassword) =>
  axiosInstance.post('/users/change-password', {
    currentPassword,
    newPassword,
  });

// ==========================================
// SECURITY QUESTIONS
// ==========================================

export const getSecurityQuestionsForUser = () =>
  axiosInstance.get('/users/me/security-questions');

export const updateSecurityAnswers = (
  questionId1,
  answer1,
  questionId2,
  answer2
) =>
  axiosInstance.post('/users/me/security-questions', {
    questionId1,
    answer1: answer1.trim(),
    questionId2,
    answer2: answer2.trim(),
  });