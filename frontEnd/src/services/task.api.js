import axiosInstance from "./axios.instance";

export const getTasks = () =>
  axiosInstance.get("/tasks");

export const getTask = (task_id) =>
  axiosInstance.get(`/tasks/${task_id}`);

export const createTask = (data) =>
  axiosInstance.post("/tasks", data);

export const updateTask = (task_id, data) =>
  axiosInstance.put(`/tasks/${task_id}`, data);

export const deleteTask = (task_id) =>
  axiosInstance.delete(`/tasks/${task_id}`);