// src/services/reset-pass.service.js

import axiosInstance from './axios-instance.service';

export const getSecurityQuestions = () =>
  axiosInstance.get('/users/security-questions');

export const getSecurityQuestionsByEmail = (email) =>
  axiosInstance.get('/users/security-questions/user', {
    params: { email: String(email).trim().toLowerCase() },
  });

export const verifySecurityAnswers = (email, question_id_1, question_id_2, answer_1, answer_2) =>
  axiosInstance.post('/users/verify-security-answers', {
    email: String(email).trim().toLowerCase(),
    question_id_1,
    question_id_2,
    answer_1: answer_1.trim(),
    answer_2: answer_2.trim(),
  });


export const resetPassword = (resetToken, newPassword, confirmPassword) =>
  axiosInstance.post('/users/reset-password', {
    resetToken,
    newPassword,
    confirmPassword, 
  });