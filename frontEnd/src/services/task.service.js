import axiosInstance from "./axios-instance.service";

export const getTasks = () =>
  axiosInstance.get("/tasks");

export const createTask = (data) =>
  axiosInstance.post("/tasks", data);

export const updateTask = (task_id, data) =>
  axiosInstance.put(`/tasks/${task_id}`, data);

export const deleteTask = (task_id) =>
  axiosInstance.delete(`/tasks/${task_id}`);
