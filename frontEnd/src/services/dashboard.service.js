import axiosInstance from './axios-instance.service';

export const getDashboard = () =>
  axiosInstance.get('/dashboard');