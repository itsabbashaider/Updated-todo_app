import axiosInstance from './axios-instance.service';

/**
 * Task Service
 * Handles: API calls only
 * Does NOT handle: filtering, sorting, pagination (backend does this)
 * 
 * Note: axiosInstance baseURL is http://localhost:5000/api
 * So we only use paths like /tasks, /tasks/:id
 */

// ==========================================
// GET TASKS
// ==========================================

export const getTasks = (filters = {}) => {
  const params = new URLSearchParams();

  // Add pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  // Add filters
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);

  return axiosInstance.get(`/tasks?${params.toString()}`);
};

// ==========================================
// CREATE TASK
// ==========================================

export const createTask = (taskData) =>
  axiosInstance.post('/tasks', taskData);

// ==========================================
// UPDATE TASK
// ==========================================

export const updateTask = (taskId, updates) =>
  axiosInstance.put(`/tasks/${taskId}`, updates);

// ==========================================
// DELETE TASK
// ==========================================

export const deleteTask = (taskId) =>
  axiosInstance.delete(`/tasks/${taskId}`);